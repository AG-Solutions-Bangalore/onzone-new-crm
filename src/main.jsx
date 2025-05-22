// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from "react-router-dom";
// import AppProvider from './lib/ContextPanel.jsx';

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//        <BrowserRouter  >
//        <AppProvider>
//     <App />
//     </AppProvider>
//     </BrowserRouter>
//   </StrictMode>,
// )
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppProvider from "./lib/ContextPanel.jsx";
import App from "./App.jsx";
import "./index.css";

const queryClient = new QueryClient(); 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <QueryClientProvider client={queryClient}>
        {" "}
        <AppProvider>
          <App />
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
