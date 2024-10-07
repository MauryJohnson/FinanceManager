import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import api from './modules/api/api.js'
import Schedule from './components/schedule/schedule.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import TimePicker from './components/datepicker/timepicker.jsx';
import moment from './modules/moment/moment.js'

await async function(){
    /*


    let ud = await api("updateDB",{
        "db":"schedules",
        "collection":"schedule1",
        "update":[
            {_id:"Maury"},
            
            {
                $set:{
                    _id:"Maury",
                    "Schedule":[
                        "Monday","Wednesday","Friday","Sunday"
                    ]
                }
            },
            
            {upsert:true}
        ]
      })

      let ud2 = await api("updateDB",{
        "db":"schedules",
        "collection":"schedule1",
        "update":[
            {_id:"Elham"},
            
            {
                $set:{
                    _id:"Elham",
                    "Schedule":[
                        "Monday","Tuesday","Thursday","Saturday"
                    ]
                }
            },
            
            {upsert:true}
        ]
      })

    */
    
    
    /*
    {   
        _id:"Maury",

        "Schedule":[
            "Monday","Wednesday","Friday"
        ],
        
    }
    */
  //let users = await api("getUsers");
  //console.warn("USERS:"+users)
  
  //Get data from API

  const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    } catch (error) {
        console.error('Invalid JWT:', error);
        return null;
    }
};

  let root = createRoot(document.getElementById('root2'));

  root.render(
    <StrictMode>
        <GoogleOAuthProvider clientId="318831092161-1drftkajdk5u2iqb2sqlk36usu5s76jv.apps.googleusercontent.com">
        <GoogleLogin
            onSuccess={async credentialResponse => {
                console.log(credentialResponse);
                const userData = parseJwt(credentialResponse.credential); // Decode JWT

                console.log('User Info:', userData);
                let setup = document.getElementById("setup");
                //setup.children[0].innerText = "Select a Schedule"
                let schedules = await api("getCollections",{"db":"schedules"});
                console.warn("Schedules:",schedules)
                
                //let root = createRoot(document.getElementById('root3'));
                setup.children[0].innerText = `Select ${userData.given_name}'s Schedule`;

                
                root.render(
                    <>
                        <Schedule setup={setup} root={root} userData={userData} data={
                            await api("getCollections",{"db":"schedules"})
                        }></Schedule>
                    </>
                )
            }}
            onError={() => {
                console.log('Login Failed');
            }}
        />
        </GoogleOAuthProvider>
      
    </StrictMode>,
  );


}()
