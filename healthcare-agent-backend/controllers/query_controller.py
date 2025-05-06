from typing import Optional
from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from agents.guided_conversations.orchestrator_main import Orchestrator
import services.extraction as extraction
from services.blob_service import BlobStorageService
router = APIRouter()
orchestrator = Orchestrator()
blob_service = BlobStorageService()
# Pydantic models for response clarity
class ConversationStartResponse(BaseModel):
    session_id: str
    message: str
 
class UserMessageRequest(BaseModel):
    user_input: str
 
class TextRequest(BaseModel):
    text: str
 
class UserMessageResponse(BaseModel):
    message: str
    is_conversation_over: bool
 
# Update this model to match the actual response structure
class UploadResponse(BaseModel):
    message: str
    is_conversation_over: bool = False
    file_url: Optional[str] = None
    user_details: Optional[dict] = None
 
class FinalizeResponse(BaseModel):
    message: str
 
class ConversationHistoryResponse(BaseModel):
    history: list  # explicitly define as an array
# Explicit endpoints clearly handling the conversation lifecycle
@router.post("/conversation/start", response_model=ConversationStartResponse, summary="Start a new conversation")
async def start_conversation():
    try:
        result = await orchestrator.start_conversation()
        return ConversationStartResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.post("/conversation/{session_id}/message", response_model=UserMessageResponse, summary="Handle user message")
async def handle_user_message(session_id: str, request: UserMessageRequest):
    try:
        result = await orchestrator.handle_user_message(session_id, request.user_input)
        return UserMessageResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.post("/conversation/{session_id}/upload", response_model=UploadResponse)
async def upload_prescription(session_id: str, file: UploadFile = File(...)):
    """
    Upload a prescription file, process with Document Intelligence and return extracted details.
    """
    try:
        # Read file content
        file_content = await file.read()
        content_type = file.content_type
        
        # Get blob service
        blob_service = BlobStorageService()
        
        # Upload to blob storage
        blob_metadata = await blob_service.upload_file(
            file_bytes=file_content,
            session_id=session_id,
            content_type=content_type
        )
        
        # Get the blob URL
        file_url = blob_metadata["url"]
        
        # Process the prescription via orchestrator
        result = await orchestrator.handle_prescription_upload(
            session_id=session_id,
            file_urls=[file_url]
        )
        
        # Format the response to match UploadResponse model
        return {
            "message": result["message"],
            "is_conversation_over": result.get("is_conversation_over", False),
            "file_url": file_url,
            "user_details": result.get("user_details", {})
        }
        
    except Exception as e:
        error_message = f"Error uploading prescription: {str(e)}"
        print(f"[ERROR] {error_message}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_message)
 
@router.post("/conversation/{session_id}/finalize", summary="Finalize conversation and send email")
async def finalize_conversation(session_id: str):
    try:
        print(f"[API] Finalizing conversation and sending email for session: {session_id}")
        result = await orchestrator.finalize_conversation_and_send_email(session_id)
        return result
    except Exception as e:
        print(f"[API] Error finalizing conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.post("/recognize-entities")
async def recognize_entities(request: TextRequest):
    try:
        response = await extraction.recognize_entities(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# New Explicit Endpoint for retrieving conversation history
@router.get("/conversation/{session_id}/history", response_model=ConversationHistoryResponse, summary="Get conversation history explicitly")
async def get_conversation_history(session_id: str):
    try:
        history = await orchestrator.get_conversation_history(session_id)
        # Explicitly ensure history is always returned as an array
        # if not history:
        #     history = []
        # return {"history": history}
        return {"history": history.get( "history", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@router.get("/conversation/sessions", summary="Retrieve all historical conversation sessions explicitly")
async def get_all_sessions():
    try:
        items = list(orchestrator.container.query_items(
            query="SELECT c.session_id, c.timestamp FROM c",
            enable_cross_partition_query=True
        ))
        sessions = [
            {"session_id": item["session_id"], "created_at": item["timestamp"]}
            for item in items
        ]
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))