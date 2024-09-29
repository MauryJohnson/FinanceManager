import Calendar from './components/datepicker/calendar'
import './App.css'
import moment from './modules/moment/moment.js'


function App({User,Users}) {
  
  return (
   
    <>
      
      <Calendar StartTime={new moment()} Step={8}>
      
      </Calendar>

    </>

  )
}

export default App
