import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PayPalScriptProvider options={{ "client-id": "test", currency: "USD" }}>
      <App />
    </PayPalScriptProvider>
  </StrictMode>,
)
