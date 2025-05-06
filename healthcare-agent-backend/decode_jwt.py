import os
import jwt
import requests
from jwt.algorithms import RSAAlgorithm
import json
from msal.oauth2cli.oidc import decode_id_token
import logging
from typing import List, Dict, Any
from asyncio import Future
from dotenv import load_dotenv

load_dotenv('.env.dev')

AUTH_CLIENT_ID = os.getenv("AUTH_CLIENT_ID")
AUTH_TENANT_ID = os.getenv("AUTH_TENANT_ID")

logging.basicConfig(level=logging.INFO)

async def decode_token(token: str):
    try:
        result = decode_id_token(id_token=token, client_id=AUTH_CLIENT_ID)
        logging.info('Decodeinfg')
        logging.info(f"Decoded roles: {result.get('roles')}")
        logging.info(f"Decoded result: {result}")
        
        return result
    except Exception as e:
        logging.error(f"Error decoding token: {str(e)}")
        raise

async def validate_token(token: str):
    token_data = await decode_token(token)
    try:
        user = {
            'userId': token_data.get('oid'),
            'username': token_data.get('upn'),
            'displayName': token_data.get('name'),
            'roles': token_data.get('roles', []),
        }
        logging.info(f"User: {user}")
        return user
    except Exception as e:
        logging.error('Validation error: %s', e)
        raise

async def has_required_roles(user_roles: List[str], required_roles: List[str]) -> bool:
    logging.info(f"user_roles: {user_roles}")
    logging.info(required_roles,'REQW')
    return any(role in required_roles for role in user_roles)