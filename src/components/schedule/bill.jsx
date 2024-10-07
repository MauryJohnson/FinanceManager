
import { useState, useEffect, createRef} from 'react';

function Bill({
    Parent,
    Day,
    userData,
    className,
    currentSchedule,
    Exit=function({}){}
}){
    
    let selected = {}
    let bounds = Parent.getBoundingClientRect();
    let [State,UpdateState] = useState(0)

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
        }} style={{
            display:"inline-block",
            position:"relative",
            overflow:"scroll",
            background:"#333",
            "text-align":"center",
            color:"white",
            padding:"10px",
            //height:bounds.height*2,
            width:bounds.width*1.5
        }}>  
            <div><div onMouseOver={(e)=>{
                            selected[e.target.id] = true;

            }}id="iconX" className="iconX" onClick={(e)=>{
                //e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                Exit()
            }}>✖</div></div>
            <div id="iconCheck" onClick={(e)=>{
                Exit(State)
            }} className="iconCheck"></div>
            
            Enter Bill Amount
            <input onInput={(e)=>{
                
                let v =e.target.value;

                if(isNaN(v) && v!="-")
                    v=0

                e.target.value = v;
            }}>

            </input>

        </div> 
    </>
}

export default Bill;