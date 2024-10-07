

import React, { useState, useEffect,useRef,createRef } from 'react';

function MultiSelection({Name,Options,Callback,Limit}){
  
  let [State,SetState] = useState({
    Options,
    Selection:[]
  });
  
  const Ref = createRef(null);

  let Add = function(e,This=e.target){
    let Prompt = Ref.current;

    let idx = parseInt(This.getAttribute("idx"))

    if(This.value){

      if(Prompt.children.length<Limit){

        SetState(function(OldState){
            let Selection = [
                ...OldState.Selection,This.value
            ];
            
            Callback(Selection);

            return {
                //lastValue:This.value,
                Options:OldState.Options,
                Selection
            }

        })

        
      }
      else if(Prompt.children.length==Limit){
        
        SetState(function(OldState){
            let Selection = [...OldState.Selection]
            Selection[idx] = This.value;

            Callback(Selection);

            return {
                //lastValue:This.value,
                Options:OldState.Options,
                Selection
            }

        })
      }
    }
    else{

        

        SetState(function(OldState){
            
            let Selection = [...State.Selection];
            
            let Options = [...State.Options];

            (Selection.splice(idx,1))

            Callback(Selection);

            return {
                Options,
                Selection
            }
        })
      

      
      
      /*
      if(Prompt.children.length>=2)
        This.parentNode.removeChild(This)
      */
    }


  }
  console.warn(State)
  return <> <div ref={Ref} id={Name} Limit={Limit} onChange={Add}>
        {(State.Selection.concat(State.Selection.length<Limit?[""]:[])).map((s,i)=>{
            
            return <select idx={i} value={s}  Add={Add}>{
                    (
                        [""]
                    ).concat(
                    ([ ... (s?[s]:[])].concat(
                        State.Options.filter(o2=>{
                            return State.Selection.indexOf(o2)==-1
                        })
                    ))).map(o=>{
                        return <option>{o}</option>
                    })
                }
                
            </select>
        })}
    </div>
  </>;
}

export default MultiSelection;