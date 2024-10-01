import React, { useState, useEffect,useRef,createRef } from 'react';
import ReactDOM from 'react-dom';

import rome from '@bevacqua/rome';
import moment from '../../modules/moment/moment.js'
import moment2 from 'moment'
import PropTypes from 'prop-types';
import '@bevacqua/rome/dist/rome.min.css';
import './calendar.css';
import TimePicker from './timepicker.jsx';

rome.use(moment2);

export const DatePicker = props => {
  
};

DatePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  onNext:PropTypes.func.isRequired
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

//Datepicker allows multiple dates to dictate how many
function Calendar({onData=()=>{},update=()=>{},onNext=function(date){
  console.warn("Next:",date)
},onChange=function(date){
    console.warn(`Selected Date:${date}`)
},StartTime,EndTime,Step=10}){

    let start;
    
    if(StartTime)
      start = StartTime
    
    const elementRef = createRef(null);
    const pickerRef = createRef(null);
    let RomeMap = {};
    let [Update,UpdateState] = useState(0);

    function maxDate(){
      let date;
      for(var year in RomeMap){
        for(var month in RomeMap[year]){
            for(var day in RomeMap[year][month]){
              if(!date){
                date = new moment(`${month}/${day}/${year}`,"MMMM/dd/yyyy",true)
              }
              else{
                let date2 = new moment(`${month}/${day}/${year}`,"MMMM/dd/yyyy",true);
                if(date2.isAfter(date))
                    date = date2;
              }
            }
        }
      }
      return date;
    }

    function minDate(){
      let date;
      for(var year in RomeMap){
        for(var month in RomeMap[year]){
            for(var day in RomeMap[year][month]){
              if(!date){
                date = new moment(`${month}/${day}/${year}`,"MMMM/dd/yyyy",true)
              }
              else{
                let date2 = new moment(`${month}/${day}/${year}`,"MMMM/dd/yyyy",true);
                if(date2.isBefore(date))
                    date = date2;
              }
            }
        }
      }
      return date;
    }

    function Apply(cb){
      let applied= false;
      for(var year in RomeMap){
        for(var month in RomeMap[year]){
            for(var day in RomeMap[year][month]){
              applied = applied || cb({
                year,month,day,elem:RomeMap[year][month][day]
              })
            }
        }
      }
      if(applied){
        console.warn("APPLYING ROME:"+(++Update))
        UpdateState(++Update)
      }
    }
    let [Months,UpdateMonths] = useState(Step);

    function DaySelected({Year,Month,Day}){
      let ds = ((((RomeMap[Year]||{})[Month]||{})[Day]||{}).className||"").indexOf("rd-day-selected")!=-1;
      console.warn(Month+" "+Day+" "+Year+" Selected:"+ds);
      return ds;
    }

    function monthsInCalendar(Obj){
      let max = 0;

      let maxdate;
   
      for(var year in Obj){
        
        for(var month in Obj[year]){

          let date = new moment(month+" "+year,"MMMM yyyy",true);

          if(!maxdate)
            maxdate = new moment(month+" "+year,"MMMM yyyy",true);

          if(maxdate.diff(date,"month") > max){
            max = maxdate.diff(date,"month");
          }

        } 

      }
      return max+1;
    } 
    
    //useEffect is called after html is created.
    useEffect(() => {
        pickerRef.current = rome(elementRef.current, {time:false,initialValue:start.format("MM/dd/yyyy"), "inputFormat": "MM/DD/YYYY", monthsInCalendar: Months });
        
        let lastSelected;
        pickerRef.current.on('data', async data => {
            //console.warn(data)
            let m = new moment(data,"MM/dd/yyyy");
            let md = maxDate();
            let md2 = minDate();
            //console.warn(md,md2)
            //console.warn(`Selected date:${m.format("MM/dd/yyyy")}, Max date:${md.format("MM/dd/yyyy")}`)
            if(m.isAfter(md) || m.isBefore(md2)){
              
              console.warn("NEXT, REFRESHING ROME:"+(++Update))
              return UpdateState(++Update)
            }

            let elem = RomeMap[
              m.format("yyyy")
            ][m.format("MMMM")][m.format("dd")]

            if(lastSelected?.Exit){
              lastSelected.Exit()
            }

            elem.Exit = (State={})=>{
              
              //We exit with a state of Type and Time
              //Date is already defined
              if(Object.keys(State).length>1){
                console.warn("Exit State",State)

                onChange({
                  Element:pickerRef.current.associated,
                  Rome:pickerRef.current,
                  RomeMap,
                  
                    "StartDate":data,//new moment(data,"MM/dd/yyyy hh:mm a"),
                    "TimeRange":[...State.Time],
                    [Object.keys(State)[0]]:State[Object.keys(State)[0]],
                    "Type":Object.keys(State)[0],
                  
                  Apply
                  
                })
                
                switch(Object.keys(State)[0]){
                  case "CurrentDay":

                    

                    break;

                  case "Repeat":



                    break;

                  case "Range":



                    break;
                }
              }

              //if(lastSelected?.innerText!=elem.innerText)
              ReactDOM.unmountComponentAtNode(elem)

              //alert(m.format("dd"))
              elem.innerText = m.format("dd");

              delete elem.Exit
            }

            console.warn("Create Portal",elem)
            //alert(elem.)
            await onData({
              data,elem
            })

            lastSelected = elem;

            //console.warn("portal",portal)
            /*
            onChange({
            Element:pickerRef.current.associated,
            Rome:pickerRef.current,
            RomeMap,
            data,
            Apply
            
           })*/
        });


        pickerRef.current.on('next', data => onNext({
          Element:pickerRef.current.associated,
          Rome:pickerRef.current,
          RomeMap,
          data,
          Apply
        }));

        let tables = pickerRef.current.associated.children[0].children[0].children
        //console.warn(tables)
        
        RomeMap = {};

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
              if(day.innerText && day.className.indexOf("next")==-1 && day.className.indexOf("prev")==-1)
                RomeMap[year][month][day.innerText] = (day);
            }
          }
        }

        console.warn("Rome Map",RomeMap);

        console.warn("Months in current MAP:",monthsInCalendar(RomeMap))

        /*
        DaySelected({
          Year:2024,
          Month:"September",
          Day:"25"
        });*/

        //Make whatever changes necessary to the Rome
        update({
          Element:pickerRef.current.associated,
          Rome:pickerRef.current,
          RomeMap,
          Apply
        })

        return () => pickerRef.current.off();
    }, [Update]);

  return <div  style={
    {width:"100%",display:"inline-block"}
  } ref={elementRef} />;
 
}


export default Calendar;