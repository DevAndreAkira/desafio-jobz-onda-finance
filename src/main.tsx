import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ativa o mock adapter em desenvolvimento (simula API REST via Axios)
// Em produção, remova este import e aponte api.baseURL para o servidor real
if (import.meta.env.MODE !== 'production') {
  await import('./services/mockAdapter')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
