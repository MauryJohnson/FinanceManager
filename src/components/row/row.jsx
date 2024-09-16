import { useState } from 'react'
import "./row.css"

//Initial state is []
//Any state contains 
/*
    [
        []
    ]
*/
function Row({data}){
    return (
        <tr>
            {
                data.map((item,index)=><td>{item}</td>)
            }
        </tr>
    )
}


export default Row