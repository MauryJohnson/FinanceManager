import { useState } from 'react'
import "./item.css"
import Mutation from "../mutation/mutation.jsx"

//Initial state is []
//Any state contains

//Return moment data later
function toString(json){
    if(!json.time)
        return ""
    return json.amount//+" ("+json.time+")";
}
/*
    An Item object contains two columns for JSON data 
    [
        Title,
        JSON Information {type:"income/expense", amount: 5200 }
    ]

    An Entry has two column items
*/

//row1, row2 are components
function Entry({setItems,id,data,mode}){

        const [entry,setEntry] = useState(data);

            // Handler to restrict text deletions
        const handleInput = (event) => {
            const newText = event.target.innerText;
            // If newText is shorter than the original, it means text was deleted
            if (newText.length < text.length) {
            event.target.innerText = text; // Reset text to original
            } else {
            setText(newText); // Update state if newText is valid
            }
        };

        const moveOverEdit = (event)=>{
            event.target.contentEditable=true;
            
        }

        const moveOutEdit = (event)=>{
            if(event.target.children[0])
                event.target.innerHTML=(
                    event.target.children[0].innerText
                )
        }
        
        switch(mode){
            case "title":
                return (
                    <Mutation setEntry={setEntry} setItems={setItems} mode={mode} id={id} content={entry.title} data={entry}>
                    <td  id={id} onMouseOver={moveOverEdit}  className="title"></td>
                    </Mutation>
                )
            case "time":
                return (
                    <Mutation setEntry={setEntry}  setItems={setItems} mode={mode} id={id} content={entry.time} data={entry}>
                    <td  id={id} ></td>
                    </Mutation>
                )
            case "duration":
                return (
                    <Mutation setEntry={setEntry}  setItems={setItems} mode={mode} id={id} content={entry.duration} data={entry} >
                    <td  
                    id={id} ></td>
                    </Mutation>
                )
            default:  
                let c = toString(entry);
                
                return (
                    <Mutation  setEntry={setEntry} 
                    setItems={setItems} mode={mode} id={id} content = {c} data={entry}>
                         <td  
                         id={id} >
                            
                        
                        </td>
                    </Mutation>
                )
        }
        
    
}


export default Entry