import os
import shutil
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_chroma import Chroma
from chromadb import PersistentClient
from chromadb.config import Settings as ChromaSettings

EMBED_MODEL = "mxbai-embed-large"
CHROMA_DIR = "chroma_db_e5"
COLLECTION_NAME = "rag_collection"

# Embeddings para todo el proyecto
embeddings = OllamaEmbeddings(model=EMBED_MODEL)

def create_chat_model(model_name: str) -> ChatOllama:
    return ChatOllama(
        model=model_name,
        temperature=0.3,
    )

def create_vectordb():
    client = PersistentClient(
        path=CHROMA_DIR,
        settings=ChromaSettings(allow_reset=True)
    )
    return Chroma(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR
    )

# una variable global para manejar la instancia, de forma dinámica.
_vectordb = None

def get_vectordb():
    global _vectordb
    if _vectordb is None:
        _vectordb = create_vectordb()
    return _vectordb

def reset_vectordb():
    global _vectordb
    # Si existe, resetea la base lógica
    if _vectordb:
        _vectordb._client.reset()
        _vectordb._client = None
        _vectordb = None

    # Borrar únicamente los subdirectorios que correspondan a ingestas
    if os.path.exists(CHROMA_DIR):
        for item in os.listdir(CHROMA_DIR):
            item_path = os.path.join(CHROMA_DIR, item)
            if os.path.isdir(item_path):
                shutil.rmtree(item_path)
    # Recrea la instancia de vectorstore
    _vectordb = create_vectordb()
    return _vectordb

def get_chroma_client():
    # Es importante que el cliente persista en la misma ruta
    return PersistentClient(
        path=CHROMA_DIR,
        settings=ChromaSettings(allow_reset=True)
    )

def list_all_chroma_collections():
    client = get_chroma_client()
    try:
        # Recupera todas las colecciones que el cliente conoce
        collections = client.list_collections()
        if not collections:
            return "No hay colecciones en la base de datos."
        
        info = []
        for col in collections:
            # Aquí puedes acceder al nombre lógico de la colección y su ID
            info.append({
                "name": col.name,
                "id": col.id,
                "count": col.count(), # Número de documentos en la colección
                "metadata": col.metadata # Cualquier metadato asociado a la colección
            })
        return info
    except Exception as e:
        return f"Error al listar colecciones: {e}"