import {useState,useEffect} from "react";
import api from '../../modules/api/api.js';
import moment from '../../modules/moment/moment.js';
import Calendar from '../datepicker/calendar';
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
function ShowSchedule({user,users}){

    const [Data,updateData] = useState({})
    
    useEffect(function(){
        (async function(){
            
            let schedules = await api("getCollections",{"db":"schedules"});

            let minDate = null;
            let maxDate = null;

            let Data2 = {

            }

            let UserData = {

            }
            /*

                UserColors[user.name]=stringToRGB(user.name);
                
                let {r,g,b} = UserColors[user.name];

                let {r2,g2,b2} = revertColor(UserColors[user.name]);

            */

            for(var schedule of schedules){

                let scheduledData = await api("getDB",{
                    "type":"aggregate",
                    "database":"schedules",
                    "collection":schedule,
                    "query":[{
                        $match:{
                            "name":user
                        }
                    }],
                    "options":{allowDiskUse:true}
                });

                UserData[schedule] = {color:
                    stringToRGB(schedule),
                    schedules:scheduledData};

                let minDate2 = null;
                let maxDate2 = null;

                for(var d of scheduledData){
                    if(!d.StartDate)
                        continue;

                    let mm = new moment(d.StartDate,"MM/dd/yyyy")

                    if(!minDate)
                        minDate = mm
                    else{
                        if(mm.isBefore(minDate))
                            minDate=mm;
                    }
                    if(!maxDate){
                        maxDate = mm
                    }
                    else{
                        if(mm.isAfter(maxDate))
                            maxDate=mm;
                    }
                    
                }

                //UserData[schedule].minDate = minDate2;
                //UserData[schedule].maxDate = maxDate2;

            }

            Data2.minDate = minDate;
            Data2.maxDate = maxDate;
            Data2.Users = UserData;

            updateData(Data2)

        })()
    },[Data])

    return <>
        <div>
            <div style={{
                width:"50%"
            }}>
                <Calendar
                min={0}
                
                max={0}

                dateValidator={(date)=>{
                    let now = moment.fromDate(date)
                    return false;
                }}  

                onData={
                    async ({
                        data,elem
                    })=>{

                        //let Day = new moment(data);


                    }
                    } update={
                        //Div, Rome class, and RomeMap
                        //{Element,Rome,RomeMap}
                        (Dict)=>{
                            let {Element,Rome,RomeMap,Apply} = Dict;
                            


                        }
                    }
                    onChange={
                        //Div, Rome class, and RomeMap
                        //{Element,Rome,RomeMap}
                        async (Dict)=>{



                        }
                    } StartTime={new moment()} Step={1}>
            
                </Calendar>
            </div>

        </div>
    </>
}

export default ShowSchedule;