import { useState } from 'react'
import reactLogo from './assets/react.svg'
import Table from './components/table/table.jsx'
import viteLogo from '/vite.svg'
import moment from './modules/moment/moment.js'
import './App.css'

function App(payments) {
  
  const [data, setData] = useState(payments)
  console.warn(setData)
  console.warn(data)
  //Income X
  console.warn("Hello")
  // 5400 (4 Times a Week)
  return (
    <>
    {localStorage.user}'s Budget {new moment().format("MM/dd/yyyy")}
      <Table key="1" rows={
        (data.data||[]).length==0?[
          {
              "title":"",
              "amount":0,
              "time":"N/A"
          },
      ]:data.data
      }>
      </Table>
    </>
  )
}

export default App
