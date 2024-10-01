import React, { useState } from 'react';

function revertColor({r,g,b}){
    return {
        r2:Math.abs(255-r),
        g2:Math.abs(255-g),
        b2:Math.abs(255-b)
    }
}

function ColorCodes({data}){
    console.warn("Color Codes!",data)
    let s = []
    let w = window.innerWidth/100;

    let [colors,updateColors] = useState(data)
    
    return <>
            {
                Object.keys(data).map(x=>{
                    
                    let {r2,g2,b2} = revertColor(data[x]);


                    return <span style={{
                        marginRight:"5px"
                    }}> {x.replace(/_and_/gi,"+")}'s Color: <div style={
                        {  
                            content:"✖",
                            color:`rgb(${r2},${g2},${b2})`,
                            display:"inline-block",
                            height:w,
                            width:w,
                            border:"2px solid",
                            background:`rgb(${data[x].r},${data[x].g},${data[x].b})` 
                        }
                    }
                    >✖</div></span>
                    
                    
                })
            }
    </>

}

export default ColorCodes;