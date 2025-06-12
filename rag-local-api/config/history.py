from typing import List, Dict
from datetime import datetime, timezone

conversation_history: List[Dict[str, str]] = []

def get_last_pairs(k: int = 2) -> List[Dict[str, str]]:
    return conversation_history[-k:]

def add_pair(question: str, answer: str) -> None:
    # Obtener la fecha y hora en UTC con info de zona horaria
    timestamp_utc = datetime.now(timezone.utc).isoformat()
    
    conversation_history.append({
        "question": question,
        "answer": answer,
        "timestamp": timestamp_utc
    })
