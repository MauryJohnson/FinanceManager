let queue = function(J={}){
    
    let timeoutQueue =  {
        "timeout":J.timeout||1000,
        "limit":J.limit||1,
        "queue":[],
        "engage":function(){

            let p = new Promise(function(rs,rj){
                setTimeout(function(){
                    if(timeoutQueue.queue.length>=timeoutQueue.limit){
                        timeoutQueue.queue.shift()
                        rs(true);
                    }

                    else{
                        timeoutQueue.queue.shift()
                        rj("overridden, timed out")
                    }

                    

                },timeoutQueue.timeout)
            })

            timeoutQueue.queue.push(
                p
            )

            return p;
            
        }
    }
    return timeoutQueue
}

export default queue;