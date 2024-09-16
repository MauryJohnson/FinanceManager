import React, { useState, useEffect } from 'react';
import Row from '../row/row.jsx'
import Entry from "../item/item.jsx"
import "./table.css"

//Initial state is []
//Any state contains 
/*
    [
        []
    ] 
*/
//Our table initialized with 3 rows
function Table({rows}){

    const [items, setItems] = useState(rows);
    
    //We add Entry Objects to our Table
    const addItem = (newItem) =>{
        setItems((prevItems) => [...prevItems, newItem]);
    }

    const [loading, setLoading] = useState(true);
    /*
    if(rows){
        useEffect(() => {
            
            setItems(rows);
            
            setLoading(false);

          }, []); // Empty dependency array means this runs once on mount
    }*/

    let net = items.reduce((accumulator, currentValue, index, array) => {
        // Return the updated accumulator

        return accumulator + (currentValue.amount||0);
      }, 0);

    return (
        <table className="excel-table">
            <tbody>
            <tr>
                {
                    items.map((data,i)=><Entry id={i} setItems={setItems} data={data} mode="title"  />)
                }
            </tr>
            <tr>
                {
                    items.map((data,i)=><Entry setItems={setItems} id={i} data={data} mode="amount" />)
                }
            </tr>
            <tr>
                {
                    items.map((data,i)=><Entry id={i} setItems={setItems} data={data} mode="time"  />)
                }
            </tr>
            <tr>

                <td style={{ color:net>0?"green":"red" }}>Net: {
                     net
                }
                </td>

            </tr>
            </tbody>
        </table>
    )
}


export default Table