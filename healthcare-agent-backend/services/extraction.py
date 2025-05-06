from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
import os
from dotenv import load_dotenv

load_dotenv('.env.dev')

# Load Azure credentials from environment variables
text_analytics_key = os.getenv("LANGUAGE_KEY")
text_analytics_endpoint = os.getenv("LANGUAGE_ENDPOINT")

if not text_analytics_key or not text_analytics_endpoint:
    raise ValueError("Azure Text Analytics API key or endpoint not set in environment variables")

credential = AzureKeyCredential(text_analytics_key)
client = TextAnalyticsClient(endpoint=text_analytics_endpoint, credential=credential)

class TextRequest(BaseModel):
    text: str

async def extract_key_phrases(request: TextRequest):
    try:
        response = client.extract_key_phrases(documents=[request.text])
        key_phrases = response[0].key_phrases
        return {"key_phrases": key_phrases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def recognize_entities(request: TextRequest):
    try:
        response = client.recognize_entities([request.text])
        entities = [{"text": entity.text, "category": entity.category, "confidence_score": entity.confidence_score} 
                    for entity in response[0].entities]
        return {"entities": entities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def recognize_pii(request: TextRequest):
    try:
        response = client.recognize_pii_entities([request.text])
        pii_entities = [{"text": entity.text, "category": entity.category, "confidence_score": entity.confidence_score} 
                        for entity in response[0].entities]
        return {"pii_entities": pii_entities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))