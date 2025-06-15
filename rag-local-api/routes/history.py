from fastapi import APIRouter, HTTPException
from config.history import get_full_history

router = APIRouter()

@router.get("/history")
async def get_chat_history():
    return get_full_history()