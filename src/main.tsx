import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import debug auth for development
if (import.meta.env.DEV) {
  import('./lib/debugAuth')
}

createRoot(document.getElementById("root")!).render(<App />);