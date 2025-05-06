
from semantic_kernel.connectors.ai.open_ai import AzureTextEmbedding, AzureChatCompletion
from openai import AzureOpenAI
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, PartitionKey
import os
import json

load_dotenv(dotenv_path='../../.env.dev')

class AzureService:
    def __init__(self):
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.api_version = os.getenv("AZURE_OPENAI_API_VERSION")
        self.cosmos_endpoint = os.getenv("COSMOS_ENDPOINT")
        self.cosmos_key = os.getenv("COSMOS_KEY")
        self.cosmos_db = os.getenv("COSMOS_DB")
        self.cosmos_container = os.getenv("COSMOS_CONTAINER")

        self.client = AzureOpenAI(
            api_key=self.api_key,
            api_version=self.api_version,
            azure_endpoint=self.api_base
        )
        
        
        self.chat_client = AzureChatCompletion(
            deployment_name='chat-completion',
            api_version="2025-01-01-preview",
            endpoint=self.api_base,
            api_key=self.api_key,
        )
        self.conversation_history = []  # Initialize conversation history

        # Initialize CosmosDB client
        self.cosmos_client = CosmosClient(self.cosmos_endpoint, self.cosmos_key)
        self.database = self.cosmos_client.create_database_if_not_exists(id=self.cosmos_db)
        self.container = self.database.create_container_if_not_exists(
            id=self.cosmos_container,
            partition_key=PartitionKey(path="/session_id"),
            offer_throughput=400
        )

    # Add or update the get_information method to handle document intelligence output
    async def get_information(self, document_text: str) -> dict:
        """
        Extract structured prescription information from document text.
        
        Args:
            document_text: The text extracted from document intelligence
            
        Returns:
            Dict with prescription information fields
        """
        system_message = """
        You are an AI assistant that extracts structured prescription information from documents.
        Extract the following fields from the provided document text:
        1. The patient name
        2. The prescribed medicine name(s)
        3. The time of medicine intake (e.g., morning, evening, 3 PM, etc.)
        4. The number of days for the prescription
        5. The patient's email address if available
        
        Format your response as a JSON object with the following keys:
        name, prescribed_medicine, time_of_medicine, no_of_days_of_medicine, primary_email
        
        If any information is missing, use an empty string for that field.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="chat-completion",
                temperature=0.0,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": f"Extract prescription information from this text:\n\n{document_text}"}
                ],
                response_format={"type": "json_object"}
            )
            
            json_response = json.loads(response.choices[0].message.content)
            
            # Ensure all required fields are present
            required_fields = ["name", "prescribed_medicine", "time_of_medicine", 
                            "no_of_days_of_medicine", "primary_email"]
            
            for field in required_fields:
                if field not in json_response:
                    json_response[field] = ""
                    
            return json_response
            
        except Exception as e:
            print(f"[ERROR] Error extracting information: {str(e)}")
            return {
                "name": "",
                "prescribed_medicine": "",
                "time_of_medicine": "",
                "no_of_days_of_medicine": "",
                "primary_email": ""
            }