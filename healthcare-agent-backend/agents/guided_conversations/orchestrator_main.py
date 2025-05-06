import os
import asyncio
from datetime import datetime
import json
from typing import List
from dotenv import load_dotenv
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
from semantic_kernel.functions import kernel_function
from azure.cosmos import CosmosClient, PartitionKey
 
from .data_collection import DataCollectionAgent
from .email_agent import EmailAgent
 
# Load environment variables explicitly
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.dev"))
 
class Orchestrator:
 
    def __init__(self):
 
        # Initialize Semantic Kernel explicitly
        self.kernel = Kernel()
 
        # Configure Azure OpenAI Chat Completion Service explicitly
        chat_service = AzureChatCompletion(
            deployment_name='chat-completion',
            api_version="2025-01-01-preview",
            endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            service_id="orchestrator_service",
        )
        self.kernel.add_service(chat_service)
 
        # Initialize Data Collection and Email agents explicitly
        self.data_collection_agent = DataCollectionAgent()
        self.email_agent = EmailAgent()
 
        # Set up Cosmos DB client explicitly
        self.cosmos_client = CosmosClient(
            os.getenv("COSMOS_ENDPOINT"), os.getenv("COSMOS_KEY")
        )
 
        self.database_name = os.getenv("COSMOS_DB")
        self.container_name = os.getenv("COSMOS_CONTAINER")
 
        self.database = self.cosmos_client.create_database_if_not_exists(
            id=self.database_name
        )
 
        self.container = self.database.create_container_if_not_exists(
            id=self.container_name,
            partition_key=PartitionKey(path="/session_id"),
            offer_throughput=400
        )
 
    @kernel_function
    async def start_conversation(self):
        """
        Explicitly start a new conversation session and return the initial message.
        """
        session_id = str(datetime.utcnow().timestamp())
        initial_message = (
            "Hello! Would you like to upload an image of your prescription "
            "or answer some questions about it?"
        )
        print('[Orchestrator] New Session ID:', session_id)
        return {"session_id": session_id, "message": initial_message}
 
    @kernel_function
    async def handle_user_message(self, session_id: str, user_input: str):
        """
        Explicitly handle user messages by delegating to Data Collection Agent.
        If conversation completes, explicitly trigger email sending.
        """
        response = await self.data_collection_agent.handle_user_input(session_id, user_input)
        print('[Orchestrator] Response from DataCollectionAgent:', response)
 
        # Check explicitly if the conversation is complete
        if response.get('is_conversation_over', False):
            print("[Orchestrator] Conversation completed. Now triggering email agent explicitly.")
            email_result = await self.finalize_conversation_and_send_email(session_id)
            print('[Orchestrator] Final Email Response:', email_result)
 
        return response
    
    async def handle_prescription_upload(self, session_id: str, file_urls: List[str]):
        """
        Handle prescription uploads by calling document_upload_input handler
        and ensuring the conversation state is properly updated.
        
        Args:
            session_id: The session identifier
            file_urls: URLs to the uploaded files in blob storage
            
        Returns:
            Dict with message and conversation status
        """
        print(f"[Orchestrator] Processing prescription upload for session {session_id}")
        
        try:
            # Use the existing method in DataCollectionAgent
            result = await self.data_collection_agent.handle_document_upload_input(
                session_id=session_id,
                file_urls=file_urls
            )
            
            # Ensure the conversation can continue with knowledge of document-extracted info
            print(f"[Orchestrator] Document upload processed successfully: {result}")
            return result
            
        except Exception as e:
            error_message = f"Error in handle_prescription_upload: {str(e)}"
            print(f"[ERROR] {error_message}")
            import traceback
            traceback.print_exc()
            return {
                "message": "I encountered an error processing your prescription. Please try again or provide the information manually.",
                "is_conversation_over": False
            }
        
    @kernel_function
    async def finalize_conversation_and_send_email(self, session_id: str):
        """
        Explicitly finalize conversation, fetch artifact from CosmosDB, and trigger email.
        """
        query = f"SELECT * FROM c WHERE c.session_id = '{session_id}'"
        items = list(self.container.query_items(query=query, enable_cross_partition_query=True))
 
        print('[Orchestrator] Items retrieved for session:', items)
 
        if not items:
            print('[Orchestrator] No details found for session:', session_id)
            return {"message": "No details found for this session."}
 
        user_details = items[0].get('artifact', {})
 
        # Debug print statement
        print("[Orchestrator] User details explicitly fetched for email:", user_details)
 
        email_response = await self.email_agent.send_email(user_details)
        print('[Orchestrator] Email agent response:', email_response)
 
        return {"message": email_response}
 
    @kernel_function
    async def get_conversation_history(self, session_id: str):
        """
        Explicitly retrieve full conversation history from Cosmos DB.
        """
        query = f"SELECT * FROM c WHERE c.session_id = '{session_id}'"
        items = list(self.container.query_items(query=query, enable_cross_partition_query=True))
        print('[Orchestrator] Retrieved conversation items:', items)
        if not items:
            return {"history": []}
 
        conversation_history = items[0].get('conversation', [])
        return {"history": conversation_history}
 
# Explicit testing scenario
if __name__ == "__main__":
    orchestrator = Orchestrator()
    asyncio.run(orchestrator.start_conversation())