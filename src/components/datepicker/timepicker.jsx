import moment from '../../modules/moment/moment.js'
import { useState, useEffect, createRef} from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import fit from 'fit.js'
import './calendar.css';
import api from '../../modules/api/api.js'

function stringToRGB(inputString) {
    // Step 1: Compute the MD5 hash
    const md5Hash = md5(inputString).toString();

    // Step 2: Convert the first 6 characters of the hash to RGB
    const r = parseInt(md5Hash.substr(0, 2), 16); // Red
    const g = parseInt(md5Hash.substr(2, 2), 16); // Green
    const b = parseInt(md5Hash.substr(4, 2), 16); // Blue

    return { r, g, b };
}

//let [singleton,updateSingleton] = useState(0);

let startTime = new moment(
   new moment().format("MM/dd/yyyy") ,"MM/dd/yyyy"
)//new moment(`${Day.format("MM")}/${Day.format("dd")}/${Day.format("yyyy")}`,"MM/dd/yyyy");
let endTime = new moment(
    new moment().format("MM/dd/yyyy") ,"MM/dd/yyyy"
).add(1,"day")//new moment(`${Day.format("MM")}/${Day.format("dd")}/${Day.format("yyyy")}`,"MM/dd/yyyy").add(1,"day");
let times = [
];
do{
    times.push(startTime.format("hh:mm a"))
    startTime.add(30,"minute")
}while(startTime.isBefore(endTime))

//Returns functional TimePicker, required the full DAY
//Moment object
//Tooltip option 
//Select that full day
//Repeat same day of week (Starting from that point)
//Repeat same day until (Starting from that day)

//Select times of the day (This will combine with previous option)
//This is optional, if user does NOT select time, has to select full day
//Can select only TWO times at a time, time will be in 30 minute intervals
                

//Parent Height *2 is max height tooltip can be
//Parent Width /2 is max width tooltip can be

//SelectedOption
function TimePicker({
    Parent,
    Day,
    userData,
    className,
    currentSchedule,
    Exit=function({}){}
}){

    //alert(className)
    //updateSingleton(++singleton)
    const elementRef = createRef(null);

    let bounds = Parent.getBoundingClientRect();

    let options = [Day.format("MM/dd/yyyy"),
    `Repeat ${Day.format("EEEE")}`,
    `Range ${Day.format("MM/dd/yyyy")} from`,
    ]
    let options2 = [...times]


    let [State,UpdateState] = useState({})
    let [Users,UpdateUsers] = useState([])

    const existingDiv = document.getElementById('existing-div');
    
    console.warn(options)
    
    let selected = {
        
    }

    let selectedTimes=Object.values(State.Time||[])

    let delay = null;

    function iwt(a,b){

        //if(b.length<2)
            //return true;
        
        
        let atime = a;//new mome1nt(a.format("hh:mm a"),"hh:mm a")

        //console.warn(atime,b)
        let isAfter = true;
        
        if(b[0])
            isAfter = atime.isSameOrAfter(new moment(a.format("MM/dd/yyyy")+" "+b[0],"MM/dd/yyyy hh:mm a"))
        
        let isBefore = true;
        if(b[1]) 
            isBefore = atime.isSameOrBefore(new moment(a.format("MM/dd/yyyy")+" "+b[1],"MM/dd/yyyy hh:mm a"))

        return  isAfter && isBefore

    }

    function isWithinTimeSync({Users,a}){

        return Users.map(u=> (
            (()=>{
                let wt = iwt(a,u.TimeRange||[])

                //console.warn(u)
                switch(u.Type){
                    case "CurrentDay":
                        
                        return u.StartDate == a.format("MM/dd/yyyy") && 
                        wt

                    case "Repeat":
                        let m2 = new moment(u.StartDate,"MM/dd/yyyy");
                        //console.warn(u.StartDate,u.TimeRange,"IWT:",iwt(a,u.TimeRange))
                        /*console.warn(
                            m2.format("EEEE") , a.format("EEEE"),
                        wt
                        )*/
                        return u.StartDate == a.format("MM/dd/yyyy") &&
                        m2.format("EEEE") === a.format("EEEE") && 
                        wt
                }
            }) () ? a:null       
        )).reduce( (au,u)=>{

            if(u){
                //console.warn(u)
                au = au.concat(u)
            }

            return au
        },[])

        
    }

    useEffect( ()=>{

        let s = async function(){
        let users2 = await api("getDB", {
            type: "aggregate",
            database: "schedules",
            collection: currentSchedule,
            query: [{ $match: {name:userData.given_name} }],
            options: { allowDiskUse: true },
        });
        
        let Time=[]
        for(var x of options2)
            Time = Time.concat(isWithinTimeSync({
                Users:users2,
                a:new moment(Day.format("MM/dd/yyyy")+" "+x,"MM/dd/yyyy hh:mm a")
            }))
        console.warn("All Time",Time)
        let Time2 = Time.map(t=>{
            return t.format("MM/dd/yyyy hh:mm a")
        });
        Time = Time.filter((t,i)=>{
            return Time2.indexOf(t.format("MM/dd/yyyy hh:mm a")) == i;
        })
        
        let type = {};
        for(var u of users2){
            switch(u.Type){
                case "CurrentDay":
                    if(u.StartDate==Day.format("MM/dd/yyyy"))
                        type = {[u.Type]:true}
                    break;
                case "Repeat":
                    if(u.Repeat==Day.format("EEEE") && u.StartDate==Day.format("MM/dd/yyyy"))
                        type = {[u.Type]:Day.format("EEEE")}
                    break;
            }
        }
        console.warn("A Type",type)
        UpdateState({
            ...type,
            Time
        })
        UpdateUsers(users2)

        /*
        options2.map(async (x,i)=>{ 
            let time = document.getElementById(x).innerText;
            //console.warn(Day.format("MM/dd/yyyy")+" "+time)
            let a  = new moment(Day.format("MM/dd/yyyy")+" "+time,"MM/dd/yyyy hh:mm a");
            console.warn("A!",Day.format("MM/dd/yyyy")+" "+time)
            console.warn("A2",a)
            if(await isWithinTime({
                users,
                a
            })){
                //alert("YES")
                document.getElementById(x).classname="selected"

            }
        })*/
    }()

    },[])

    console.warn(State)
    //alert(className)
    ///console.warn("TimePicker State",State)
    //alert(!!State.CurrentDay && i==0)
    // Render the React component under the existing div
    return <>
        <div  id="parent" onMouseOver={(e)=>{
            //e.target.over=true;
            //console.warn(e.target)
            if( (Object.keys(selected).length==0 && 
                e.target.id!="parent") ||
                Object.keys(selected).length>0    
            )
            selected[e.target.id] = true;
            //console.warn(selected)
        }} onMouseOut={async (e)=>{
            if(Object.keys(selected).length==0)
                return
            
            await new Promise(function(rs,rj){
                setTimeout(function(){
                    rs()
                },0)
            })

            //console.warn(selected)
            selected[e.target.id] = false;
            let anySelected=false;
            for(var s in selected){
                anySelected||=selected[s]
            }
            //alert(anySelected)
            //console.warn("Any Selected?",anySelected,selected)
            //if(e.target.id=="parent" && e.target.over)
            if(!anySelected){
                let rm;
                if(true || e.target.id=="parent"){
                    rm = e.target;
                    //rm.parentNode.removeChild(rm)
                    Exit();
                }
                else{
                    //rm = e.target.parentNode;
                }
                
            }
        }} ref={elementRef} style={{
            display:"inline-block",
            position:"absolute",
            overflow:"scroll",
            background:"#333",
            "text-align":"center",
            color:"white",
            padding:"10px",
            height:bounds.height*2,
            width:bounds.width*1.5
        }}>  
            <div><div onMouseOver={(e)=>{
                            selected[e.target.id] = true;

            }}id="iconX" className="iconX" onClick={(e)=>{
                //e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                Exit()
            }}>✖</div></div>
            <div id="iconCheck" onClick={(e)=>{
                if(Object.keys(State).length==2){
                    if( /*Object.keys(State.Time).length==2 && 
                        */
                        (
                            State.CurrentDay||
                            State.Repeat||
                            State.Range
                        )
                    ){  
                        if(State.Time.length === options2.length)
                            State.Time = []

                        if(State.Time.length>2){
                            State.Time = [
                                State.Time[0],State.Time[State.time.length-1]
                            ]
                        }
                        //CurrentDay, Repeat,Range 
                        Exit(State)
                    
                    }
                }

            }} className="iconCheck"></div>
            <div>
                    {options.map((x,i)=>{
                        return <div id={x} onClick={(e)=>{
                            
                            if(e.target.innerText == options[0]){
                                UpdateState({
                                    "CurrentDay":true,
                                    "Time":[
                                        ...State.Time||[]
                                    ]
                                })
                            }
                            else if(e.target.innerText == options[1]){
                                UpdateState({
                                    "Repeat":Day.format("EEEE"),
                                    "Time":[
                                        ...State.Time||[]
                                    ]
                                })
                            }
                            else if(e.target.innerText == options[2]){
                                UpdateState({
                                    "Range":true,
                                    "Time":[
                                        ...State.Time||[]
                                    ]
                                })
                            }
                        }} className={(
                            
                            State.CurrentDay && i==0
                            ||
                            State.Repeat && i==1
                            ||
                            State.Range && i==2
                    )?className:""} 
                            style={{display:"inline-block",width:"90%",cursor:"pointer"}} onMouseOver={(e)=>{
                            e.target.style.opacity="0.5"
                        }} onMouseOut={(e)=>{
                            e.target.style.opacity="1"
                        }}>
                            {x}
                        </div>
                    })}
                <div style={{position:"absolute",overflowX:"hidden",height:bounds.height*1.4, overflowY:"scroll"}}>
                    {options2.map((x,i)=>{
                        return <div id={x} onClick={(e)=>{
                            {
                                let m = new moment(Day.format("MM/dd/yyyy")+" "+e.target.innerText,"MM/dd/yyyy hh:mm a")
                                let shift;
                                let pop;
                                if(selectedTimes.length>0){
                                    if(m.isSame(selectedTimes[0])){
                                        selectedTimes.shift()
                                    }
                                    else if(m.isSame(selectedTimes[selectedTimes.length-1])){
                                        selectedTimes.pop()
                                    }
                                    else if(selectedTimes.length>1 && 
                                        
                                        m.isBefore(selectedTimes[selectedTimes.length-1])
                                        && 
                                        m.isAfter(selectedTimes[0])
                                    ){
                                        if(Math.abs(m.diff(selectedTimes[selectedTimes.length-1],"minutes")) >
                                            Math.abs(m.diff(selectedTimes[0],"minutes"))
                                            ){
                                                selectedTimes.shift()
                                                selectedTimes.splice(0,0,m)
                                            }
                                            else{
                                                selectedTimes.pop()
                                                selectedTimes.push(m)
                                            }
                                    }
                                    else if(m.isAfter(selectedTimes[selectedTimes.length-1])){
                                        if(selectedTimes.length>1){
                                            selectedTimes.pop()
                                        }

                                        selectedTimes.push(m);
                                        pop=true;
                                    }

                                    else if(m.isBefore(selectedTimes[0])){
                                        if(selectedTimes.length>1){
                                            selectedTimes.shift()
                                            
                                        }
                                        selectedTimes.splice(0,0,m)
                                        shift=true;
                                    }
                                    
                                    
                                }
                                else{

                                    selectedTimes.push(m);

                                }

                                if(selectedTimes.length==2){

                                    if(selectedTimes[0].isAfter(
                                        selectedTimes[1]
                                    )){
                                        selectedTimes = [
                                            selectedTimes[1],
                                            selectedTimes[0]
                                        ]
                                    }

                                }
                                console.warn(selectedTimes)
                                UpdateState({
                                    ...State,
                                    "Time":selectedTimes
                                })
                            }

                        }} className={(
                            (State.Time||[]).filter(y=>{
                                return y.format("hh:mm a")===x
                            }).length>0
                            /*
                            ||
                            isWithinTimeSync({
                                Users,
                                a:new moment(Day.format("MM/dd/yyyy")+" "+x,"MM/dd/yyyy hh:mm a")
                            })*/
                    )?className:""} 
                            style={{display:"inline-block",width:"90%",cursor:"pointer"}} onMouseOver={(e)=>{
                            e.target.style.opacity="0.5"
                        }} onMouseOut={(e)=>{
                            e.target.style.opacity="1"
                        }}>
                            {x}
                        </div>
                    })}
                </div>
            </div>
            
        </div> 
    </>;

}

export default TimePicker;