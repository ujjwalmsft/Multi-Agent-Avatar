
# Multi-Agent Avatar Accelerator (Semantic Kernel & Azure OpenAI GPT-4o)

A comprehensive, conversational AI framework designed explicitly for healthcare scenarios such as prescription management, leveraging Semantic Kernel, Azure OpenAI GPT-4o, Azure Document Intelligence, Azure Cosmos DB, Azure Communication Services, and an engaging frontend powered by Next.js and Azure AI Avatar.

## 🚀 Overview

The Multi-Agent Avatar Accelerator implements an intelligent conversational assistant enabling structured user interactions and robust data collection through two primary workflows:

- **Q&A Interaction Workflow**: Structured conversational questions.
- **Document Upload Interaction Workflow**: Extract structured details explicitly from uploaded prescriptions (images/PDFs).

It provides a seamless, secure, and scalable interaction between users and AI agents through structured sessions managed explicitly via Semantic Kernel.

## 🎯 Key Features

- **Intelligent Conversational UI** leveraging Next.js and React.
- **Agentic AI Orchestration** using Microsoft's Semantic Kernel.
- **Structured Data Extraction** explicitly via Azure OpenAI GPT-4o.
- **Robust Document Processing** explicitly using Azure Document Intelligence.
- **Reliable Persistent Storage** explicitly through Azure Cosmos DB.
- **Automated Email Notifications** via Azure Communication Services.
- **Interactive Azure AI Avatar** integration for enhanced user engagement.

## 🗂 Project Structure

The repository is clearly organized into frontend and backend modules:

```
Multi-Agent-Avatar/
├── frontend/ (Next.js/React)
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── public/
│   └── services/
│
└── backend/ (FastAPI & Semantic Kernel)
    ├── agents/
    │   └── guided_conversation/
    │       ├── orchestrator_main.py
    │       ├── data_collection.py
    │       ├── email_agent.py
    │       ├── artifact_handler.py
    │       ├── azure_models.py
    │       ├── plugins/
    │       └── utils/
    ├── controllers/
    ├── services/
    ├── config/
    ├── main.py
    └── requirements.txt
```

## ⚡️ Getting Started

### **Setup Instructions**

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📄 License

Licensed under the MIT License.
