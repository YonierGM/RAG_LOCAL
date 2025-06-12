from fastapi import APIRouter
import requests

router = APIRouter()

def get_available_models() -> list[str]:
    try:
        response = requests.get("http://ollama:11434/api/tags")
        response.raise_for_status()
        models = response.json().get("models", [])

        # Lista de palabras clave típicas de modelos de embeddings
        excluded_keywords = ["embed", "embedding", "bge", "e5", "mxbai"]

        # Función heurística para filtrar modelos que no sean embeddings
        def is_chat_model(model_name: str) -> bool:
            return not any(keyword in model_name.lower() for keyword in excluded_keywords)

        # Filtrar modelos válidos para chat
        return [m["name"] for m in models if is_chat_model(m["name"])]

    except Exception as e:
        print(f"Error al obtener modelos: {e}")
        return []

@router.get("/models", tags=["Modelos"])
def list_models():
    return {"models": get_available_models()}
