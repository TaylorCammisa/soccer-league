import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './soccer-league-client/src/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
