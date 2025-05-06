

import {
  PublicClientApplication,
  Configuration,
  RedirectRequest,
} from "@azure/msal-browser";
import dotenv from "dotenv";

// Load the .env.dev file
// dotenv.config({ path: ".env.dev" });

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AUTH_TENANT_ID}`,
    
    // for running locally
    redirectUri: "http://localhost:3000",

 //for running on hosted azure environment
    // redirectUri: "healthcare-agent-frontend-heecdvfffehccrfe.canadacentral-01.azurewebsites.net",

    // clientId: `${process.env.AUTH_CLIENT_ID}`, //Application ID of the registered app
    // authority: `https://login.microsoftonline.com/${process.env.AUTH_TENANT_ID}`, // Directory (tenant) ID or name
    // redirectUri: "http://localhost:3000", // redirect uri added in the portal
  },
  cache: {
    cacheLocation: "sessionStorage", // Can be "localStorage" or "sessionStorage"
    storeAuthStateInCookie: true, // Recommended for IE browsers
  },
};
console.log(`${process.env.AUTH_CLIENT_ID}`, "Client ID");

export const loginRequest: RedirectRequest = {
  // scopes: [`api://${process.env.AUTH_CLIENT_ID}/User.Read`],
  scopes: [`api://${process.env.NEXT_PUBLIC_AUTH_CLIENT_ID}/Files.Read`],
  account: undefined,
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
export const msalInstance = new PublicClientApplication(msalConfig);



