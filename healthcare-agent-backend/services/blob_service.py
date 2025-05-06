import os
from azure.storage.blob import BlobServiceClient, ContentSettings
import uuid

class BlobStorageService:
    """Service for handling Azure Blob Storage operations."""
    
    def __init__(self):
        """Initialize the Blob Storage service with connection string."""
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.container_name = os.getenv("BLOB_CONTAINER_NAME", "prescription-documents")
        
        # Ensure container exists
        self._ensure_container_exists()
    
    def _ensure_container_exists(self):
        """Create the container if it doesn't exist."""
        try:
            self.blob_service_client.get_container_client(self.container_name).get_container_properties()
        except Exception:
            self.blob_service_client.create_container(self.container_name)
            
    async def upload_file(self, file_bytes, session_id, content_type=None):
        """
        Upload a file to blob storage and return metadata.
        
        Args:
            file_bytes: The binary content of the file
            session_id: The session ID to associate with the file
            content_type: The MIME type of the file (optional)
            
        Returns:
            dict: Blob metadata including URL and reference information
        """
        # Generate a unique blob name using session_id
        blob_name = f"{session_id}/{uuid.uuid4()}"
        
        # Get a blob client
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name, 
            blob=blob_name
        )
        
        # Set content settings if provided
        content_settings = None
        if content_type:
            content_settings = ContentSettings(content_type=content_type)
        
        # Upload the file
        blob_client.upload_blob(
            file_bytes, 
            overwrite=True,
            content_settings=content_settings
        )
        
        # Return metadata about the uploaded blob
        return {
            "blob_name": blob_name,
            "url": blob_client.url,
            "session_id": session_id,
            "size_bytes": len(file_bytes),
            "content_type": content_type
        }
    
    async def delete_file(self, blob_name):
        """Delete a file from blob storage."""
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name, 
            blob=blob_name
        )
        blob_client.delete_blob()
        return {"deleted": True, "blob_name": blob_name}