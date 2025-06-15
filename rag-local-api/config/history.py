import os
import json
from redis import Redis
from typing import List, Dict
from datetime import datetime, timezone

# Estas variables son las que definimos en docker-compose.yml para el servicio 'api'
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

# Conectar a Redis
try:
    redis_client = Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
    # decode_responses=True hace que Redis devuelva strings en lugar de bytes
    redis_client.ping() # Verifica la conexión
    print("Conexión a Redis exitosa.")
except Exception as e:
    print(f"Error al conectar a Redis: {e}")

DEFAULT_HISTORY_REDIS_KEY = "conversation_history:default_single_user"

def _load_history_from_redis() -> List[Dict[str, str]]:
    try:
        history_json = redis_client.get(DEFAULT_HISTORY_REDIS_KEY)
        if history_json:
            return json.loads(history_json)
    except Exception as e:
        print(f"Error al cargar historial desde Redis: {e}")
    return []

def _save_history_to_redis(history: List[Dict[str, str]]) -> None:
    try:
        redis_client.set(DEFAULT_HISTORY_REDIS_KEY, json.dumps(history))
    except Exception as e:
        print(f"Error al guardar historial en Redis: {e}")

def get_full_history() -> List[Dict[str, str]]:
    return _load_history_from_redis()

def get_last_pairs(k: int = 2) -> List[Dict[str, str]]:
    current_history = _load_history_from_redis()
    return current_history[-k:] if len(current_history) > k else current_history

def add_pair(question: str, answer: str) -> None:
    current_history = _load_history_from_redis()
    
    # Obtener la fecha y hora en UTC con info de zona horaria
    timestamp_utc = datetime.now(timezone.utc).isoformat()
    
    current_history.append({
        "question": question,
        "answer": answer,
        "timestamp": timestamp_utc
    })
    _save_history_to_redis(current_history)