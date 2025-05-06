import React from 'react';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { msalInstance } from '@/configs/authConfig';

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await msalInstance.initialize();
      await msalInstance.logoutPopup();
      localStorage.removeItem('accessToken');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleLogout}
      sx={{
        borderRadius: '20px',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: 'bold',
        textTransform: 'none',
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: '#d32f2f',
        },
        '&:active': {
          backgroundColor: '#b71c1c',
        },
      }}
    >
      Logout
    </Button>
  );
};
export default LogoutButton;



// "use client";
 
// import React from 'react';
// import { Button } from '@mui/material';
// import { PublicClientApplication } from '@azure/msal-browser';
// import authConfig from '../configs/authConfig';
 
// // MSAL instance configured explicitly for Azure AD logout
// const msalInstance = new PublicClientApplication(authConfig.msalConfig);
 
// const Logout: React.FC = () => {
//   const handleLogout = () => {
//     console.log('Initiating logout...');
//     msalInstance.logoutRedirect({
//       postLogoutRedirectUri: authConfig.msalConfig.auth.redirectUri,
//     }).catch((error) => {
//       console.error('Logout failed:', error);
//     });
//   };
 
//   return (
// <button
//       onClick={handleLogout}
//       style={{
//         padding: '10px 20px',
//         backgroundColor: '#1976d2',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '5px',
//         cursor: 'pointer',
//       }}
// >
//       Logout
// </button>
//   );
// };
 
// export default Logout;