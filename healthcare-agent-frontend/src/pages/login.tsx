/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useRouter } from "next/router";
import { msalConfig, loginRequest } from "@/configs/authConfig";
import { PublicClientApplication } from "@azure/msal-browser";
import Login from "@/components/Login";

const msalInstance = new PublicClientApplication(msalConfig);

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await msalInstance.initialize();
      // await msalInstance.logoutPopup(); // Clear the MSAL cache
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      console.log("Login successful:", loginResponse);

      const accessToken = await msalInstance
        .acquireTokenSilent({
          ...loginRequest,
          account: loginResponse.account,
        })
        .then((response) => response.accessToken);

      console.log("Access Token:", accessToken);

      localStorage.setItem("accessToken", accessToken);

      if (loginResponse) {
        window.location.href = "/avatar";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div>
      <Login onLogin={handleLogin} />
      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginPage;