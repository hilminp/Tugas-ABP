import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 💡 Midtrans Snap di-load via <script async> di index.html
// window.snap tersedia setelah script selesai load.
// Gunakan hook useMidtrans() di komponen yang butuh payment.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)