import axios from 'axios';
import { access } from 'fs';

// Base URL configuration
//for running locally
const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

//for hosted Azure version
// const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://healthcare-agent-backend-dxeyhff2d5amgwc0.eastus2-01.azurewebsites.net';



// Create axios instance with consistent configuration
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  }
});

/*
// Add request interceptor to automatically include authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage for each request
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn('[apiService] No access token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

/*
// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle auth errors
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('[apiService] Authentication error:', error.response.data);
        // Redirect to login page or trigger auth flow
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
*/

// Standardized API service with consistent method formats
const apiService = {
  // Starts a new conversation session
  async startConversation() {
    try {
      const response = await apiClient.post('/conversation/start');
      console.log('[apiService] Conversation started:', response.data);
      return response.data;
    } catch (error) {
      console.error('[apiService] Error starting conversation:', error);
      throw error;
    }
  },

  // Uploads prescription image for a session
  async uploadPrescription(sessionId: string, file: File) {
    try {
      console.log("[apiService] Uploading prescription for session:", sessionId);
      const formData = new FormData();
      formData.append('file', file);
      
      // Override content-type for file upload while keeping auth headers from interceptor
      const response = await apiClient.post(`/conversation/${sessionId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("[apiService] Upload response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("[apiService] Upload error:", error);
      throw error;
    }
  },

  // Sends user messages within an existing session
  async sendUserMessage(sessionId: string, userInput: string) {
    try {
      const response = await apiClient.post(`/conversation/${sessionId}/message`, {
        user_input: userInput,
      });
      console.log('[apiService] User message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('[apiService] Error sending user message:', error);
      throw error;
    }
  },

  // Finalizes conversation and triggers email notifications
  async finalizeConversation(sessionId: string) {
    try {
      const response = await apiClient.post(`/conversation/${sessionId}/finalize`);
      console.log('[apiService] Conversation finalized:', response.data);
      return response.data;
    } catch (error) {
      console.error('[apiService] Error finalizing conversation:', error);
      throw error;
    }
  },

  // Processes text for PII recognition
  async recognizePii(text: string): Promise<any> {
    try {
      const response = await apiClient.post('/recognize-entities', { text });
      console.log('[apiService] PII recognition completed');
      return response.data;
    } catch (error) {
      console.error('[apiService] Error recognizing PII:', error);
      throw new Error('Failed to recognize PII.');
    }
  },

  // Retrieves all conversation sessions
  async getAllSessions() {
    // console.log('accessToken:', localStorage.getItem('accessToken'));
    try {
      const response = await apiClient.get('/conversation/sessions');
      console.log('[apiService] Retrieved sessions:', response.data);
      return response.data;
    } catch (error) {
      console.error('[apiService] Error retrieving sessions:', error);
      throw error;
    }
  },

  // Fetches conversation history for given session ID
  async getConversationHistory(sessionId: string) {
    try {
      const response = await apiClient.get(`/conversation/${sessionId}/history`);
      console.log('[apiService] Retrieved conversation history:', response.data);
      return response.data;
    } catch (error) {
      console.error('[apiService] Error retrieving conversation history:', error);
      throw error;
    }
  },

  // Sets the JWT token in localStorage
  setAuthToken(token: string) {
    localStorage.setItem('accessToken', token);
    console.log('[apiService] Auth token set in localStorage');
  },

  // Clears the JWT token from localStorage
  clearAuthToken() {
    localStorage.removeItem('accessToken');
    console.log('[apiService] Auth token removed from localStorage');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
};

export default apiService;

/**
 * Documentation: apiService.ts
 * 
 * Purpose:
 * API service managing communication with FastAPI backend.
 * Handles JWT authentication and provides methods for conversational workflow.
 * 
 * Authentication:
 * - Automatically includes Bearer token from localStorage in all requests
 * - Handles 401/403 errors with appropriate feedback
 * - Provides methods for token management (set/clear/check)
 * 
 * Methods:
 * - startConversation: Initiates a new conversation session
 * - sendUserMessage: Sends user messages within sessions
 * - uploadPrescription: Handles prescription image uploads
 * - finalizeConversation: Finalizes conversation and sends email notifications
 * - recognizePii: Processes text for PII entities
 * - getAllSessions: Retrieves all conversation sessions
 * - getConversationHistory: Retrieves conversation history for a session
 * - setAuthToken: Stores JWT token in localStorage
 * - clearAuthToken: Removes JWT token from localStorage
 * - isAuthenticated: Checks if user has a stored token
 * 
 * Usage:
 * Import and utilize across React components/hooks to interact securely with backend.
 */