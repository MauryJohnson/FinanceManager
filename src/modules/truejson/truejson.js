var JSON2 = JSON;
module.exports = function(JSON){

  JSON.stringify3 = function(obj) {
    var ret = "{";

    for (var k in obj) {
      var v = obj[k];

      if (typeof v === "function") {
        v = String(v)
      } else if (v instanceof Array) {
        v = JSON.stringify2(v);
      } else if (typeof v === "object") {
        v = JSON.stringify2(v);
      } else {
        v = `"${v}"`;
      }

      ret += `\n  ${k}: ${v},`;
    }

    ret += "\n}";

    return ret;
  }

  JSON.stringify2 = function(obj,first = true){
    var arr =  obj instanceof Array;
    var type;
    if(arr){
      type="array";
    }
    var OBJ = typeof obj =="object";
    if(OBJ && !arr){
      type="object"
    }

    var ret = type=="array" ? "[": type=="object"? "{" : "";

    if(OBJ)
      for(var o in obj){
        if(typeof obj[o] == "object"){
          var arr2 = obj[o] instanceof Array;
          if(arr2 && arr)
              ret+= JSON.stringify2(obj[o],false)
          else if(arr){
            ret+= "\n" + JSON.stringify2(obj[o],false) //+ (o<obj.length-1?",":"")
          }
          else
            ret+= "\n\""+o+"\":"+JSON.stringify2(obj[o],false)
        }
        else if(typeof obj[o] =="function"){
          if(arr){
            ret+="\n"+String(obj[o])
          }
          else
            ret+="\n \""+o+"\":"+String(obj[o])
        }
        else{
          var stringed = typeof obj[o]=="string"//isNaN(parseFloat(obj[o]))//(JSON.stringify(obj[o])+"").indexOf("\"")!=-1 || (JSON.stringify(obj[o])+"").indexOf("'")!=-1;
          if(arr){
            ret+="\n"+(stringed?"\`":"")+(obj[o])+(stringed?"\`":"")
          }
          else
            ret+="\n \""+o+"\":"+(stringed?"\`":"")+obj[o]+(stringed?"\`":"")
        }

        if(Object.keys(obj).indexOf(o)!=Object.keys(obj).length-1){
          ret+=",";
        }

      }
    else{
      var stringed =typeof obj=="string"  //isNaN(parseFloat(obj))//(JSON.stringify(obj)+"").indexOf("\"")!=-1;
      ret+="\n"+(stringed?"\"":"")+(obj)+(stringed?"\`":"")+",";
    }

    if(OBJ){
      if(arr){
        ret+="\n]";
      }
      else if(OBJ)
        ret+="\n}";
    }

    return ret;
  }

  JSON.parse2 = function(s){
    return eval("["+s+"]")[0];
  }

  JSON.OJSON = JSON2;

  return JSON;

}
