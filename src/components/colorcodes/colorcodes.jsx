import React, { useState } from 'react';


function ColorCodes({data}){
    console.warn("Color Codes!",data)
    let s = []
    let w = window.innerWidth/100;

    let [colors,updateColors] = useState(data)
    
    return <>
            {
                Object.keys(data).map(x=>{
                    
                    return <span style={{

                    }}> {x}'s Color: <div style={
                        {   display:"inline-block",
                            height:w,
                            width:w,
                            background:`rgb(${data[x].r},${data[x].g},${data[x].b})` 
                        }
                    }
                    ></div></span>
                    
                    
                })
            }
    </>

}

export default ColorCodes;