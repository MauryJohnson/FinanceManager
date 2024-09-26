import React, { useState, useEffect } from 'react';
import moment from '../../modules/moment/moment.js'

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

//Datepicker allows multiple dates to dictate how many
function DatePicker({StartTime,EndTime,Step="1M"}){
    if(!GetInterval(Step))
        throw(`DatePicker:${StartTime,EndTime} Invalid interval: ${Step} `);

    //Create Calendar API which is fully functional
}


export default DatePicker;