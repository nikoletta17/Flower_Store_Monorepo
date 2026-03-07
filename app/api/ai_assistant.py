from fastapi import APIRouter, status
from ..schemas.ai_chat import ChatRequest, ChatResponse
from ..services.ai_service import run_ai_assistant

router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)

@router.post("/chat/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_assistant(request: ChatRequest):
    ai_response_text = await run_ai_assistant(request.message)
    return ChatResponse(response=ai_response_text)