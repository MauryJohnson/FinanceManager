import React, { useState, useEffect } from 'react';
import api from '../../modules/api/api.js'
import Calendar from '../datepicker/calendar'
import ColorCodes from '../colorcodes/colorcodes'

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

    data = ["", "Add Schedule"].concat(data);
    //alert(applyStyles())
    const [schedules, setSchedules] = useState(data);
    const [currentState, updateState] = useState({
        currentSchedule:"",Users:[],UserColors:{}
    });
    function getUser(user){
        return currentState.Users.filter(x=>x._id==user)[0];
    }
    function isScheduled({user,day,month,year}){
        return currentState.Users.filter(x=>{
            //console.warn(x)
            //console.warn(month,day,year)
            return user == x._id && x.Schedule.filter(y=>{
                let m = new moment(`${month}/${day}/${year}`,"MMMM/dd/yyyy",true)
                //console.warn(m)
                //console.warn(y+"=="+m)
                return y === m.format("EEEE")

            }).length>0
        }).length>0
    }

    console.warn("Schedule data", schedules);
    console.warn("Current State",currentState)
    const handleSelectChange = async (event) => {
        const selectedValue = event.target.value;
        console.warn(selectedValue);

        if (selectedValue === data[1]) {
            const newSchedule = prompt("Enter Schedule name");
            if (newSchedule) {
                await api("updateDB", {
                    db: "dishes",
                    collection: newSchedule,
                    update: [
                        { _id: userData.given_name },
                        {
                            $set: {
                                _id: userData.given_name,
                                Schedule: [],
                                email: userData.email,
                            },
                        },
                        { upsert: true },
                    ],
                });

                const schedules = await api("getCollections", { db: "dishes" });
                console.warn("new Schedules", schedules);

                setSchedules((oldSchedules) => [...oldSchedules, newSchedule]);
            }
        } else {
            let scheduledData = await api("getDB",{
                "type":"aggregate",
                "database":"dishes",
                "collection":event.target.value,
                "query":[{
                $match:{
                    "_id":userData.given_name
                }
                }],
                "options":{allowDiskUse:true}
            })
            
            console.warn(`${userData.given_name}'s ${event.target.value} data`,scheduledData)
            
            if(scheduledData.length===0){
                console.warn(`${userData.given_name} does not exist, adding to ${event.target.value}`);
                await api("updateDB", {
                    db: "dishes",
                    collection: event.target.value,
                    update: [
                        { _id: userData.given_name },
                        {
                            $set: {
                                _id: userData.given_name,
                                Schedule: [],
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
                database: "dishes",
                collection: selectedValue,
                query: [{ $match: {} }],
                options: { allowDiskUse: true },
            });
            let UserColors = {}
            for(var user of users){
                UserColors[user._id]=stringToRGB(user._id)
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

        <Calendar update={
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

                    for(var user in currentState.UserColors){

                        if(!isScheduled({user,day,month,year})){
                            
                            elem.className = elem.className.replace(user.replace(/\ /gi,"_"),"")

                            continue;
                        }

                        //console.warn(day+"/"+month+"/"+year+" is scheduled for ",user)
                        if(
                            elem.className.indexOf(
                            user
                        ) == -1)
                            elem.className+=` ${user.replace(/\ /gi,"_")}  `;
                            

                        if(previousColor){
                            //console.warn("Previous Color:",previousColor)
                            if(elem.className.indexOf(user)!=-1){
                                console.warn("Other color:",currentState.UserColors[user])

                                let combinedColor = {
                                    r: Math.abs(previousColor.r - currentState.UserColors[user].r)%255,
                                    g: Math.abs(previousColor.g - currentState.UserColors[user].g)%255,
                                    b: Math.abs(previousColor.b - currentState.UserColors[user].b)%255,
                                }

                                //console.warn("Combined Color",combinedColor)
                                
                                preferredColor = {user:user,color:combinedColor};
                                continue;
                            }
                        }   
                        previousColor =  currentState.UserColors[user]
                        preferredColor = {user,color:currentState.UserColors[user]}

                    }

                    if(preferredColor.user){
                        let {r,g,b} = preferredColor.color

                        //console.warn(r,g,b)
                        //alert(r,b,g)
                        applyStyles({
                            [`.${preferredColor.user.replace(/\ /gi,"_")}`]:{
                                "background":`rgb(${r},${g},${b})`,
                                //"opacity":"0.2"
                            }
                        })
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

                let m = new moment(Dict.data,"MM/dd/yyyy")
                console.warn(Dict.data)

                let myUser = getUser(userData.given_name);

                if(myUser.Schedule.length>=4 && myUser.Schedule.indexOf(m.format("EEEE"))==-1){
                    alert("too many days scheduled")
                    return;
                }

                await api("updateDB", {
                    db: "dishes",
                    collection: currentState.currentSchedule,
                    update: [
                        { _id: userData.given_name }, 
                        {
                            [myUser.Schedule.indexOf(m.format("EEEE"))==-1?"$addToSet":"$pull"]: {
                                Schedule: m.format("EEEE"),
                            },
                        },
                        { upsert: true },
                    ],
                });

                const users = await api("getDB", {
                    type: "aggregate",
                    database: "dishes",
                    collection: currentState.currentSchedule,
                    query: [{ $match: {} }],
                    options: { allowDiskUse: true },
                });

                //if(myUser.Schedule.indexOf(m.format("EEEE"))==-1){
                    updateState({
                        ...currentState,
                        Users:users
                    })
                //}
                myUser = users.filter(u=>u._id ===userData.given_name)[0]

                console.warn("My Schedule:"+myUser.Schedule)
                Dict.Apply(({
                    year,
                    month,
                    day,
                    elem
                })=>{
                    let m = new moment(`${month}/${day}/${year}`,"MMMM/dd/yyyy",true)

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