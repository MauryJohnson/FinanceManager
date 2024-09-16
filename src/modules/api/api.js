let api = async function(type,data){
    if(data){
        return await fetch(
            `${window.location.protocol+"//"+window.location.hostname}:3001/api/${type}`, {
                method: 'POST', // or 'POST', 'PUT', etc.
                headers: {
                'Content-Type': 'application/json',
                // Add other headers as needed
                },

                body:JSON.stringify(data)
            }
        ).then(async res=>{
            return await res.json();
        });
    }
    else
        return await fetch(
            `${window.location.protocol+"//"+window.location.hostname}:3001/api/${type}`, {
                method: 'GET', // or 'POST', 'PUT', etc.
                headers: {
                'Content-Type': 'application/json',
                // Add other headers as needed
                },
            }
        ).then(async res=>{
            return await res.json();
        });
}

export default api;