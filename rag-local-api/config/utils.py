import os

import requests
from fastapi import UploadFile, HTTPException

from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader


MAX_FILE_SIZE_MB = 8
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx"}

LOADERS = {
    ".pdf": PyPDFLoader,
    ".docx": Docx2txtLoader,
    ".txt": lambda path: TextLoader(path, encoding="utf-8"),
}

def is_valid_model(model_name: str) -> bool:
    try:
        response = requests.get("http://ollama:11434/api/tags")
        response.raise_for_status()
        models = response.json().get("models", [])
        available = [m["name"] for m in models]
        return model_name in available
    except Exception as e:
        print(f"Error al validar modelo: {e}")
        return False

def validate_file(file: UploadFile):
    ext = os.path.splitext(file.filename)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no permitido: {ext}")

    file.file.seek(0, os.SEEK_END)
    size_mb = file.file.tell() / (1024 * 1024)
    file.file.seek(0)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"Archivo muy grande: {size_mb:.2f} MB (máx {MAX_FILE_SIZE_MB} MB)")
