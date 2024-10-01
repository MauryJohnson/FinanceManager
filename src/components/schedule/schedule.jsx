import React, { useState, useEffect } from 'react';
import api from '../../modules/api/api.js'
import Calendar from '../datepicker/calendar'
import ColorCodes from '../colorcodes/colorcodes'
import ReactDOM from 'react-dom';
import TimePicker from '../datepicker/timepicker.jsx';

import moment from '../../modules/moment/moment.js'
import md5 from 'md5';

function stringToRGB(inputString) {
    // Step 1: Compute the MD5 hash
    const md5Hash = md5(inputString).toString();

    // Step 2: Convert the first 6 characters of the hash to RGB
    const r = parseInt(md5Hash.substr(0, 2), 16); // Red
    const g = parseInt(md5Hash.substr(2, 2), 16); // Green
    const b = parseInt(md5Hash.substr(4, 2), 16); // Blue

    return { r, g, b };
}

let styles = document.getElementById("styles");
let styleMap = {
    /*".go":{
        "background":"red"
    }
    */

    "icon": {
        "fontSize": "24px",
        "margin": "10px",
        "display": "inline-block"
    },
    "iconX": {
        "color": "red",
        "position": "absolute",
        "top":0,
        "left":0
    },

    "iconX::before":{
        "content": "✖"
    },

    "iconCheck": {
        "color": "green", 
        "position": "absolute",
        "top":0,
        "right":0
    },

    "iconCheck::before": {
        "content": "'✔'"
    }
    
};

function SortDict(dict){
    return Object.fromEntries(
        Object.entries(dict).sort(([a, ], [b, ]) => a.localeCompare(b))
    );
}
function applyStyles(styles2={}){
    let styleText = ``;
    for(var s in styles2){
        styleMap[s] = styles2[s]
    }
    for(var s in styleMap){
        styleText+=`
            ${s}{
                `
        for(var t in styleMap[s]){
            styleText+=`
               ${t}:${styleMap[s][t]};
            `
        }

        styleText+=`
            }
        `;
    }
    styles.innerHTML = styleText;
    return styleText;
}


//Datepicker allows multiple dates to dictate how many
function Schedule({ setup, userData, data = [] }) {
    applyStyles();

    data = ["", "Add Schedule","Add Bill"].concat(data);
    //alert(applyStyles())
    const [schedules, setSchedules] = useState(data);
    const [currentState, updateState] = useState({
        currentSchedule:"",Users:[],UserColors:{}
    });
    function getUser(user){
        return currentState.Users.filter(x=>x.name==user)[0];
    }
    function revertColor({r,g,b}){
        return {
            r2:Math.abs(255-r),
            g2:Math.abs(255-g),
            b2:Math.abs(255-b)
        }
    }

    function isWithinTime(a,b){
        if(b.length<2)
            return true;
        //console.warn(a,b)
        let atime = new moment(a.format("hh:mm a"),"hh:mm a")
        return atime.isSameOrAfter(new moment(b[0],"hh:mm a")) &&
        atime.isSameOrBefore(new moment(b[1],"hh:mm a"))
    }

    function isScheduled({user,day,month,year}){
        //console.warn("Is scheduled")
        return currentState.Users.filter(x=>{
            //console.warn(x)
            //console.warn(month,day,year)
            return user == x.name && [x].filter(y=>{
                
                let m = new moment(`${month}/${day}/${year}`,"MMMM/dd/yyyy",true)
                //console.warn(m)
                //console.warn(y+"=="+m)
                switch(y.Type){
                    case "CurrentDay":
                            //console.warn(y)
                            return y.StartDate === m.format("MM/dd/yyyy")

                        
                    case "Repeat":
                            let m2 = new moment(y.StartDate,"MM/dd/yyyy");

                            return m2.format("EEEE") === m.format("EEEE") && m.isSameOrAfter(m2)

                        break;

                    case "Range":

                            

                        break;
                }

                
            }).length>0
        }).length>0
    }

    function combineColors(elem){
        let s = "";

        let users = Object.keys(elem.UserColors);

        for(var u in users){
            s+=users[u]+(
                u<users.length-1?"_and_":""
            )
        }

        return s || userData.given_name;
    }

    console.warn("Schedule data", schedules);
    console.warn("Current State",currentState)
    const handleSelectChange = async (event) => {
        const selectedValue = event.target.value;
        console.warn(selectedValue);

        if (selectedValue === data[1] || selectedValue === data[2]) {
            let type = selectedValue.split(" ")[1];

            const newSchedule = prompt(`Enter ${type} Name`);
            
            if (newSchedule) {
                await api("updateDB", {
                    db: "schedules",
                    collection: newSchedule,
                    update: [
                        { name: userData.given_name },
                        {
                            $set: {
                                name: userData.given_name,
                                //Schedule: {},
                                ScheduleType:type,
                                email: userData.email,
                            },
                        },
                        { upsert: true },
                    ],
                });

                const schedules = await api("getCollections", { db: "schedules" });
                console.warn("new Schedules", schedules);

                setSchedules((oldSchedules) => [...oldSchedules, newSchedule]);
            }
        } else {
            let scheduledData = await api("getDB",{
                "type":"aggregate",
                "database":"schedules",
                "collection":event.target.value,
                "query":[{
                $match:{
                    "name":userData.given_name
                }
                }],
                "options":{allowDiskUse:true}
            })
            
            console.warn(`${userData.given_name}'s ${event.target.value} data`,scheduledData)
            
            if(scheduledData.length===0){
                console.warn(`${userData.given_name} does not exist, adding to ${event.target.value}`);
                scheduledData = await api("getDB",{
                    "type":"aggregate",
                    "database":"schedules",
                    "collection":event.target.value,
                    "query":[{
                    $match:{
                        
                    }
                    }],
                    "options":{allowDiskUse:true}
                })
                await api("updateDB", {
                    db: "schedules",
                    collection: event.target.value,
                    update: [
                        { name: userData.given_name },
                        {
                            $set: {
                                name: userData.given_name,
                                //Schedule: {},
                                ScheduleType:scheduledData[0].Type||"N/A",
                                email: userData.email,
                            },
                        },
                        { upsert: true },
                    ],
                });
            }
            
            console.warn("Rendering Schedule...");
            setup.children[0].innerText = `Select ${userData.given_name}'s Schedule for: ${event.target.value}`;

            const users = await api("getDB", {
                type: "aggregate",
                database: "schedules",
                collection: selectedValue,
                query: [{ $match: {} }],
                options: { allowDiskUse: true },
            });
            let UserColors = {}
            for(var user of users){
                UserColors[user.name]=stringToRGB(user.name);
                
                let {r,g,b} = UserColors[user.name];

                let {r2,g2,b2} = revertColor(UserColors[user.name]);

                applyStyles({
                    [`.${user.name}`]:{
                        "background":`rgb(${r},${g},${b})`,
                        "color":`rgb(${r2},${g2},${b2})`
                        //"opacity":"0.2"
                    }
                })
            }

            updateState({
                currentSchedule:event.target.value,
                Users:users,
                UserColors
            })
            //updateSchedule(selectedValue);
        }
    };

    // Determine what to render
    if (currentState.Users.length === 0 || !currentState.currentSchedule) {
        return (
            <>
            <select onChange={handleSelectChange}>
                {schedules.map((x, index) => (
                    <option key={index}>{x}</option>
                ))}
            </select>
            </>
        );
    } else {
        console.warn(currentState)
        console.warn("APP")
        return (<>
        
        <ColorCodes data={
            currentState.UserColors
        }>
        </ColorCodes>

        <Calendar onData={
            async ({
                data,elem
            })=>{

                
                ReactDOM.render(
                <>
                <TimePicker 
                    Parent={elem.parentNode.parentNode}
                    
                    Day = {new moment(data,"MM/dd/yyyy")}

                    currentSchedule={currentState.currentSchedule}
                    
                    className={
                        //currentState.UserColors[
                            combineColors(elem).replace(/\ /gi,"_")
                        //]
                    }

                    userData={userData}
                    
                    Exit={ (Dict)=>{ 
                        
                        elem.Exit(Dict);



                     }}
                ></TimePicker>
                </>,
                elem
              ); 
                

            }
        } update={
            //Div, Rome class, and RomeMap
            //{Element,Rome,RomeMap}
            (Dict)=>{
                let {Element,Rome,RomeMap,Apply} = Dict;
                
                // RomeMap[Year][Month][Day].className.indexOf("rd-day-selected")!=-1;
                Apply(({
                    year,
                    month,
                    day,
                    elem
                })=>{

                    //console.warn(month,day,year,elem)
                    let previousColor;
                    let preferredColor = {
                        user:isScheduled({user:userData.given_name,day,month,year})?user:null,
                        color:currentState.UserColors[userData.given_name]
                    }

                    if(!elem.UserColors)
                        elem.UserColors = {}

                    if(!elem.originalClass)
                        elem.originalClass = elem.className

                    for(var user in currentState.UserColors){

                        if(!isScheduled({user,day,month,year})){
                            
                            //elem.className = elem.className.replace(user.replace(/\ /gi,"_"),"")

                            delete elem.UserColors[user]

                            continue;
                        }

                        if(user.indexOf("_and_")!=-1)
                            continue;
                        
                        //if( !elem.UserColors[user] ){
                            //elem.className+=` ${user.replace(/\ /gi,"_")}  `;
                        elem.UserColors[user] = true;
                        //}
                        
                    }

                    elem.UserColors = SortDict(elem.UserColors);

                    if(Object.keys(elem.UserColors).length>0){

                        let s = combineColors(elem)
                        
                        if(!currentState.UserColors[s]){
                            console.warn("NEW USER:"+s)
                            currentState.UserColors[s] = stringToRGB(s)
                            updateState({
                                ...currentState,
                            })
                        }

                        preferredColor = {user:s,
                            color:currentState.UserColors[s]}

                        console.warn("PReferred color",preferredColor)
                    }
                    else{
                        elem.className =  elem.originalClass  
                    }
                    if(preferredColor.user){
                        let {r,g,b} = preferredColor.color
                        let {r2,g2,b2} = revertColor(preferredColor.color)

                        elem.className =  elem.originalClass+" "+(
                            preferredColor.user.replace(/\ /gi,"_")
                        );
                        //console.warn(r,g,b)
                        //alert(r,b,g)
                        applyStyles({
                            [`.${preferredColor.user.replace(/\ /gi,"_")}`]:{
                                "background":`rgb(${r},${g},${b})`,
                                "color":`rgb(${r2},${g2},${b2})`
                                //"opacity":"0.2"
                            }
                        })

                        console.warn("STyle Map",styleMap)
                    }

                })
                //For our user, we want to Highlight all ROME fields
                //ROME fields that fall under selection
                /*for(var year in RomeMap){
                    for(var month in RomeMap[year]){
                        for(var day in RomeMap[year][month]){

                        }
                    }
                }*/

            }
        }
        onChange={
            //Div, Rome class, and RomeMap
            //{Element,Rome,RomeMap}
            async (Dict)=>{

                /*
                let m = new moment(Dict.data,"MM/dd/yyyy")
                console.warn(Dict.data)

                
                if(myUser.Schedule.length>=4 && myUser.Schedule.indexOf(m.format("EEEE"))==-1){
                    alert("too many days scheduled")
                    return;
                }*/
                
                console.warn(Dict)

                //let myUser = getUser(userData.given_name);

                let operation;
                let vars;
                switch(Dict.Type){
                    case "CurrentDay":
                            vars = {
                                Type:Dict.Type,
                                StartDate:Dict.StartDate,
                                TimeRange:Dict.TimeRange.map(x=>{
                                    return x.format("hh:mm a")
                                })
                            };

                            operation = currentState.Users.filter((s)=>{
                                return s.name == userData.given_name && s.StartDate==Dict.StartDate 
                                        /*&&
                                        s.TimeRange.join(" ") == Dict.TimeRange.join(" ")
                                        */
                            }).length==0?"add":"remove"

                        break;

                    case "Repeat":
                            
                            vars = {
                                Type:Dict.Type,
                                StartDate:Dict.StartDate,
                                Repeat:Dict.Repeat,
                                TimeRange:Dict.TimeRange.map(x=>{
                                    return x.format("hh:mm a")
                                })
                            }

                            operation = currentState.Users.filter((s)=>{
                                return s.name == userData.given_name && s.Repeat==(Dict.Repeat) && s.StartDate==Dict.StartDate
                            }).length==0?"add":"remove"
                        break;

                    case "Range":

                        break;
                }
                
                let myUser = currentState.Users.filter(u=>{
                    return u.name==userData.given_name
                })[0];

                if(operation=="add")
                    await api("insertDB", {
                        db: "schedules",
                        collection: currentState.currentSchedule,
                        insert: {
                                name: userData.given_name, 
                                ScheduleType:myUser.ScheduleType,
                                ...vars,
                                email: userData.email
                            }
                        }
                    );
                else{
                    await api("removeDB", {
                        db: "schedules",
                        collection: currentState.currentSchedule,
                        remove: {
                                name: userData.given_name, 
                                ScheduleType:myUser.ScheduleType,
                                ...vars,
                                email: userData.email
                            }
                        }
                    ); 
                }

                const users = await api("getDB", {
                    type: "aggregate",
                    database: "schedules",
                    collection: currentState.currentSchedule,
                    query: [{ $match: {} }],
                    options: { allowDiskUse: true },
                });

                console.warn(users)

                //if(myUser.Schedule.indexOf(m.format("EEEE"))==-1){
                    updateState({
                        ...currentState,
                        Users:users
                    })
                //}
                myUser = users.filter(u=>u.name ===userData.given_name)

                console.warn("Some Schedules:",myUser)
                
                Dict.Apply(({
                    year,
                    month,
                    day,
                    elem
                })=>{
                    //let m = new moment(`${month}/${day}/${year}`,"MMMM/dd/yyyy",true)

                    //if(myUser.Schedule.indexOf(m.format("EEEE"))!=-1){
                        //console.warn("Found")
                    return true;
                    //}
                })

                /*
                Dict.Apply(({
                    year,
                    month,
                    day,
                    elem
                })=>{

                    let m2 = new moment(`${month},${day},${year}`,"MM/dd/yyyy");

                    if(m.format("EEEE") == m2.format("EEEE")){
                        elem.
                    }

                })*/

            }
        } StartTime={new moment()} Step={8}>
      
        </Calendar>
        </>)
    }
}


export default Schedule;