"use client";
import React from "react";
import { Button, Typography, Box } from "@mui/material";

interface LoginProps {
  onLogin: () => void;
}
const Login: React.FC<LoginProps>  = ({ onLogin }) => {
  return (
    <Box sx={{ textAlign: "center", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Azure Avatar Demo with MSAL
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={onLogin}
        sx={{ marginTop: 2 }}
      >
        Login with Azure AD
      </Button>
    </Box>
  );
};

export default Login;



// "use client";
 
// import React, { useEffect, useState } from 'react';
// import { Button, Box, Typography, Paper } from '@mui/material';
// import { PublicClientApplication, EventType } from '@azure/msal-browser';
// import authConfig from '../configs/authConfig';
 
// const msalInstance = new PublicClientApplication(authConfig);
 
// const Login: React.FC = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [username, setUsername] = useState('');
 
//   useEffect(() => {
//     msalInstance.handleRedirectPromise().then((response) => {
//       if (response) {
//         setUsername(response.account?.name || '');
//         console.log('Login successful:', response.account);
//       }
//     });
 
//     msalInstance.addEventCallback((event) => {
//       if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
//         if (event.payload && event.payload.account) {
//           setUsername(event.payload.account.name || '');
//         }
//         console.log('Event triggered:', event);
//       }
//     });
//   }, []);
 
//   // const msalConfig = {
//   //   auth: {
//   //     // clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
//   //     // authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
//   //     // redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,

//   //     clientId: "6f2aff43-daf3-4cbc-81cf-f3c695747f3e",
//   //     authority: "https://login.microsoftonline.com/3045245c-059a-476b-91a0-d55eaf94f4c4",
//   //     redirectUri: "http://localhost:3000",
//   //   },
//   // };
 
//   // const msalInstance = new PublicClientApplication(msalConfig);
 
//   const handleLogin = () => {
//     msalInstance.loginRedirect({
//       scopes: ["User.Read"],
//     }).catch((error) => {
//       console.error('Login error:', error);
//     });
//   };
 
//   return (
// <Box
//       display="flex"
//       justifyContent="center"
//       alignItems="center"
//       height="100vh"
//       component={Paper}
//       elevation={3}
//       flexDirection="column"
//       gap={2}
//       padding={4}
// >
// <Typography variant="h5">Login with Microsoft Entra ID</Typography>
//       {username ? (
// <Typography variant="subtitle1">Logged in as: {username}</Typography>
//       ) : (
// <Button variant="contained" onClick={() => msalInstance.loginRedirect()}>
//           Sign In
// </Button>
//       )}
// </Box>
//   );
// };
 
// export default Login;