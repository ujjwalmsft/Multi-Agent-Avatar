import logging
from typing import Dict, List, Any
from datetime import datetime
from pydantic import BaseModel

class ArtifactHandler:
    """
    Handler for extracting, mapping and formatting artifacts and conversation history
    from guided conversation agents.
    """
    
    def __init__(self):
        """Initialize the artifact handler with field mappings."""
        self.logger = logging.getLogger(__name__)
        
        # Define mappings between field names in guided_conversation and expected db field names
        self.field_mappings = {
            "medicine": "prescribed_medicine",
            "medicine_name": "prescribed_medicine",
            "duration": "no_of_days_of_medicine",
            "no_of_days": "no_of_days_of_medicine",
            "no_of_days_of_prescription": "no_of_days_of_medicine",
            "email": "primary_email"
        }
    
    def extract_artifact(self, guided_conversation_agent) -> Dict[str, Any]:
        """
        Extract the artifact from the guided conversation agent and apply field mappings.
        
        Args:
            guided_conversation_agent: The guided conversation agent with the artifact
            
        Returns:
            Dict[str, Any]: Properly mapped artifact dictionary
        """
        try:
            # Get the raw artifact from the guided conversation agent
            raw_artifact = guided_conversation_agent.artifact.artifact
            
            # Extract the fields from the artifact
            artifact_dict = {}
            
            # Go through each field in the raw artifact
            for field_name, field_value in raw_artifact.model_dump().items():
                # Skip "Unanswered" values
                if field_value == "Unanswered":
                    continue
                    
                # Map the field name if needed
                mapped_field = self.field_mappings.get(field_name, field_name)
                artifact_dict[mapped_field] = field_value
                
            self.logger.info(f"Extracted artifact: {artifact_dict}")
            return artifact_dict
            
        except Exception as e:
            self.logger.error(f"Error extracting artifact: {str(e)}")
            # Return empty artifact with default fields
            return {
                "name": "",
                "prescribed_medicine": "",
                "time_of_medicine": "",
                "no_of_days_of_medicine": "",
                "primary_email": ""
            }
    
    def format_conversation_history(self, agent, session_id: str) -> List[Dict[str, str]]:
        """
        Format the conversation history from the agent's conversation history.
        
        Args:
            agent: The agent with conversation history
            session_id: The session ID to retrieve history for
            
        Returns:
            List[Dict[str, str]]: Formatted conversation history
        """
        try:
            # Get conversation history from the agent
            if hasattr(agent, 'conversation_history') and session_id in agent.conversation_history:
                return agent.conversation_history[session_id]
            else:
                # Extract from guided_conversation_agent if available
                history = []
                if hasattr(agent, 'guided_conversation_agent') and hasattr(agent.guided_conversation_agent, 'conversation'):
                    for message in agent.guided_conversation_agent.conversation.get_conversation_history():
                        # Skip internal reasoning messages
                        if message.metadata.get("type") != "REASONING":
                            role = "assistant" if message.role == "assistant" else "user"
                            history.append({
                                "role": role,
                                "content": message.content
                            })
                return history
        except Exception as e:
            self.logger.error(f"Error formatting conversation history: {str(e)}")
            return []
    
    def prepare_cosmos_item(self, session_id: str, artifact: Dict[str, Any], 
                          conversation: List[Dict[str, str]], file_urls: List[str] = None) -> Dict[str, Any]:
        """
        Prepare the complete item to be stored in Cosmos DB.
        
        Args:
            session_id: The session ID
            artifact: The extracted artifact
            conversation: The formatted conversation history
            file_urls: Optional list of file URLs
            
        Returns:
            Dict[str, Any]: Complete item for Cosmos DB
        """
        return {
            "id": session_id,
            "session_id": session_id,
            "patient_name": artifact.get("name", "Unknown"),
            "artifact": artifact,
            "conversation": conversation,
            "uploaded_files": file_urls or [],
            "timestamp": datetime.utcnow().isoformat()
        }


# Helper function to get artifact handler
def get_artifact_handler():
    """Get a singleton instance of the ArtifactHandler."""
    if not hasattr(get_artifact_handler, 'instance'):
        get_artifact_handler.instance = ArtifactHandler()
    return get_artifact_handler.instance