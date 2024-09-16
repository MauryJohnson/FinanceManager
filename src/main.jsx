import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import api from './modules/api/api.js'

await async function(){

  //let users = await api("getUsers");
  //console.warn("USERS:"+users)

  if(!localStorage.user){
    localStorage.user = prompt("Enter New User");
  }
  
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App data={
        await api(`getFinances/${localStorage.user}`)
      } />
    </StrictMode>,
  )
}()
