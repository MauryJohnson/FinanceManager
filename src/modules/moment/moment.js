
//const df = require("date-fns")

import * as df from 'date-fns'
import { toZonedTime }  from 'date-fns-tz'
const utcToZonedTime = toZonedTime;

function isAlpha(str) {
        return /^[A-Za-z]+$/.test(str);
      }
function changeTimezone(date, ianatz) {

  // suppose the date is 12:00 UTC
  var invdate = new Date(date.toLocaleString('en-US', {
    timeZone: ianatz
  }));

  // then invdate will be 07:00 in Toronto
  // and the diff is 5 hours
  var diff = date.getTime() - invdate.getTime();

  // so 12:00 in Toronto is 17:00 UTC
  return new Date(date.getTime() - diff); // needs to substract

}

class moment{

  constructor(date,format,relaxed=false){
        //console.log(date)
        var offsetCase = 0;
        if(date==null){

          if(format){
            console.error((new Error().stack).trim())
            throw(" GIVEN NO DATE:"+date+" BUT A FORMAT:"+format+"\n"+JSON.stringify(r)+"\n"+new Error().stack)
          }

          this.date = date=new Date(
            /*
            (new Date()).getTime()-
            (new Date()).getTimezoneOffset()*60000
            */
          )

          this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

         //format = null;
        }
        else if(!format){
          if(date){
            offsetCase = 1;

            this.date = /*df.parse(date,format,  new Date(date2.getTime() - userTimezoneOffset) )*/ (df.parseISO(
              date
            ))
          }
          else{
             offsetCase = 1;
          }
        }
        else{
          offsetCase = 2;
          //hasDate = false;
          //console.log(date)
          //console.log(format)

          //indices of separators
          var separators = {};
          //map character to idx
          var separators2 = {};
          var types = format.split("'");

          var idx=0;
          for(var t=0;t<types.length;t+=1){
            if(t%2==1){
              separators[idx] = types[t];
              separators2[types[t]]=date.indexOf(types[t])
            }
            idx+=types[t].length;
          }
          var custom = format.indexOf("'")!=-1;

          var format2 = format.replace(/'/gi,"")
          var date2 = date+""
          var keys = Object.keys(separators);
          var diff = format2.length - date2.length;
          for(var k=keys.length-1;k>=0;k--){
            var s = keys[k];
            format2=format2.substring(0,parseInt(s))+format2.substring(parseInt(s)+1,format2.length);//.split("").splice(parseInt(s),1).join(" ")

            var s = separators2[separators[s]];
            date2=date2.substring(0,parseInt(s))+date2.substring(parseInt(s)+1,date2.length);
            //date2.split("").splice(parseInt(s),1).join(" ")
          }

          //console.log(format2);

          //console.log(date2);

          if(date2.length<format2.length){
            var start = date2.length-1;
            for(;start<format2.length-1;start+=1){

              //date2.split("").splice(start,1,"0").join("")
              if(!relaxed)
              date2+="0";
            }
          }

          var keys = Object.keys(separators);
          for(var k in keys){
            var s = parseInt(keys[k])
            //console.log(separators[keys[k]])

            if(separators[keys[k]]){
              format2=format2.substring(0,parseInt(s))+separators[s]+format2.substring(parseInt(s),format2.length);//.split("").splice(parseInt(s),1).join(" ")
              date2=date2.substring(0,parseInt(s))+separators[s]+date2.substring(parseInt(s),date2.length);
              //delete separators[keys[k]]
            }
            //date2.split("").splice(parseInt(s),1).join(" ")
          }

          //console.log(format2);
          //console.log(date2);
          //else{


          format = format2;
          date = date2;

          //console.warn("FORMAT:"+format)
              
          
          if(format.length<date.length && custom)
          date = date.substring(0,format.length);


            var format2 = format.replace(/'/gi,"");
            if(format2.length>date.length && !relaxed)
              throw("mismatch length  with format and date:"+format2+" ->>"+date)

            if(types.length>1){

              //console.log("Separators")

              //console.log(separators)

              var format3 = "";
              var date2="";
              for(var i=0;i<date.length;i+=1)
                if(!separators[i+""])
                {
                  date2+=date.charAt(i);
                }
                else {
                  date2+=" "
                }
            for(var i=0;i<format2.length;i+=1)
              if(!separators[i+""])
              {
                format3+=format2.charAt(i)
              }
              else {
                format3+=" "
              }
              //if(date2.length!=format3.length)
                //throw("date2 mismatch:"+date2+" to format3:"+format3);
                //console.log(format3);

                //console.log(date2);
              date = date2;
              format = format3;

              
              this.date = df.parse(date,format,new Date())
            }
            else
              this.date = df.parse(date,format,new Date())
          
          //console.warn("Date format",date,format)
          //}

        }

        this.offsetCase = offsetCase;

        switch(offsetCase){
          case 1:
            this.offset = this.date.getTimezoneOffset()/60;
            break;
          case 2:
            this.offset = 0;//-1*this.date.getTimezoneOffset()/60;
          break;
          default:
            this.offset = 0;

            break;
        }

        /*
        if(this.date.getTimezoneOffset)
          this.offset = this.date.getTimezoneOffset()/60;
        else{
          this.offset = 0;
        }*/
        //this.date = changeTimezone(this.date,"UTC")
        //this.date = df.toDate(this.date)

        var mmnt = this;

        //"MM/dd/yyyy hh:mm:ss a"
        this.format=function(format){
          try{
            return df.format( df.add(mmnt.date,{
              "hours":mmnt.offset
            }),format)
          }
          catch(e){
            console.error(e)
            console.error(mmnt.date)
            throw("failed "+mmnt.date+" -> "+format);
          }
        }

        this.toString = this.toISOString = function(){
          return df.format(df.add(mmnt.date,{
            "hours":mmnt.offset
          }),
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
          )/*df.sub(mmnt.date,{
            "hours":mmnt.offset
          })*/
        }

        this.formatISO = function(){
          return df.format(df.add(mmnt.date,{
            "hours":mmnt.offset
          }),
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
          )/*df.sub(mmnt.date,{
            "hours":mmnt.offset
          })*///mmnt.date.toISOString();
          /*df.format(mmnt.date,
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
          )*/
        }

        this.formatRFC3339 = function(){
          return df.formatRFC3339(
            df.add(mmnt.date,{
              "hours":mmnt.offset
            })
            /*df.sub(mmnt.date,{
              "hours":mmnt.offset
            })
            */
          )
        }
        function getAllFuncs(toCheck) {
            const props = [];
            let obj = toCheck;
            do {
                props.push(...Object.getOwnPropertyNames(obj));
            } while (obj = Object.getPrototypeOf(obj));

            return props.sort().filter((e, i, arr) => {
               if (e!=arr[i+1] && typeof toCheck[e] == 'function') return true;
            });
        }
        //This function makes a date which is needed for mongo, must make sure that th
        this.toDate = function(){
          //console.log(mmnt)
          var date = df.add(mmnt.date,{
                      "hours":mmnt.offset
                    });
          console.warn("SOME DATE:",date)
          var userTimezoneOffset = date.getTimezoneOffset() * 60000;
          var newDate = new Date(date.getTime() + userTimezoneOffset);
          for(var func of getAllFuncs(newDate)){
            if(func!="toISOString" && func.indexOf("get")==-1 && func!="valueOf" && func!="toString" && func!="constructor" && func.indexOf("_")==-1){
              newDate[func] = null;
              //delete newDate[func]
            }
          }
          return newDate
        }

        let parseInterval = function(interval){
          return {
            "m":"minutes",
            "h":"hours",
            "d":"days",
            "w":"weeks",
            "M":"months",
            "y":"years",
            "s":"seconds",
            "second":"seconds",
            "seconds":"seconds",
            "millisecond":"milliseconds",
            "ms":"milliseconds",
            "milliseconds":"milliseconds",
            "minute":"minutes",
            "minutes":"minutes",
            "hour":"hours",
            "hours":"hours",
            "day":"days",
            "days":"days",
            "week":"weeks",
            "month":"months",
            "year":"years"

          }[interval]
        }

        
        this.timezone = function(tz){
          mmnt.date = utcToZonedTime(mmnt.date, tz);
        }
        /*
        {
          years: 2,
          months: 9,
          weeks: 1,
          days: 7,
          hours: 5,
          minutes: 9,
          seconds: 30,
        }
        */
        this.add=function(duration,interval){
          interval = parseInterval(interval)
          /*
          if(interval.charAt(interval.length-1)!="s"){
            interval+="s";
          }
          */
          if(interval=="milliseconds"){
            mmnt.date = df.addMilliseconds(
              mmnt.date,
              duration
            );
          }
          else
            mmnt.date = df.add(mmnt.date, {
              [interval]:duration
            })

          return mmnt;
        }

        this.min = function(m2){
          if(mmnt.isBefore(m2))
            return mmnt;
          return m2;
        }

        this.max = function(m2){
          if(mmnt.isAfter(m2))
            return mmnt;
          return m2;
        }

        this.subtract=function(duration,interval){
          interval = parseInterval(interval)
          /*if(interval.charAt(interval.length-1)!="s"){
            interval+="s";
          }*/

          mmnt.date = df.sub(mmnt.date, {
            [interval]:duration
          })

          return mmnt;
        }

        this.utc = function(){
          return mmnt;
        } 
        
        //Assume we are not tracking timeZone unless explicity Specified, so we can Directly SYNC dates as needed
        //this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        this.syncTime = function(timeZone){
          
          let timeDiff;

          if(!mmnt.timeZone){
            timeDiff = -1*(utcToZonedTime(mmnt.toDate(), timeZone).getTimezoneOffset()/60+1) //- this.toDate().getTimezoneOffset()/60;
          }
          /*
          else if(mmnt.timeZone!=timeZone){
            timeDiff = utcToZonedTime(mmnt.toDate(), timeZone).getHours() - mmnt.timeDiff;
            console.warn(timeDiff)
          }*/
          
          if(timeDiff!=0){
            mmnt.add(timeDiff,"hour")

            mmnt.timeZone = timeZone
            mmnt.timeDiff = timeDiff
          }

          return mmnt;

        }

        this.isBefore = function(m){
          return df.isBefore(
            df.add(mmnt.date,{
              "hours":mmnt.offset
            })
            ,
            df.add(m.date,{
              "hours":m.offset
            })
            )
        }
        this.isAfter = function(m){
          return  df.isAfter(
            df.add(mmnt.date,{
              "hours":mmnt.offset
            })
            ,
            df.add(m.date,{
              "hours":m.offset
            })
            )
        }

        this.isEqual = function(m){
          return df.isEqual(
            df.add(mmnt.date,{
              "hours":mmnt.offset
            })
            ,
            df.add(m.date,{
              "hours":m.offset
            })
          );
        }

        this.isSameOrAfter=function(m){

          //console.log(mmnt.date+" vs "+m.date)
          return mmnt.isAfter(m) || mmnt.isEqual(m)
        }

        this.isSameOrBefore=function(m){
          //console.log(mmnt.date+" vs "+m.date)
          return mmnt.isBefore(m) || mmnt.isEqual(m)
        }

        this.diff = function(m,interval = ""){
          interval = parseInterval(interval)
          //console.log(interval)
          /*if(interval.charAt(interval.length-1)!="s"){
            interval+="s";
          }*/
          interval = interval.charAt(0).toUpperCase() + interval.substring(1,interval.length);
          var diff = df["differenceIn"+interval](
            df.add(m.date,{
              "hours":m.offset
            }),

            df.add(mmnt.date,{
              "hours":mmnt.offset
            })

          );
          return diff
        }

        this.valueOf = function(){
          return (df.add(mmnt.date,{
            "hours":mmnt.offset
          }).valueOf())
        }

  }

  static min(m1,m2){
    if(df.isBefore(
      m1.date,
      m2.date
    )){
      return m1
    }
    else{
      return m2
    }
  }

  static max(m1,m2){
    if(df.isAfter(
      m1.date,
      m2.date
    )){
      return m1
    }
    else{
      return m2
    }
  }

}

export default moment
