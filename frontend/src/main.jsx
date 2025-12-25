import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import '../src/style/index.css'
import App from './App.jsx'
import CredentialProvider from './provider/CredentialProvide.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
        <CredentialProvider>
          <App />
        </CredentialProvider>
      </BrowserRouter>

  </StrictMode>,
)
