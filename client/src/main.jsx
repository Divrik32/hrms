import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      toastOptions={{
        duration: 3500,

        style: {
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          color: "#e2e8f0",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "12px 16px",
          fontSize: "13.5px",
          fontWeight: "500",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
          maxWidth: "360px",
          lineHeight: "1.5",
        },

        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981",
            secondary: "rgba(15, 23, 42, 0.9)",
          },
          style: {
            background: "rgba(15, 23, 42, 0.88)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.08)",
          },
        },

        error: {
          duration: 4000,
          iconTheme: {
            primary: "#f87171",
            secondary: "rgba(15, 23, 42, 0.9)",
          },
          style: {
            background: "rgba(15, 23, 42, 0.88)",
            border: "1px solid rgba(248, 113, 113, 0.25)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(248, 113, 113, 0.08)",
          },
        },

        loading: {
          iconTheme: {
            primary: "#818cf8",
            secondary: "rgba(15, 23, 42, 0.9)",
          },
          style: {
            background: "rgba(15, 23, 42, 0.88)",
            border: "1px solid rgba(129, 140, 248, 0.25)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(129, 140, 248, 0.08)",
          },
        },
      }}
    />
  </StrictMode>,
)