import { useState, Children, isValidElement, cloneElement, useRef,useEffect } from 'react'
import "./mutation.css"
import api from '../../modules/api/api';
import Queue from '../../modules/queue/queue';


function Mutation({mode,setItems, setEntry, children,content,data,id}){
    let  OPACITY = data?0.3:1;

    /*
    const mouseOverFunction = (e)=>{
        e.target.parentNode.style["opacity"] = OPACITY;
        console.warn("Mover")
    }

    const mouseOutFunction = (e)=>{
        e.target.parentNode.style["opacity"] = data?0:1;

    }*/

    const add = async (newItem,index)=>{

        index = parseInt(index.split(" ")[1])
        console.warn("ADD:",newItem,index)
        
        newItem = {
            "id":index+1,
            "title":"",
            "amount":"",
            "time":""
        };

        let _id = await api(`addFinance/${localStorage.user}`,newItem)
        
        //newItem.id = _id;

        if(_id){
            
            setItems((prevItems)=>{

                let newItems = [];//[...prevItems];

                for(var v in prevItems){
                    
                    newItems.push(prevItems[v])

                    if(v == index)
                        newItems.push(newItem)

                    if(v>=index)
                        newItems[newItems.length-1].id+=1
                }

                console.warn(newItems)

                return newItems;

            })
            
        }
    }

    const remove = async (e,index)=>{
        index = parseInt(index.split(" ")[1])
        console.warn("remove:",index)
        setItems((prevItems)=>{

            let newItems = [] //([].concat(prevItems))
            for(var p in prevItems){
                if(p!=index)
                    newItems.push(prevItems[p])
            }
            for(var p in newItems){
                if(newItems[p].id>=index)
                    newItems[p].id-=1
            }
            //newItems.splice(index,1);

            if(newItems.length==0){
                newItems = [
                    {   
                        "id":0,
                        "title":"",
                        "amount":"",
                        "time":""
                    },
                ]
            }

            console.warn(newItems)
            
            return newItems;
        })
        let id = await api(`deleteFinance/${localStorage.user}`,{id:index})
       
    }

    let timeoutQueue= new Queue({
        "timeout":50,
        "limit":1
    })

    const update = async (newItem)=>{

        console.warn("UPDATE:",newItem)
        
        setItems((prevItems)=>{
            let newItems =  [...prevItems]

            newItems[newItem.id][Object.keys(newItem)[1]] = newItem[Object.keys(newItem)[1]]

            console.warn(newItems)
            return newItems
        })

        if(await timeoutQueue.engage()){

            try{
                await api(`updateFinance/${localStorage.user}`,newItem)
            }catch(e){
                console.error(e);
            }

            
        }
        
    
        
    }
    //Return moment data later
    function toString(json){
        if(!json.time)
            return ""
        return json.amount//+" ("+json.time+")";
    }
    /*
    const inputRef = useRef(null); // Create a ref

    // Focus the input element after state is updated
    useEffect(() => {
        if (inputRef.current) {
            
            const range = document.createRange();
            const selection = window.getSelection();
      
            range.selectNodeContents(inputRef.current);
            selection.removeAllRanges();
            //if(inputRef.current.children.length>0)
            //range.setStart(inputRef.current,1)
            //selection.addRange(range);

            inputRef.current.focus();

        }
    }, [data[mode]]);*/

    // Clone the child element and add three divs
    const enhancedChildren = Children.map(children, (child,i) => {
        // Check if child is a valid React element
        if (isValidElement(child)) {
            console.warn(child)
            
            
        id= "operate "+id;
            
        // Add three 33% width divs within the child
        return cloneElement(child, {
            
             style: { ...child.props.style, position: 'relative', height: '100%' }, // Ensure the child has a relative position and 100% height
        children: (
          <>
            <textarea   onMouseOver = {(e)=>{
                e.target = e.target.parentNode
            for(var c in e.target.children){
                if(e.target.children[c].style && e.target.children[c].className!="content")
                e.target.children[c].style["opacity"] = 1;
            }
        }}
        onMouseOut = {(e)=>{
            e.target = e.target.parentNode
            for(var c in e.target.children){
                if(e.target.children[c].style && e.target.children[c].className!="content")
                e.target.children[c].style["opacity"] = 0;
            }
        }} onMouseDown={
                (e)=>{
                    e.target=e.target.parentNode
                    for(var c in e.target.children){
                        if(e.target.children[c].style && e.target.children[c].className!="content"){

                            if(e.target.children[c].style["opacity"]!= 1)
                                e.target.children[c].style["opacity"] = 1;
                            else{
                                e.target.children[c].style["opacity"] = 0;
                            }    
                        
                        }
                    }
                    
                }
            }  className="content" id={id} mode={mode} onInput={async (e)=>{
                console.warn(e.target.getAttribute("mode")+" Input")
                let v = e.target.value;
                
                if(e.target.getAttribute("mode")=="amount"){
                    //v = parseFloat(v)
                    if(isNaN(v) && v!="-")
                        v=0
                }
                
                update({
                    id:parseInt(id.split(" ")[1]),
                    [e.target.getAttribute("mode")]:v
                })

                
            }}contentEditable value={content}>
            {content}
            </textarea>
            <div id={id} className="cancel" onMouseOver={(e)=>{
                                e.target.style["opacity"] = 1;
                            
                        }}
                        onMouseOut={(e)=>{
                                e.target.style["opacity"] = 0;
                            
                        }} onClick={(e)=>{
                            remove(e,e.target.id)
                        }} style={{ cursor:"pointer", opacity:0, width: '5%', height: '5%', position:"absolute","top":-10,"left":-5}}></div>
            
            <div id={id} className="add"  onMouseOver={(e)=>{
                                e.target.style["opacity"] = 1;
                            
                        }}
                        onMouseOut={(e)=>{
                                e.target.style["opacity"] = 0;
                            
                        }} onClick={(e)=>{
                            add(e,e.target.id)
                        }} style={{ textAlign:"center",  opacity:0, width: '5%', height: '5%',  position:"absolute","bottom":22, right:5}}>
                {data===null?"ADD":""}
            </div>

             {
                Children.map(child.props.children, (grandchild) =>
                    isValidElement(grandchild)
                      ? cloneElement(grandchild, {
                          contentEditable: 'true',
                          style: { ...grandchild.props.style, ...{ contentEditable: 'true' } }
                        })
                      : grandchild
                  )
             }  {/* Preserve original child content */}
          </>
        ),
        onMouseOver:(e)=>{
            for(var c in e.target.children){
                if(e.target.children[c].style && e.target.children[c].className!="content")
                e.target.children[c].style["opacity"] = 1;
            }
        },
        onMouseOut:(e)=>{
            for(var c in e.target.children){
                if(e.target.children[c].style && e.target.children[c].className!="content")
                e.target.children[c].style["opacity"] = 0;
            }
        }
        });
        }
        return child;
    });

    return <>{enhancedChildren}</>

}

export default Mutation;