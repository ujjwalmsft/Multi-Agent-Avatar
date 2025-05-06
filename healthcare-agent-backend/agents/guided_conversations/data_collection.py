import os
import sys
import json
from datetime import datetime, date
from typing import List
from pydantic import BaseModel, Field
 
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
 
from dotenv import load_dotenv
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
from semantic_kernel.functions import kernel_function
from azure.cosmos import CosmosClient, PartitionKey
from guided_conversation.plugins.guided_conversation_agent import GuidedConversation
from guided_conversation.utils.resources import ResourceConstraint, ResourceConstraintMode, ResourceConstraintUnit
from .azure_models import AzureService
from guided_conversation.plugins.document_upload_plugin import DocumentUploadPlugin
from guided_conversation.plugins.artifact_handler import ArtifactHandler, get_artifact_handler
 
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.dev"))
 
# Explicit HealthArtifact Model
class HealthArtifact(BaseModel):
    name: str = Field(default="")
    prescribed_medicine: str = Field(default="")
    time_of_medicine: str = Field(default="")
    no_of_days_of_medicine: str = Field(default="")
    primary_email: str = Field(default="")
 
def kernel_plugin(cls):
    cls.__kernel_plugin__ = True
    return cls
 
@kernel_plugin
class DataCollectionAgent:
    def __init__(self):
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.kernel = Kernel()
        document_intelligence_endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
        document_intelligence_api_key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY")

        chat_service = AzureChatCompletion(
            deployment_name='chat-completion',
            api_version="2025-01-01-preview",
            endpoint=endpoint,
            api_key=api_key,
            service_id="data_collection_service",
        )
        self.kernel.add_service(chat_service)
 
        self.azure_service = AzureService()
        self.document_plugin = DocumentUploadPlugin(document_intelligence_endpoint, document_intelligence_api_key)
 
        self.context = "You're a health assistant collecting prescription details."
 
        self.conversation_flow = """
        1. Ask explicitly if user wants to upload prescriptions or answer questions.
        2. Collect explicitly structured fields: name, medicine, time, duration, email.
        3. Explicitly confirm details and explicitly allow user updates.
        """
 
        self.rules = [
            "DO NOT provide medical advice.",
            "Stay strictly within prescription-related details."
        ]
 
        self.resource_constraint = ResourceConstraint(
            quantity=15,
            unit=ResourceConstraintUnit.TURNS,
            mode=ResourceConstraintMode.MAXIMUM,
        )
 
        self.guided_conversation_agent = GuidedConversation(
            kernel=self.kernel,
            artifact=HealthArtifact,
            conversation_flow=self.conversation_flow,
            context=self.context,
            rules=self.rules,
            service_id="data_collection_service",
            resource_constraint=self.resource_constraint
        )
 
        # Cosmos DB setup explicitly
        self.cosmos_client = CosmosClient(os.getenv("COSMOS_ENDPOINT"), os.getenv("COSMOS_KEY"))
        self.database = self.cosmos_client.create_database_if_not_exists(id="HealthConversations")
        self.container = self.database.create_container_if_not_exists(
            id="ExtractedDetails",
            partition_key=PartitionKey(path="/session_id"),
            offer_throughput=400
        )

    async def update_agent_with_document_info(self, session_id: str, artifact: dict):
        """
        Update the guided_conversation_agent's internal state with information extracted from documents
        so the conversation can continue with knowledge of what was already extracted.
        
        Args:
            session_id: The session identifier
            artifact: Dictionary containing the extracted information
        """
        # print(f"[DEBUG] Updating agent memory with document-extracted information: {artifact}")
        
        # Check if guided_conversation_agent is initialized
        if not hasattr(self, 'guided_conversation_agent'):
            print("[DEBUG] Initializing guided_conversation_agent for document info update")
            await self.initialize_agent(session_id)
        
        # For each non-empty field in the artifact, inject it into the agent's memory
        for field_name, field_value in artifact.items():
            if field_value:  # Only inject non-empty values
                # Map field names if needed
                agent_field_name = field_name
                
                try:
                    # Create a user message stating this information
                    info_message = f"My {field_name} is {field_value}"
                    
                    # Step the conversation with this information
                    # print(f"[DEBUG] Injecting document info into conversation: {info_message}")
                    
                    # Add a system message to conversation history indicating this was extracted from document
                    if not hasattr(self, 'conversation_history'):
                        self.conversation_history = {}
                    
                    if session_id not in self.conversation_history:
                        self.conversation_history[session_id] = []
                    
                    # Update the agent's artifact directly
                    if hasattr(self.guided_conversation_agent, 'artifact') and hasattr(self.guided_conversation_agent.artifact, 'artifact'):
                        print(f"[DEBUG] Directly updating agent artifact field {agent_field_name} with value {field_value}")
                        setattr(self.guided_conversation_agent.artifact.artifact, agent_field_name, field_value)
                        
                        # Add a system message about this update
                        self.conversation_history[session_id].append({
                            "role": "system",
                            "content": f"Document extracted {field_name}: {field_value}"
                        })
                except Exception as e:
                    print(f"[ERROR] Failed to update agent with document field {field_name}: {str(e)}")
        
        print("[DEBUG] Agent memory updated with document information") 


    @kernel_function
    async def handle_user_input(self, session_id: str, user_input: str):
        """
        Existing explicitly working method to handle user Q&A.
        """
        print(f"[DEBUG][Q&A] Session {session_id}, User input: {user_input}")
        
        # Track conversation history
        if not hasattr(self, 'conversation_history'):
            self.conversation_history = {}
        
        # Initialize conversation history for this session if it doesn't exist
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        # Add user message to conversation history
        self.conversation_history[session_id].append({
            "role": "user",
            "content": user_input
        })

        response = await self.guided_conversation_agent.step_conversation(user_input=user_input)
        print(f"[DEBUG][Q&A] Agent response: {response.ai_message}")
        
        # Add assistant message to conversation history
        if response.ai_message:
            self.conversation_history[session_id].append({
                "role": "assistant",
                "content": response.ai_message
            })

        # IMPORTANT: Get the current artifact and save the updated conversation to Cosmos DB
        # This ensures all messages are saved even after document upload
        try:
            current_artifact = {}
            if hasattr(self.guided_conversation_agent, 'artifact') and hasattr(self.guided_conversation_agent.artifact, 'artifact'):
                artifact = self.guided_conversation_agent.artifact.artifact
                current_artifact = {
                    "name": getattr(artifact, "name", ""),
                    "prescribed_medicine": getattr(artifact, "prescribed_medicine", ""),
                    "time_of_medicine": getattr(artifact, "time_of_medicine", ""),
                    "no_of_days_of_medicine": getattr(artifact, "no_of_days_of_medicine", ""),
                    "primary_email": getattr(artifact, "primary_email", "")
                }
            
            # Save the updated conversation to Cosmos DB
            self._save_artifact_to_cosmos(session_id, current_artifact)
            print(f"[DEBUG][Q&A] Updated conversation saved to Cosmos DB for session {session_id}")
        except Exception as e:
            print(f"[ERROR] Failed to save conversation update to Cosmos DB: {str(e)}")

        if response.is_conversation_over:
            print("[DEBUG][Q&A] Conversation completed. Extracting artifact explicitly.")
            
            # Use the artifact handler to extract and format the artifact
            artifact_handler = get_artifact_handler()
            artifact = artifact_handler.extract_artifact(self.guided_conversation_agent)

            # print(f'ARTIFACT from guided_conversation_agent: {artifact}')
            self._save_artifact_to_cosmos(session_id, artifact)
            # print(f"[DEBUG][Q&A] Artifact saved explicitly: {artifact}")

        return {
            "message": response.ai_message,
            "is_conversation_over": response.is_conversation_over
        }
    @kernel_function
    async def handle_document_upload_input(self, session_id: str, file_urls: List[str]):
        """
        Explicitly handles document uploads using Document Intelligence and AOAI GPT-4o.
        """
        print(f"[DEBUG][DocumentUpload] Session {session_id}, Uploaded files: {file_urls}")
        
        # Initialize conversation history if needed
        if not hasattr(self, 'conversation_history'):
            self.conversation_history = {}
        
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        # Add a system message about document upload
        self.conversation_history[session_id].append({
            "role": "system",
            "content": f"User uploaded {len(file_urls)} prescription document(s)."
        })
        
        # Extract details from document
        extracted_details = self.document_plugin.extract_details(self.kernel, file_urls)
        # print(f"[DEBUG][DocumentUpload] Extracted details explicitly: {extracted_details}")

        # Generate a rich text prompt from extracted details
        prompt = "\n".join([json.dumps(doc) for doc in extracted_details])
        # print(f"[DEBUG][DocumentUpload] Prompt explicitly for AOAI GPT-4o: {prompt}")

        # Get structured information
        artifact = await self.azure_service.get_information(prompt)
        # print(f"[DEBUG][DocumentUpload] Artifact explicitly from AOAI GPT-4o: {artifact}")
        
        # Create a summary message for the conversation history
        summary_message = f"Based on your uploaded prescription, I found the following information:\n"
        has_information = False
        
        for field, value in artifact.items():
            if value:
                has_information = True
                field_names = {
                    "name": "Patient name",
                    "prescribed_medicine": "Prescribed medicine",
                    "time_of_medicine": "Medicine timing",
                    "no_of_days_of_medicine": "Duration",
                    "primary_email": "Email"
                }
                display_name = field_names.get(field, field)
                summary_message += f"- {display_name}: {value}\n"
        
        if not has_information:
            summary_message = "I couldn't extract any information from your prescription. Could you please provide the details manually?"
        else:
            summary_message += "\nIs this information correct? If not, please let me know what needs to be updated."
        
        # Add the summary as assistant message to conversation history
        self.conversation_history[session_id].append({
            "role": "assistant",
            "content": summary_message
        })

        # Check for missing fields
        missing_fields = [field for field, value in artifact.items() if not value]
        # print(f"[DEBUG][DocumentUpload] Missing fields explicitly: {missing_fields}")

        # Save the artifact to Cosmos DB
        self._save_artifact_to_cosmos(session_id, artifact, file_urls)
        # print(f"[DEBUG][DocumentUpload] Artifact explicitly saved to Cosmos DB: {artifact}")
        
        # Update the agent's internal memory with the document information
        await self.update_agent_with_document_info(session_id, artifact)
        print(f"[DEBUG][DocumentUpload] Agent memory updated with document information")

        # If fields are missing, ask follow-up questions
        if missing_fields:
            follow_up_message = "I couldn't find some important information in your prescription. "
            follow_up_message += "Could you please provide the following details:\n"
            
            field_names = {
                "name": "your name",
                "prescribed_medicine": "the medicine names",
                "time_of_medicine": "when to take the medicine",
                "no_of_days_of_medicine": "how many days to take the medicine",
                "primary_email": "your email address"
            }
            
            for field in missing_fields:
                follow_up_message += f"- {field_names.get(field, field)}\n"
            
            return {
                "message": follow_up_message,
                "is_conversation_over": False,
                "user_details": artifact
            }

        return {
            "message": summary_message,
            "is_conversation_over": False,
            "user_details": artifact
        }
 
    def _save_artifact_to_cosmos(self, session_id: str, artifact: dict, file_urls: List[str] = None):
        """
        Explicitly saves artifact data to Cosmos DB.
        """
        artifact_handler = get_artifact_handler()
        if not file_urls:
            try:
                # Try to get existing URLs from Cosmos DB
                query = f"SELECT c.uploaded_files FROM c WHERE c.session_id = '{session_id}'"
                items = list(self.container.query_items(
                    query=query, 
                    enable_cross_partition_query=True
                ))
                
                if items and items[0].get('uploaded_files'):
                    file_urls = items[0]['uploaded_files']
                    print(f"[DEBUG][CosmosDB] Preserving existing uploaded_files: {file_urls}")
            except Exception as e:
                print(f"[ERROR] Error retrieving existing file URLs: {str(e)}")
        
        # Get formatted conversation history
        conversation = artifact_handler.format_conversation_history(self, session_id)
        
        # Prepare the complete item for Cosmos DB
        cosmos_item = artifact_handler.prepare_cosmos_item(
            session_id=session_id,
            artifact=artifact,
            conversation=conversation,
            file_urls=file_urls
        )
        
        # Save to Cosmos DB
        self.container.upsert_item(cosmos_item)
        print(f"[DEBUG][CosmosDB] Data explicitly saved: {cosmos_item}")
    
    def calculate_age(self, date_of_birth: str) -> int:
        """
        Explicitly calculates age from date of birth (YYYY-MM-DD).
        """
        birth_date = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
        today = date.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        # print(f"[DEBUG][Utility] Calculated age explicitly: {age}")
        return age