import os
import tempfile
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config import settings
from config.utils import validate_file, LOADERS
from langchain_core.documents import Document

router = APIRouter()

class IngestRequest(BaseModel):
    chunk_size: str
    chunk_overlap: str

@router.post("/ingest")
async def ingest(files: List[UploadFile] = File(...),
    chunk_size: Optional[int] = Form(1000),
    chunk_overlap: Optional[int] = Form(50)):
    
    vectordb = settings.get_vectordb()
    if not files:
        raise HTTPException(status_code=400, detail="Debes enviar al menos un archivo.")
    
    if chunk_size <= 0:
        raise HTTPException(status_code=400, detail="chunk_size debe ser un número entero positivo.")
    if chunk_overlap < 0:
        raise HTTPException(status_code=400, detail="chunk_overlap no puede ser negativo.")
    
    if chunk_overlap >= chunk_size:
        raise HTTPException(status_code=400, detail="chunk_overlap debe ser menor que chunk_size.")

    total_chunks = 0
    indexed_files = []
    errors = []

    for file in files:
        validate_file(file)
        suffix = os.path.splitext(file.filename)[-1].lower()
        tmp_path = None

        if suffix not in LOADERS:
            errors.append({"file": file.filename, "error": f"Tipo de archivo no soportado: {suffix}"})
            continue

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name

            loader = LOADERS[suffix](tmp_path)
            raw_documents = loader.load()

            # Extraer texto de cada documento
            def extract_text(doc):
                if isinstance(doc, tuple):
                    return doc[0]
                elif isinstance(doc, Document):
                    return doc.page_content
                return str(doc)

            if not raw_documents or all(len(extract_text(doc).strip()) < 20 for doc in raw_documents):
                raise HTTPException(
                    status_code=400,
                    detail=f"El archivo {file.filename} parece estar escaneado o no contiene texto extraíble."
                )

            # Asegurar que todos los documentos estén en formato Document
            processed_documents = []
            for doc in raw_documents:
                if isinstance(doc, tuple):
                    content, metadata = doc
                    if not isinstance(metadata, dict):
                        metadata = {"source": file.filename}
                    processed_documents.append(Document(page_content=content, metadata=metadata))
                elif isinstance(doc, Document):
                    processed_documents.append(doc)
                else:
                    processed_documents.append(Document(page_content=str(doc), metadata={"source": file.filename}))

            splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            docs = splitter.split_documents(processed_documents)
            vectordb.add_documents(docs)

            total_chunks += len(docs)
            indexed_files.append(file.filename)

        except HTTPException as ve:
            errors.append({"file": file.filename, "error": ve.detail})

        except Exception as e:
            error_msg = str(e)

            # Detectar errores comunes de PDFs corruptos
            if "Invalid Elementary Object" in error_msg or "Could not read malformed PDF file" in error_msg:
                friendly_error = (
                    f"El archivo '{file.filename}' parece estar dañado o contener contenido no estándar. "
                    "Asegúrate de subir un PDF válido con texto extraíble."
                )
            else:
                # Fallback genérico para otros errores
                friendly_error = f"Hubo un error al procesar '{file.filename}': {error_msg}"

            errors.append({"file": file.filename, "error": friendly_error})

        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
            await file.close()

    response = {
        "status": "partial_success" if errors else "indexed",
        "files_indexed": indexed_files,
        "total_chunks": total_chunks,
    }
    if errors:
        response["errors"] = errors

    return response

@router.delete("/reset_embeddings")
async def reset_embeddings():
    try:
        # Reinicia la base de datos vectorial y recrea la instancia
        settings.reset_vectordb()
        return {
            "status": "ok",
            "message": "Base de datos reseteada correctamente y lista para nueva ingestión."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al resetear base de datos: {e}")

@router.get("/debug_collections")
async def debug_collections_endpoint():
    return settings.list_all_chroma_collections()