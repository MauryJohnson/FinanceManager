import React, { useState, useEffect,useRef,createRef } from 'react';
import rome from '@bevacqua/rome';
import moment from '../../modules/moment/moment.js'
import moment2 from 'moment'
import PropTypes from 'prop-types';
import '@bevacqua/rome/dist/rome.min.css';
import './calendar.css';

rome.use(moment2);

export const DatePicker = props => {
  
};

DatePicker.propTypes = {
  onSelectDate: PropTypes.func.isRequired
};
const StepMap = {

    "1 second":1000,
    "1 minute":1000*60,
    "5 minute":1000*60*5,
    "15 minute":1000*60*15,
    "30 minute":1000*60*30,
    "1 hour":1000*60*60,
    "1 day":1000*60*60*24,
    "1 week":1000*60*60*24*7,
    "1 year":1000*60*60*24*7*52,
  
    "1s":1000,
    "1m":1000*60,
    "5m":1000*60*5,
    "15m":1000*60*15,
    "30m":1000*60*30,
    "1h":1000*60*60,
    "4h":1000*60*60*4,
    "6h":1000*60*60*6,
    "1d":1000*60*60*24,
    "1w":1000*60*60*24*7,
    "15d": 1000*60*60*24*15,
    "1M":1000*60*60*24*7*4,
    "1y":1000*60*60*24*7*52
  
  }

  const GetInterval = function (tf){
    var i = "";
    var i2 = "";
    for(var t=0;t<tf.length;t+=1){
      if(isNaN(parseInt(tf.charAt(t)))){
        i2+=tf.charAt(t);
      }
      else{
        i+=tf.charAt(t);
      }
    }
    var format;
    switch(i2.trim()){
      case "m":
      case "minute":
      case "MINS":
      case "MIN":
  
        format="MM/dd/yyyy hh:mm:00 a"
  
        break;
  
      case "h":
      case "HOUR":
      case "HOURS":
  
        format="MM/dd/yyyy hh:00:00 a"
  
        break;
  
      case "d":
      case "DAY":
      case "DAYS":
  
        format="MM/dd/yyyy 00:00:00 a"
  
        break;
      default:
        format="MM/dd/yyyy hh:mm:ss a"
        break;
  
    }
    return [parseInt(i),i2.trim(),{
      "m":"minute",
      "h":"hour",
      "d":"day",
      "w":"week",
      "M":"month",
  
      "MINS":"minute",
      "HOURS":"hour",
      "MIN":"minute",
      "HOUR":"hour",
      "DAYS":"day",
      "DAY":"day",
  
      "minute":"m",
      "minutes":"m",
      "hour":"h",
      "hours":"h",
      "day":"d",
      "days":"d",
      "week":"w",
      "month":"M",
  
    }[i2.trim()] || i2.trim(),format]
  }


//We will manipulate RomeMap depending on user inputs.
//Any Rome events will need to be trumped by the RomeMap
/*let RomeMap = {

}*/
  

// Include the crypto-js library
import md5 from 'md5';//require("crypto-js");

function stringToRGB(inputString) {
    // Step 1: Compute the MD5 hash
    const md5Hash = md5(inputString).toString();

    // Step 2: Convert the first 6 characters of the hash to RGB
    const r = parseInt(md5Hash.substr(0, 2), 16); // Red
    const g = parseInt(md5Hash.substr(2, 2), 16); // Green
    const b = parseInt(md5Hash.substr(4, 2), 16); // Blue

    return { r, g, b };
}

// Example usage
const inputString = "Hello, World!";
const rgbValues = stringToRGB(inputString);
console.log(`RGB values for '${inputString}':`, rgbValues);


//Datepicker allows multiple dates to dictate how many
function Calendar({onSelectDate=function(date){
    console.warn(`Selected Date:${date}`)
},StartTime,EndTime,Step="1M"}){

    let start = new moment(StartTime,"MM/dd/yyyy hh:mm:ss a");
    
    const elementRef = createRef(null);
    const pickerRef = createRef(null);
    let [RomeMap,UpdateRome] = useState({});
    let [Months,UpdateMonths] = useState(10);

    function DaySelected({Year,Month,Day}){
      let ds = RomeMap[Year][Month][Day].className.indexOf("rd-day-selected")!=-1;
      console.warn(Month+" "+Day+" "+Year+" Selected:"+ds);
      return ds;
    }

    function monthsInCalendar(Obj){
      let max = 0;

      let maxdate;
   
      for(var year in Obj){
        
        for(var month in Obj[year]){

          let date = new moment(month+" "+year,"MMMM yyyy");

          if(!maxdate)
            maxdate = new moment(month+" "+year,"MMMM yyyy");

          if(maxdate.diff(date,"month") > max){
            max = maxdate.diff(date,"month");
          }

        } 

      }
      return max+1;
    }
    
    //useEffect is called after html is created.
    useEffect(() => {
        pickerRef.current = rome(elementRef.current, {time:false, "inputFormat": "MM/DD/YYYY", monthsInCalendar: Months });
        pickerRef.current.on('data', data => onSelectDate(data));

        let tables = pickerRef.current.associated.children[0].children[0].children
        //console.warn(tables)
        
        for(var table of tables){
          //console.warn(table.children[table.children.length-1])
          //console.warn(table.querySelectorAll('div')[0])
          let date = table.querySelectorAll('div')[0].innerHTML.split(" ");
          //console.warn(date)
          let month = new moment(date[0],"MMMM",true).format("MMMM");
          let year = new moment(date[date.length-1],"yyyy").format("yyyy");
          //console.warn(year,month)
          if(!RomeMap[year])
              RomeMap[year] = {}
          if(!RomeMap[year][month])
            RomeMap[year][month] = {}
          //console.warn(month.format("MM/dd/yyyy"))
          //console.warn(year.format("yyyy"))
          let weeks = [...table.children[table.children.length-1].rows];
          //console.warn(weeks.slice(1,weeks.length))
          for(var row of weeks.slice(1,weeks.length)){
            //console.warn(row)
            for(var day of row.children){
              //console.warn(day)
              if(day.innerText)
                RomeMap[year][month][day.innerText] = (day);
            }
          }
        }

        console.warn("Rome Map",RomeMap);

        console.warn("Months in current MAP:",monthsInCalendar(RomeMap))



        DaySelected({
          Year:2024,
          Month:"September",
          Day:"25"
        });

        return () => pickerRef.current.off();
    }, []);

  return <div ref={elementRef} />;
 
}


export default Calendar;