import React, { useState } from 'react';

function revertColor({r,g,b}){
    return {
        r2:Math.abs(255-r),
        g2:Math.abs(255-g),
        b2:Math.abs(255-b)
    }
}

function MultiColors({value,elem,colors}){
    
    let h = elem.getBoundingClientRect().height / Object.keys(colors).length;
    let cc = Object.keys(colors);
    if(cc.length==1)
        cc = [cc[0],cc[0]]
    //let [colors,updateColors] = useState(data)
    let background = `linear-gradient(0deg, ${
        cc.map( (x,i)=>{
            x = colors[x];
            
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
    console.warn("BG",background)
    return <>
        <div 
            background={background}
        style={{
            position:"relative",
            background:background

        }}
        >
        {value}
        </div>
    </>

}

export default MultiColors;