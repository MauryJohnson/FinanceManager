import React, { useState, useEffect } from 'react';
import api from '../../modules/api/api.js'
import Calendar from '../datepicker/calendar'
import ColorCodes from '../colorcodes/colorcodes'
import MultiColors from '../colorcodes/multicolors'
import ReactDOM from 'react-dom';
import MultiSelection from '../multiselection/multiselection.jsx'
import TimePicker from '../datepicker/timepicker.jsx';
import ShowSchedule from './showschedule.jsx';
import Table from '../table/table.jsx';
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

    data = ["", "Show Schedules", "Add Schedule","Add Bill"].concat(data);
    //alert(applyStyles())
    const [schedules, setSchedules] = useState(data);
    
    let [Update,UpdateState] = useState(0);

    const [currentState, updateState] = useState({
        
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

    function isScheduled({user,day,month,year,schedule}){
        //console.warn("Is scheduled")
        return currentState[schedule].Users.filter(x=>{
            //console.warn(x)
            //console.warn(month,day,year)
            return user.split("_")[0] == x.name && [x].filter(y=>{
                
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

        if (selectedValue.split(" ")[0]=="Add") {
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
        }else if(selectedValue=="Show Schedules"){

            //Show schedules for my given user
            //Interface start date and end date 
            //Only allow dates which we are ALLOWED to have 
            //display net properly (given start and end date)
            ReactDOM.render(
                    <>
                    <ShowSchedule user={userData.given_name}
                    >  </ShowSchedule>
                    </>
                ,
                document.getElementById("root2")
            )

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
                                //Schedule: {()},
                                ScheduleType:(scheduledData[0]||{}).Type||"N/A",
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

            let myUser = users.filter(u=>{
                return u.name==userData.given_name;
            })
            if(myUser.length>0){
                setup.children[0].innerText = `Select ${userData.given_name}'s ${myUser[0].ScheduleType} Date for: ${event.target.value}`;
            }
            if(users.length>0){
                
            }

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

    /*

            <select onChange={handleSelectChange}>
                {schedules.map((x, index) => (
                    <option key={index}>{x}</option>
                ))}
            </select>

    */
    if (true || currentState.Users.length === 0 || !currentState.currentSchedule) {
        console.warn(currentState);
        
        return (
            <>
            <MultiSelection 
                    Name={"MS"} Options={schedules} 
                    Callback={async (Selected)=>{
                        
                        let Schedules = {

                        }

                        for(var selection of Selected){

                            let scheduledData = await api("getDB",{
                                "type":"aggregate",
                                "database":"schedules",
                                "collection":selection,
                                "query":[{
                                $match:{
                                    "name":userData.given_name
                                }
                                }],
                                "options":{allowDiskUse:true}
                            })
                            
                            console.warn(`${userData.given_name}'s ${selection} data`,scheduledData)
                            
                            if(scheduledData.length===0){
                                console.warn(`${userData.given_name} does not exist, adding to ${selection}`);
                                scheduledData = await api("getDB",{
                                    "type":"aggregate",
                                    "database":"schedules",
                                    "collection":selection,
                                    "query":[{
                                    $match:{
                                        
                                    }
                                    }],
                                    "options":{allowDiskUse:true}
                                })
                                await api("updateDB", {
                                    db: "schedules",
                                    collection:selection,
                                    update: [
                                        { name: userData.given_name },
                                        {
                                            $set: {
                                                name: userData.given_name,
                                                //Schedule: {()},
                                                ScheduleType:(scheduledData[0]||{}).Type||"N/A",
                                                email: userData.email,
                                            },
                                        },
                                        { upsert: true },
                                    ],
                                });
                            }
                            
                            console.warn("Rendering Schedule...");
                            setup.children[0].innerText = `Select ${userData.given_name}'s Schedule for: ${selection}`;
                
                            const users = await api("getDB", {
                                type: "aggregate",
                                database: "schedules",
                                collection: selection,
                                query: [{ $match: {} }],
                                options: { allowDiskUse: true },
                            });
                            
                            let UserColors = {}
                            
                            Schedules[selection] = {
                                Users:users
                            }

                            /*
                                USerColors:{

                                    Maury:{
                                        PNC
                                        DEF
                                    }
                                    OPT:{
                                        PNC DEF
                                    }

                                }
                            */
                            for(var user of users){

                                UserColors[`${user.name}_${selection}`]=stringToRGB(`${user.name}_${selection}`);
                                
                                let {r,g,b} = UserColors[`${user.name}_${selection}`]
                
                                let {r2,g2,b2} = revertColor(UserColors[`${user.name}_${selection}`]);
                
                                applyStyles({
                                    [`.${user.name}_${selection}`]:{
                                        "background":`rgb(${r},${g},${b})`,
                                        "color":`rgb(${r2},${g2},${b2})`
                                        //"opacity":"0.2"
                                    }
                                })
                            }

                            Schedules[selection].UserColors=UserColors;
                        }

                        //setup.children[0].innerText = `Select ${userData.given_name}'s ${myUser[0].ScheduleType} Date for: ${Object.values(Selected)}`;

                        console.warn("Re Render")

                        UpdateState(++Update)
                        updateState(
                            Schedules
                            //currentSchedule:event.target.value,
                            //Users:users,
                            //UserColors
                        )

                    }}
                    Limit={schedules.length}
                    >
                        
            </MultiSelection>
                    
            <ColorCodes data={
                
                (()=>{
                    let AllColors = {}
                    for(var schedule in currentState){
                        for(var color in currentState[schedule].UserColors){
                            AllColors [color] = currentState[schedule].UserColors[color]
                        }
                    }
                    //console.warn("All colors",AllColors)
                    return AllColors
                })()
            }>
            </ColorCodes>

            <Calendar Update={Update} UpdateState={UpdateState} onData={
            async ({
                data,elem
            })=>{
                
                let sc = Object.keys(currentState)

                let Day = new moment(data,"MM/dd/yyyy");
                
                //ReactDOM.unmountComponentAtNode(elem)

                ReactDOM.render(
                <>
                <TimePicker 
                    
                    Parent={elem.parentNode.parentNode}
                    
                    Day = {Day}

                    //Schedules = {currentState}

                    currentSchedule={sc[sc.length-1]}
                    
                    UserColors={

                        currentState[
                            sc[sc.length-1]
                        ].UserColors
                        //currentState.UserColors[
                            //elem.UserColors
                        //]
                    }

                    userData={userData}
                    
                    Exit={ (Dict,Dict2)=>{ 
                        
                        elem.Exit(Dict,Dict2);
                        
                        /*
                        console.warn("Render bill after exit state",Dict);

                        ReactDOM.render(
                            <>
                            <Bill 
                                Parent={elem.parentNode.parentNode}
                                
                                Day = {Day}
            
                                currentSchedule={currentState.currentSchedule}
                                
                                className={
                                    //currentState.UserColors[
                                        combineColors(elem).replace(/\ /gi,"_")
                                    //]
                                }
            
                                userData={userData}
                                
                                Exit={ (Dict)=>{ 
                                    
                                    //elem.Exit(Dict);
                                    //ReactDOM.unmountComponentAtNode(elem)
                                    //elem.innerText = Day.format("dd");

                                 }}
                            ></Bill>
                            </>,
                            elem
                          ); */

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
                console.warn("APPLYING")
                // RomeMap[Year][Month][Day].className.indexOf("rd-day-selected")!=-1;
                Apply(({
                    year,
                    month,
                    day,
                    elem
                })=>{
                    
                    let preferredColor = {
                        user:null
                    };

                    for(var schedule in currentState){
                        //console.warn(year,month,day," For sch",schedule)
                        //console.warn(month,day,year," IS SCHEDULED:")
                        //let previousColor;
                        /*
                        preferredColor={
                            user:isScheduled({schedule,user:userData.given_name,day,month,year})?user:null,
                            color:currentState[schedule].UserColors[userData.given_name]
                        }*/

                        //console.warn(preferredColor)

                        if(!elem.UserColors)
                            elem.UserColors = {}

                        if(!elem.originalClass)
                            elem.originalClass = elem.className

                        for(var user in currentState[schedule].UserColors){
                            /*
                            console.warn(year,month,day," For sch",currentState[schedule])
                            console.warn(
                                isScheduled({schedule, user,day,month,year})
                            )*/
                            if(!isScheduled({schedule, user,day,month,year})){
                                
                                //elem.className = elem.className.replace(user.replace(/\ /gi,"_"),"")

                                delete elem.UserColors[user]

                                continue;
                            }

                            

                            if(user.indexOf("_and_")!=-1)
                                continue;
                            
                            //if( !elem.UserColors[user] ){
                                //elem.className+=` ${user.replace(/\ /gi,"_")}  `;
                            elem.UserColors[user] = currentState[schedule].UserColors[user];
                            //}
                            
                        }

                        elem.UserColors = SortDict(elem.UserColors);

                    }

                    if(!elem.UserColors)
                        return;

                    if(Object.keys(elem.UserColors).length>0){

                        let h = elem.getBoundingClientRect().height / 
                            Object.keys(elem.UserColors).length;

                        for(var user in elem.UserColors){
                            let {r,g,b} = elem.UserColors[user];
                            let {r2,g2,b2} = revertColor({r,g,b})

                            //console.warn(r,g,b)
                            //alert(r,b,g)
                            applyStyles({
                                [`.${user.replace(/\ /gi,"_")}`]:{
                                    "background":`rgb(${r},${g},${b})`,
                                    "color":`rgb(${r2},${g2},${b2})`,
                                    //"opacity":"0.2"
                                }
                            })
                        }
                        
                        /*
                        elem.className =  elem.originalClass+" "+Object.values(
                            elem.UserColors
                        ).join(" ")*/
                        //let h = elem.getBoundingClientRect().height / Object.keys(colors).length;
                        let cc = Object.keys(elem.UserColors);
                        if(cc.length==1)
                            cc = [cc[0],cc[0]]
                        //let [colors,updateColors] = useState(data)
                        let background = `linear-gradient(0deg, ${
                            cc.map( (x,i)=>{
                                x = elem.UserColors[x];
                                
                                console.warn(
                                    `rgb(${x.r},${x.g},${x.b})${
                                        i<cc.length-1?",":""
                                    }\n`
                                )
                                
                                return `rgb(${x.r},${x.g},${x.b})${
                                    i<cc.length-1?"":""
                                }`

                            })
                        })`;
                        
                        elem.style=`background:${background}`
                        
                    }
                    else{
                        //elem.className =  elem.originalClass  
                        elem.style=`background:inherit`
                    }

                    if(false)
                    if((preferredColor||{}).user && (preferredColor||{}).color){
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
                //alert(Dict.operation)
                //let myUser = getUser(userData.given_name);

                let operation;
                let vars={};

                switch(Dict.Type){
                    case "CurrentDay":
                            vars = {
                                Type:Dict.Type,
                                StartDate:Dict.StartDate,
                                TimeRange:Dict.TimeRange.map(x=>{
                                    return x.format("hh:mm a")
                                })
                            };

                            /*
                            operation = currentState.Users.filter((s)=>{
                                return s.name == userData.given_name && s.StartDate==Dict.StartDate 
                                        
                            }).length==0?"add":"remove"
                            */

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
                            /*
                            operation = currentState.Users.filter((s)=>{
                                return s.name == userData.given_name && s.Repeat==(Dict.Repeat) && s.StartDate==Dict.StartDate
                            }).length==0?"add":"remove"*/
                        break;

                    case "Range":

                        break;
                }

                //if(Dict.operation=="add"){
                    if(Dict.Bill)
                        vars.Bill = Dict.Bill;
                    if(Dict.Description)
                        vars.Description = Dict.Description
                //}   
        
                let myUser = currentState[Dict.currentSchedule].Users.filter(u=>{
                    return u.name==userData.given_name
                })[0];

                if(Dict.operation=="add")
                    await api("insertDB", {
                        db: "schedules",
                        collection: Dict.currentSchedule,
                        insert: {
                                name: userData.given_name, 
                                ScheduleType:myUser.ScheduleType,
                                ...vars,
                                email: userData.email
                            }
                        }
                    );
                else if(Dict.operation=="update"){
                    await api("updateDB", {
                        db: "schedules",
                        collection: Dict.currentSchedule,
                        update: [
                            {
                                _id:Dict.previousState._id
                             },
                            {
                                $set: {
                                    name: userData.given_name, 
                                    ScheduleType:myUser.ScheduleType,
                                    ...vars,
                                    email: userData.email
                                },
                            },
                            { upsert: true },
                        ],
                    });
                }
                else if(Dict.operation=="remove") {
                    await api("removeDB", {
                        db: "schedules",
                        collection: Dict.currentSchedule,
                        remove: {
                            _id:Dict.previousState._id
                                /*
                                name: userData.given_name, 
                                ScheduleType:myUser.ScheduleType,
                                ...vars,
                                email: userData.email*/
                            }
                        }
                    ); 
                }
                else{
                    alert("An Error occured!")
                    return
                }

                let users = await api("getDB", {
                    type: "aggregate",
                    database: "schedules",
                    collection: Dict.currentSchedule,
                    query: [{ $match: {} }],
                    options: { allowDiskUse: true },
                });

                console.warn(users)

                if(users.length<=1){
                    await api("updateDB", {
                        db: "schedules",
                        collection: Dict.currentSchedule,
                        update: [
                            { name: userData.given_name },
                            {
                                $set: {
                                    name: userData.given_name,
                                    //Schedule: {},
                                    ScheduleType:currentState[Dict.currentSchedule].Users[0].ScheduleType,
                                    email: userData.email,
                                },
                            },
                            { upsert: true },
                        ],
                    });
                    users = await api("getDB", {
                        type: "aggregate",
                        database: "schedules",
                        collection: Dict.currentSchedule,
                        query: [{ $match: {} }],
                        options: { allowDiskUse: true },
                    });
                }

                //if(myUser.Schedule.indexOf(m.format("EEEE"))==-1){
                    /*updateState({
                        ...currentState,
                        Users:users
                    })*/

                    updateState(OldState=>{
                        OldState[Dict.currentSchedule] = {
                            ...OldState[Dict.currentSchedule],
                            Users:users
                        }
                        return OldState;
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

            </>
        );
    } else {
        console.warn(currentState)
        console.warn("APP")
        let Bills = (currentState.Users.filter(u=>{
            return u.name==userData.given_name && !!u.Bill
        }))/*.reduce((acc,x)=>{
            acc.push( (x||{}).Bill)
            return acc
        },[]);*/
        console.warn("Bills",Bills)
        return (<>
        
        <ColorCodes data={
            currentState.UserColors
        }>
        </ColorCodes>

        <Calendar onData={
            async ({
                data,elem
            })=>{

                let Day = new moment(data,"MM/dd/yyyy");

                ReactDOM.render(
                <>
                <TimePicker 
                    Parent={elem.parentNode.parentNode}
                    hasBill={currentState.Users.filter(u=>{

                        return u.ScheduleType=="Bill";
        
                    }).length>0}
                    Day = {Day}

                    currentSchedule={currentState.currentSchedule}
                    
                    className={
                        //currentState.UserColors[
                            combineColors(elem).replace(/\ /gi,"_")
                        //]
                    }

                    userData={userData}
                    
                    Exit={ (Dict,Dict2)=>{ 
                        
                        elem.Exit(Dict,Dict2);
                        
                        /*
                        console.warn("Render bill after exit state",Dict);

                        ReactDOM.render(
                            <>
                            <Bill 
                                Parent={elem.parentNode.parentNode}
                                
                                Day = {Day}
            
                                currentSchedule={currentState.currentSchedule}
                                
                                className={
                                    //currentState.UserColors[
                                        combineColors(elem).replace(/\ /gi,"_")
                                    //]
                                }
            
                                userData={userData}
                                
                                Exit={ (Dict)=>{ 
                                    
                                    //elem.Exit(Dict);
                                    //ReactDOM.unmountComponentAtNode(elem)
                                    //elem.innerText = Day.format("dd");

                                 }}
                            ></Bill>
                            </>,
                            elem
                          ); */

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
                //alert(Dict.operation)
                //let myUser = getUser(userData.given_name);

                let operation;
                let vars={};

                switch(Dict.Type){
                    case "CurrentDay":
                            vars = {
                                Type:Dict.Type,
                                StartDate:Dict.StartDate,
                                TimeRange:Dict.TimeRange.map(x=>{
                                    return x.format("hh:mm a")
                                })
                            };

                            /*
                            operation = currentState.Users.filter((s)=>{
                                return s.name == userData.given_name && s.StartDate==Dict.StartDate 
                                        
                            }).length==0?"add":"remove"
                            */

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
                            /*
                            operation = currentState.Users.filter((s)=>{
                                return s.name == userData.given_name && s.Repeat==(Dict.Repeat) && s.StartDate==Dict.StartDate
                            }).length==0?"add":"remove"*/
                        break;

                    case "Range":

                        break;
                }

                //if(Dict.operation=="add"){
                    if(Dict.Bill)
                        vars.Bill = Dict.Bill;
                    if(Dict.Description)
                        vars.Description = Dict.Description
                //}   

                let myUser = currentState.Users.filter(u=>{
                    return u.name==userData.given_name
                })[0];

                if(Dict.operation=="add")
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
                else if(Dict.operation=="update"){
                    await api("updateDB", {
                        db: "schedules",
                        collection: currentState.currentSchedule,
                        update: [
                            {
                                _id:Dict.previousState._id
                             },
                            {
                                $set: {
                                    name: userData.given_name, 
                                    ScheduleType:myUser.ScheduleType,
                                    ...vars,
                                    email: userData.email
                                },
                            },
                            { upsert: true },
                        ],
                    });
                }
                else if(Dict.operation=="remove") {
                    await api("removeDB", {
                        db: "schedules",
                        collection: currentState.currentSchedule,
                        remove: {
                            _id:Dict.previousState._id
                                /*
                                name: userData.given_name, 
                                ScheduleType:myUser.ScheduleType,
                                ...vars,
                                email: userData.email*/
                            }
                        }
                    ); 
                }
                else{
                    alert("An Error occured!")
                    return
                }

                let users = await api("getDB", {
                    type: "aggregate",
                    database: "schedules",
                    collection: currentState.currentSchedule,
                    query: [{ $match: {} }],
                    options: { allowDiskUse: true },
                });

                console.warn(users)

                if(users.length<=1){
                    await api("updateDB", {
                        db: "schedules",
                        collection: currentState.currentSchedule,
                        update: [
                            { name: userData.given_name },
                            {
                                $set: {
                                    name: userData.given_name,
                                    //Schedule: {},
                                    ScheduleType:currentState.Users[0].ScheduleType,
                                    email: userData.email,
                                },
                            },
                            { upsert: true },
                        ],
                    });
                    users = await api("getDB", {
                        type: "aggregate",
                        database: "schedules",
                        collection: currentState.currentSchedule,
                        query: [{ $match: {} }],
                        options: { allowDiskUse: true },
                    });
                }

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
        
        {

            currentState.Users.filter(u=>{

                return u.ScheduleType=="Bill";

            }).length>0?
            <>
                { userData.given_name }'s Bills From {
                    (Bills[0]||{}).StartDate || "_"
                } to {
                    (Bills[Bills.length-1]||{}).StartDate || "_"
                }

                <Table key="1" rows={
                Bills.length==0?[
                {
                    "title":"",
                    "amount":0,
                    "time":""
                },
                ]:Bills.map(x=>{
                    return {
                        title:currentState.currentSchedule,
                        "amount":x.Bill,
                        "time":x.StartDate+" "+x.TimeRange
                    }
                })
                }>
                </Table>
            </>
            :<></>

        }

        </>)
    }
}


export default Schedule;