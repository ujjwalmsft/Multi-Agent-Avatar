from semantic_kernel import Kernel
from typing import List, Dict, Any
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
import logging

class DocumentUploadPlugin:
    """
    Plugin explicitly leveraging Azure Document Intelligence for extracting structured
    content from user-uploaded documents.
    """

    def __init__(self, endpoint: str, api_key: str):
        """Initialize with Document Intelligence endpoint and API key."""
        self.endpoint = endpoint
        self.credential = AzureKeyCredential(api_key)
        self.logger = logging.getLogger(__name__)
        
    def extract_details(self, kernel: Kernel, file_urls: List[str]) -> List[Dict[str, Any]]:
        """
        Extract details from prescription documents using Document Intelligence.
        This is the actual method called by DataCollectionAgent.
        
        Args:
            kernel: The semantic kernel instance
            file_urls: List of blob URLs to analyze
        
        Returns:
            List of dictionaries containing extracted details
        """
        self.logger.info(f"Extracting details from {len(file_urls)} documents")
        results = []
        
        try:
            document_client = DocumentAnalysisClient(
                endpoint=self.endpoint, 
                credential=self.credential
            )
            
            for url in file_urls:
                self.logger.info(f"Processing document: {url}")
                poller = document_client.begin_analyze_document_from_url(
                    "prebuilt-document", url
                )
                result = poller.result()
                
                # Extract key-value pairs
                extracted_data = {}
                for kv_pair in result.key_value_pairs:
                    if kv_pair.key and kv_pair.value:
                        key = kv_pair.key.content.lower().strip()
                        value = kv_pair.value.content.strip() if kv_pair.value else ""
                        extracted_data[key] = value
                
                # Extract tables if any
                tables_data = []
                for table_idx, table in enumerate(result.tables):
                    table_data = []
                    for cell in table.cells:
                        row_index = cell.row_index
                        col_index = cell.column_index
                        content = cell.content
                        
                        while len(table_data) <= row_index:
                            table_data.append([])
                        
                        row = table_data[row_index]
                        while len(row) <= col_index:
                            row.append("")
                        
                        row[col_index] = content
                        
                    tables_data.append(table_data)
                
                if tables_data:
                    extracted_data["tables"] = tables_data
                
                # Extract full text content
                content = ""
                for page in result.pages:
                    for line in page.lines:
                        content += line.content + "\n"
                
                extracted_data["full_text"] = content
                results.append(extracted_data)
                
            self.logger.info(f"Successfully extracted details from {len(results)} documents")
            return results
            
        except Exception as e:
            self.logger.error(f"Error extracting document details: {str(e)}")
            return [{"error": f"Failed to process document: {str(e)}"}]