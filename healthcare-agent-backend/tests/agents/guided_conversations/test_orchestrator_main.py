import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from agents.guided_conversations.orchestrator_main import Orchestrator
from datetime import datetime
 
@pytest.fixture
def orchestrator():
    """Fixture to instantiate Orchestrator explicitly."""
    return Orchestrator()
 
@pytest.mark.asyncio
async def test_start_conversation(orchestrator):
    """Test starting a new conversation session explicitly."""
    response = await orchestrator.start_conversation()
 
    assert 'session_id' in response
    assert 'message' in response
    assert response['message'].startswith('Hello!')
 
@pytest.mark.asyncio
async def test_handle_user_message(orchestrator):
    """Test handling user message delegation explicitly."""
    session_id = 'test_session'
    user_input = 'I want to answer questions.'
 
    with patch.object(orchestrator.data_collection_agent, 'handle_user_input', new_callable=AsyncMock) as mock_handle:
        mock_handle.return_value = {"message": "Next question?", "is_conversation_over": False}
 
        response = await orchestrator.handle_user_message(session_id, user_input)
 
        mock_handle.assert_called_once_with(session_id, user_input)
        assert response['message'] == "Next question?"
        assert response['is_conversation_over'] is False
 
@pytest.mark.asyncio
async def test_handle_prescription_upload(orchestrator):
    """Test explicitly handling prescription image upload."""
    session_id = 'test_session'
    image_bytes = b'binary_image_data'
 
    with patch.object(orchestrator.data_collection_agent, 'extract_details_from_image', new_callable=AsyncMock) as mock_extract:
        mock_extract.return_value = {"medicine": "Paracetamol"}
 
        response = await orchestrator.handle_prescription_upload(session_id, image_bytes)
 
        mock_extract.assert_called_once_with(session_id, image_bytes)
        assert response["medicine"] == "Paracetamol"
 
@pytest.mark.asyncio
async def test_finalize_conversation_and_send_email(orchestrator):
    """Test explicitly finalizing conversation and sending email notifications."""
    session_id = 'test_session'
    mock_user_details = {"primary_email": "user@example.com"}
 
    with patch.object(orchestrator.container, 'query_items') as mock_query, \
         patch.object(orchestrator.email_agent, 'send_email', new_callable=AsyncMock) as mock_send_email:
 
        mock_query.return_value = iter([{"user_details": mock_user_details}])
        mock_send_email.return_value = "Email successfully sent."
 
        response = await orchestrator.finalize_conversation_and_send_email(session_id)
 
        mock_send_email.assert_called_once_with(mock_user_details)
        assert response['message'] == "Email successfully sent."
 
@pytest.mark.asyncio
async def test_finalize_conversation_no_details_found(orchestrator):
    """Test handling finalizing conversation with no session details explicitly."""
    session_id = 'invalid_session'
 
    with patch.object(orchestrator.container, 'query_items') as mock_query:
        mock_query.return_value = iter([])  # Empty result explicitly
 
        response = await orchestrator.finalize_conversation_and_send_email(session_id)
 
        assert response['message'] == "No details found for this session."
 
@pytest.mark.asyncio
async def test_get_conversation_history(orchestrator):
    """Test explicitly retrieving conversation history."""
    session_id = 'test_session'
    mock_history = [{"message": "Hello"}, {"message": "Hi there"}]
 
    with patch.object(orchestrator.container, 'query_items') as mock_query:
        mock_query.return_value = iter([{"conversation_history": mock_history}])
 
        response = await orchestrator.get_conversation_history(session_id)
 
        assert response['history'] == mock_history
 
@pytest.mark.asyncio
async def test_get_conversation_history_empty(orchestrator):
    """Test explicitly retrieving empty conversation history."""
    session_id = 'empty_session'
 
    with patch.object(orchestrator.container, 'query_items') as mock_query:
        mock_query.return_value = iter([])
 
        response = await orchestrator.get_conversation_history(session_id)
 
        assert response['history'] == []