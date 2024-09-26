import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App2.jsx'
import './index.css'

await async function(){

  //let users = await api("getUsers");
  //console.warn("USERS:"+users)

  
  createRoot(document.getElementById('root2')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}()
