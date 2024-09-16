import { useState, Children, isValidElement, cloneElement, useRef,useEffect } from 'react'
import "./mutation.css"
import api from '../../modules/api/api';



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

        index = parseInt(index.split(" ")[1]) +1
        console.warn("ADD:",newItem,index)
        
        newItem = {
            "id":index,
            "title":"",
            "amount":"",
            "time":""
        };

        let _id = await api(`addFinance/${localStorage.user}`,newItem)
        
        //newItem.id = _id;

        if(_id)
            setItems((prevItems)=>{

                let newItems = [...prevItems];

                newItems.splice(index,0,newItem);

                return newItems;

            })
    
    }

    const remove = async (e,index)=>{
        index = parseInt(index.split(" ")[1])
        console.warn("remove:",index)

        let id = await api(`deleteFinance/${localStorage.user}`,{id:index})
        
        //newItem.id = _id;

        if(id)
        //setItems((prevItems) => [...prevItems, newItem]);
        setItems((prevItems)=>{

            let newItems = ([].concat(prevItems))
            newItems.splice(index,1);
            
            if(newItems.length==0){
                newItems = [
                    {
                        "title":"",
                        "amount":"",
                        "time":""
                    },
                ]
            }

            return newItems;
        })
    }

    const update = async (newItem)=>{

        console.warn("UPDATE:",newItem)
        
        try{
            await api(`updateFinance/${localStorage.user}`,newItem)
        }catch(e){
            console.error(e);
        }
        
        /*
        setEntry((prevItem)=>{
            return {...prevItem,[Object.keys(newItem)[1]]:newItem[Object.keys(newItem)[1]]};
        })*/
        
        setItems((prevItems)=>{
            let newItems =  [...prevItems]

            newItems[newItem.id][Object.keys(newItem)[1]] = newItem[Object.keys(newItem)[1]]

            return newItems
        })
        
    
        
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
            <textarea className="content" id={id} mode={mode} onInput={async (e)=>{
                console.warn(e.target.getAttribute("mode")+" Input")
                let v = e.target.value;
                if(e.target.getAttribute("mode")=="amount")
                    v = parseFloat(v)
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