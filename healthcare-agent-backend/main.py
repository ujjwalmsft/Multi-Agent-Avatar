from fastapi import FastAPI, Security, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from controllers.query_controller import router as query_router
import decode_jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()

origins = [
    
    "http://localhost:3000",
  
    "https://healthcare-agent-backend-dxeyhff2d5amgwc0.eastus2-01.azurewebsites.net"
]
security_scheme = HTTPBearer()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)