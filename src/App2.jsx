import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import DatePicker from './components/datepicker/datepicker'

import Calendar from './components/datepicker/calendar'
import './App.css'

function App(payments) {
  
  return (
    <>

      <Calendar StartTime="01/01/2024 12:00:00 AM" EndTime="03/01/2024">
      
      </Calendar>

    </>
  )
}

export default App
