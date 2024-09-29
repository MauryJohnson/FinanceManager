import moment from '../../modules/moment/moment.js'
import { useState, useEffect, createRef} from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import fit from 'fit.js'
import './calendar.css';

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
function TimePicker({Parent,Day,Exit=function({}){},SelectedOption=function({}){

}}){

    
    //updateSingleton(++singleton)
    const elementRef = createRef(null);

    let bounds = Parent.getBoundingClientRect();

    let options = [Day.format("MM/dd/yyyy"),
    `Repeat ${Day.format("EEEE")}`,
    `Range ${Day.format("MM/dd/yyyy")} from`,
    ...times]
    
    let [State,UpdateState] = useState({})

    const existingDiv = document.getElementById('existing-div');
    
    console.warn(options)
    
    let selected = {
        
    }

    let selectedTimes=Object.values(State.Time||[])

    // Render the React component under the existing div
    return <>
        <div  id="parent" onMouseOver={(e)=>{
            //e.target.over=true;
            //console.warn(e.target)
            if(Object.keys(selected).length==0 && e.target.id!="parent" && e.target.id.indexOf("icon")==-1)
            selected[e.target.id] = true;
            //console.warn(selected)
        }} onMouseOut={(e)=>{
            if(Object.keys(selected).length==0)
                return
            //console.warn(selected)
            selected[e.target.id] = false;
            let anySelected=false;
            for(var s in selected){
                anySelected||=selected[s]
            }
            //if(e.target.id=="parent" && e.target.over)
            if(!anySelected){
                let rm;
                if(e.target.id=="parent"){
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
            background:"inherit",
            color:"inherit",
            padding:"10px",
            height:bounds.height*2,
            width:bounds.width*1.5
        }}>  
            <div id="iconX" className="iconX" onClick={(e)=>{
                //e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                Exit()
            }}>✖</div>
            <div id="iconCheck" onClick={(e)=>{
                if(Object.keys(State).length==2){
                    if(Object.keys(State.Time).length==2)
                        Exit(State)
                }

            }} className="iconCheck"></div>
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
                    else{
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
                    ||
                    State.CurrentDay && i==0
                    ||
                    State.Repeat && i==1
                    ||
                    State.Range && i==2
            )?"selected":""} 
                    style={{cursor:"pointer"}} onMouseOver={(e)=>{
                    e.target.style.opacity="0.5"
                }} onMouseOut={(e)=>{
                    e.target.style.opacity="1"
                }}>
                    {x}
                </div>
            })}
        </div> 
    </>;

}

export default TimePicker;