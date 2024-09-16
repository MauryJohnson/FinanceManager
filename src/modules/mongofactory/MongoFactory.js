module.exports = function(Settings){

  const {exec, execFile} = require("child_process");

  const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;

  const v8 = require('v8');

  process.exec = exec;
  function Exec(Cmd,Args){

    //Cmd = "\""+Cmd+"\"";
    console.log("EXEC:"+Cmd)
   return new Promise(function(rs,rj){
       process.exec(Cmd,function(e,stdout,stderr){

         console.log(stdout);
        if(e){

          //console.log(e);
          //return  rj(e);
          //return rs(null);
        }
        if(stderr){

             console.log(stderr);
             //return rj(stderr);
             //return rs(null);
        }
        if(stdout.indexOf("already running")!=-1)
          return rs(stdout);
        else if(e || stderr)
          return rs(null);
        else {

          return rs(stdout);

        }
      })

    })

  }

  var MongoFactory = this;
  /*
  async function myCleanup() {

    await MongoFactory.Close();

  };
  var cu = require(__dirname+"/../cleanup/cleanup.js");

  console.log(cu)
  var cleanup = new cu.Cleanup(myCleanup);
  */
  var MongoClient = require('mongodb').MongoClient;


  //MongoFactory.Mongo = null;

  MongoFactory.Retries = 3;

  MongoFactory.Timeout =   MongoFactory.TIMEOUT = 5000;

  MongoFactory.Verbose = false;

  //MongoFactory.Url = null;

  if(Settings){
    for(var s in Settings){

      var s2 = s.toLowerCase().substring(0,1).toUpperCase()+s.substring(1,s.length);

      //console.log(s2)

      MongoFactory[s2] = Settings[s] || MongoFactory[s2];
    }
  }
  else{

    throw("No Settings Argument Given");

  }

  if(MongoFactory.Url=="LOCAL"){
    //delete MongoFactory.Url;
    MongoFactory.Local = true;
  }
  //var url = "mongodb://localhost:27017/";

  var timeout = function(ms){
    return new Promise(function(rs,rj){
      require('long-timeout').setTimeout(function(){
        rs();
      }
      ,
        ms
      )
    })
  }
  const path = require('path');

  async function loadMoment() {
    const { default: moment } = await import(path.resolve(__dirname, '../moment/moment.js'));
    return moment;
  }
  let moment;
  
  // Usage
  loadMoment().then(moment2 => {
    moment = moment2
  });

  var timeout = function(ms){
    return new Promise(function(rs,rj){
      var now = new moment().valueOf();
      require('long-timeout').setTimeout(async function(){

        var expected = ms + now;
        var actual = new moment().valueOf();

        if(actual<expected){

          var diff = expected - actual;

          console.error(actual+" is not near:"+expected+". wait for: "+diff);

          await timeout(diff);
          
          rs();

        }
        else{

          console.log(ms+" Done")

          rs();
        }

        delete now
        delete actual
      }
      ,
        ms
      )
    })
  }

  var TryingRestart = false;
  var TryRestart = async function(){
    if(!TryingRestart){

      TryingRestart = true;

      for(var i=1;i<MongoFactory.Retries;i+=1){
        var Restart = await Exec("sudo mongod");
        console.log("MongoDB PRocess Exited... Retries Left:"+MongoFactory.Retries - i);
        if(Restart!=null){
          console.log("SUCCESS");
          return;
        }
      }

      console.error("MongoDB Process Failed");

      TryingRestart = false;

      //throw("MongoDB Process Failed to STart");
    }
  }

  MongoFactory.Close = async function(){

    await MongoFactory.Mongo.close();

    if( MongoFactory.mongoServer ){
      await  MongoFactory.mongoServer.stop();
      delete MongoFactory.mongoServer;
    }
  }

  MongoFactory.TryConnect = async function(url){

    if(MongoFactory.Local){
      if(!MongoFactory.mongoServer){
        MongoFactory.mongoServer = await MongoMemoryServer.create();
      }
      MongoFactory.Url = url = MongoFactory.mongoServer.getUri();
      //try{
      //x+=1;
      /*}catch(e){
        console.error(e);
      }*/
      console.warn("LOCAL MONGO URL:"+url)
    }

    var Retries = MongoFactory.Retries;

          while(true){
                for(var i=1;i<MongoFactory.Retries;i+=1){

                  var d = await MongoFactory.Connect(url,{ 
                    //useNewUrlParser: true,
                    //useUnifiedTopology: true,
                    retryWrites: true, // Enable retryable writes
                    retryReads: true, // Enable retryable reads (optional)
                    });

                  if(d){
                      //console.warn("Mongo Connected")
                      return d;
                  }

                  console.log("Try again after 5 seconds");

                  TryRestart();

                  await timeout(5000);

              }
            }
              throw("Could not connect using "+Retries+" Retries");

              return null;
  }

  MongoFactory.Connect = function(url){

      if(!url)
        url = MongoFactory.Url;

      MongoFactory.Url = url;
      console.warn("Connecting:"+url)
      return new Promise(function(rs,rj){

         
        MongoClient.connect(url).then((d) => {
          console.log("MY DB:",d);
              //DBS["Trades"] = d.db('Trades');

              MongoFactory.Mongo = d;

              rs(d);
        })
        .catch((err) => {
          console.error(err)
          rs(null);
        })
       
    });
  }

  MongoFactory.TryOperation = async function(F,Args,Try){

    var Retries = MongoFactory.Retries;

    if(Try >= Retries){
      return null;
    }

    MongoFactory.Mongo = await MongoFactory.TryConnect(MongoFactory.Url);

    console.log(F.name+" TRY:"+Try+" "+JSON.stringify(Args))

    console.log("WAIT:"+MongoFactory.TIMEOUT)
    await timeout(MongoFactory.TIMEOUT)

    if(isNaN(parseInt(Args[Args.length-1])))
      Args.push(Try?Try+1:1);

    return await F(...Args)

  //  return await new Function(F.toString(),Args);

  }

  MongoFactory.Drop = async function(Database,Collection,Try){
    try{
      if(!MongoFactory.Mongo){
        console.error("No MongoDB");

        console.log("TRY TO connect");

        if(MongoFactory.Url)
          await MongoFactory.TryConnect(MongoFactory.Url);
        else {
          throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
        }
        //
      }

      var collections = await

      new Promise(function(rs,rj){
        MongoFactory.Mongo.db(Database).listCollections().toArray(function(err, collInfos) {
        // collInfos is an array of collection info objects that look like:
        return rs(collInfos);
        // { name: 'test', options: {} }
      });
    });
        //while(true){
      var coll = await new Promise(function(rs,rj){

        var coll2 = null;
        collections.forEach(coll => {

          if(coll.name==Collection){
            coll2 = coll.name
          }

        });

        rs(coll2);
      });

      //console.log("COLL:"+coll);

      if(coll)
        return MongoFactory.Mongo.
          db(Database).
          collection(coll).drop();
      }
      catch(e){
        console.error(e);
        return await MongoFactory.TryOperation(
          MongoFactory.Remove,[Database,Collection],Try || 1
        )
      } 
  }

  MongoFactory.mongo= require('mongodb');

  MongoFactory.ObjectID = function(){
    return new MongoFactory.mongo.ObjectID();
  }


  MongoFactory. collectionExists = async function (databaseName, collectionName) {
 
    try {
  
      const db = MongoFactory.Mongo.db(databaseName);
      const collections =  await db.listCollections().toArray();
      
      // Check if the collection exists in the list of collections
      const collectionExists = collections.some(collection => collection.collectionName === collectionName);
      
      return collectionExists;
    } catch (error) {
      console.error('Error:', error);
    } 
  }

  MongoFactory.Remove = async function(Database,Collection,Find,Try){
    try{
      if(!MongoFactory.Mongo){
        console.error("No MongoDB");

        console.log("TRY TO connect");

        if(MongoFactory.Url)
          await MongoFactory.TryConnect(MongoFactory.Url);
        else {
          throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
        }
        //
      }
        //while(true){

      return MongoFactory.Mongo.
        db(Database).
        collection(Collection).
        remove(Find);
      }
      catch(e){
        console.error(e);
        return await MongoFactory.TryOperation(
          MongoFactory.Remove,[Database,Collection,Find],Try || 1
        )
      }
  }

  MongoFactory.Insert = async function(Database,Collection,Item,Try){
    var Agg = [];
      try{

        if(!MongoFactory.Mongo){
          console.error("No MongoDB");

          console.log("TRY TO connect");

          if(MongoFactory.Url)
            await MongoFactory.TryConnect(MongoFactory.Url);
          else {
            throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
          }
          //
        }
        return MongoFactory.Mongo.
          db(Database).
          collection(Collection).
          insert(Item)
      }
      catch(e){
        console.error(e);

        console.error("ERROR FOR:\n"+JSON.stringify([Database,Collection,Item]))

        return await MongoFactory.TryOperation(
          MongoFactory.Update,[Database,Collection,Item],
          Try || 1
        )

      }

  }

  MongoFactory.Update = async function(Database,Collection,Find,Update,Options,Try){
    var Agg = [];
      try{

        if(!MongoFactory.Mongo){
          console.error("No MongoDB");

          console.log("TRY TO connect");

          if(MongoFactory.Url)
            await MongoFactory.TryConnect(MongoFactory.Url);
          else {
            throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
          }
          //
        }
        //while(true){

          //Separete $set if want to do logical set

      		if(Update["$set"] && ! Options.arrayFilters){

            Agg.push({
      				"$set":Update.$set
            })
            delete Update.$set;

            var r1 = await MongoFactory.Mongo.
              db(Database).
              collection(Collection).
              update(Find,Agg,Options)

            var r2;
            if(Object.keys(Update).length>0){

              r2 = await MongoFactory.Mongo.
                db(Database).
                collection(Collection).
                update(Find,Update,Options)


              if(r1.modifiedCount && r2.modifiedCoun)
                r2.modifiedCount+=r1.modifiedCount;

              if(r1.upsertedCount && r2.upsertedCount)
                r2.upsertedCount+=r1.upsertedCount;

            }
            else{
              r2 = r1;
            }

            return r2;
      		}

          else
            return MongoFactory.Mongo.
              db(Database).
              collection(Collection).
              update(Find,Update,Options)
      }
      catch(e){
        console.error(e);

        console.error("ERROR FOR:\n"+JSON.stringify([Database,Collection,Find,Agg,Update,Options]))

        return await MongoFactory.TryOperation(
          MongoFactory.Update,[Database,Collection,Find,Update,Options],
          Try || 1
        )

      }

  }

  MongoFactory.FindAndModify = async function(Database,Collection,Find,Sort,Update,Options,Try){
    try{

      if(!MongoFactory.Mongo){
        console.error("No MongoDB");

        console.log("TRY TO connect");

        if(MongoFactory.Url)
          await MongoFactory.TryConnect(MongoFactory.Url);
        else {
          throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
        }
        //
      }
      //while(true){

          //console.log(opts)
          return MongoFactory.Mongo.
            db(Database).
            collection(Collection).
            findAndModify(Find,Sort,Update,Options)

    }
    catch(e){
      console.error(e);

      console.error("ERROR FOR:\n"+JSON.stringify([Database,Collection,Find,Sort,Update,Options]))

      return await MongoFactory.TryOperation(
        MongoFactory.FindAndModify,[Database,Collection,Find,Sort,
           Update
          ,Options],
        Try || 1
      )

    }
  }

  MongoFactory.FindAndDelete = async function(Database,Collection,Find,Filter,Try){
    try{

      if(!MongoFactory.Mongo){
        console.error("No MongoDB");

        console.log("TRY TO connect");

        if(MongoFactory.Url)
          await MongoFactory.TryConnect(MongoFactory.Url);
        else {
          throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
        }
        //
      }

      return MongoFactory.Mongo.
        db(Database).
        collection(Collection).
        findOneAndDelete(Find,Filter)

    }
    catch(e){
      console.error(e);

      console.error("ERROR FOR:\n"+JSON.stringify([Database,Collection,Find,Filter]))

      return await MongoFactory.TryOperation(
        MongoFactory.findOneAndDelete,[Database,Collection,Find,Filter],
        Try || 1
      )

    }
  }


  MongoFactory.UpdateOne = async function(Database,Collection,Find,Update,Options,Try){
    try{

      if(!MongoFactory.Mongo){
        console.error("No MongoDB");

        console.log("TRY TO connect");

        if(MongoFactory.Url)
          await MongoFactory.TryConnect(MongoFactory.Url);
        else {
          throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
        }
        //
      }
      //while(true){

        var OldUpdate = JSON.parse(JSON.stringify(Update))

        //Separete $set if want to do logical set
        var Agg = [];
        if(Update["$set"] && false){

          Agg.push({
            "$set":Update.$set
          })
          delete Update.$set;

          var r1 = await MongoFactory.Mongo.
            db(Database).
            collection(Collection).
            updateOne(Find,Agg,Options)

          var r2;
          if(Object.keys(Update).length>0){

            r2 = await MongoFactory.Mongo.
              db(Database).
              collection(Collection).
              updateOne(Find,Update,Options)


            if(r1.modifiedCount && r2.modifiedCoun)
              r2.modifiedCount+=r1.modifiedCount;

            if(r1.upsertedCount && r2.upsertedCount)
              r2.upsertedCount+=r1.upsertedCount;

          }
          else{
            r2 = r1;
          }

          return r2;
        }

        else
        if(Object.keys(Update).length>0)
          return MongoFactory.Mongo.
            db(Database).
            collection(Collection).
            updateOne(Find,Update,Options)
          else{
            return null;
          }
    }
    catch(e){
      console.error(e);

      console.error("ERROR FOR:\n"+JSON.stringify([Database,Collection,Find,Update,Options]))

      return await MongoFactory.TryOperation(
        MongoFactory.UpdateOne,[Database,Collection,Find,
           OldUpdate
          ,Options],
        Try || 1
      )

    }
  }

  MongoFactory.Size = async function(){
    if(!MongoFactory.Mongo){
      console.error("No MongoDB");

      console.log("TRY TO connect");

      if(MongoFactory.Url)
        await MongoFactory.TryConnect(MongoFactory.Url);
      else {
        throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
      }
      //
    }

    var Sizes = {
      "DB Used":0,
      "Heap Used":Math.round((process.memoryUsage().heapUsed/1024/1024)*100)/100,
      "Heap Length":Math.round((process.memoryUsage().heapTotal/1024/1024)*100)/100,
      "Maximum Heap":v8.getHeapStatistics().total_available_size / 1024 / 1024
      //"Maximum Disk":
    }

    var db = MongoFactory.Mongo.db("admin");
    var dbNames = (await db.executeDbAdminCommand({ listDatabases: 1, nameOnly: true }))["databases"].map(d => d.name);
    for (let dbname of dbNames) {
        //console.log(dbname)

              var collections = await

              new Promise(function(rs,rj){
                MongoFactory.Mongo.db(dbname).listCollections().toArray(function(err, collInfos) {
                // collInfos is an array of collection info objects that look like:
                return rs(collInfos);
                // { name: 'test', options: {} }
              });
            });



        collections.forEach(async coll => {
          //console.log(coll)
              let size = await MongoFactory.Mongo.db(dbname).collection(coll.name).stats();
              //console.log(size.totalSize)
              if (size.totalSize > 1) {
                  Sizes["DB Used"]+=size.totalSize/1024/1024;
                  //console.log(dbname + " : " + coll + " : " + size.totalSize/1024/1024);
                }
      });
    };

    return Sizes;
  }

  MongoFactory.Query = async function(J,Try){

    try{

    if(!MongoFactory.Mongo){
      console.error("No Local MongoDB");

      console.log("TRY TO connect");

      if(MongoFactory.Url)
        await MongoFactory.TryConnect(MongoFactory.Url);
      else {
        throw("No MongoDB Connection and no MongoDB url given:"+MongoFactory.Url);
      }
      //
    }

    var result = [];
    var r;
    var Database = J["database"];
    var d = MongoFactory.Mongo;
    var Collection = J["collection"];

        //console.log("MY DB:",Database);

        //console.log("MY QUERY:"+JSON.stringify(J.query))

    //MongoFactory.Mongo.db(Data[""])

    switch(J["type"].toLowerCase()){
    case "aggregate":
      r = await d.db(Database).collection(Collection).aggregate(J["query"],J.options || {allowDiskUse:true});
      if(J.Cursor){
        return r;
      }
      else
        while(await r.hasNext()==true){
          result.push(await r.next());
        }

      await r.close();
      break;
    case "find":
    default:
      r = await d.db(Database).collection(Collection).find(J["query"]);
      if(J.Cursor){
        return r;
      }
      else
        while(await r.hasNext()==true){
          result.push(await r.next());
        }

      await r.close();
      break;
    case "all":

      var collections = await

      new Promise(function(rs,rj){
        d.db(Database).listCollections().toArray(function(err, collInfos) {
        // collInfos is an array of collection info objects that look like:
        return rs(collInfos);
        // { name: 'test', options: {} }
      });
    });

      console.log(collections);

      //console.log("COLLECTIONS:"+JSON.stringify(collections));

        for(var c in collections){

        //  console.log(JSON.stringify(collections[c]));

        try{
          r = await d.db(Database).collection(collections[c].name).aggregate(J["query"],{allowDiskUse:true});

          var result2 = [];
          if(J.Cursor){
            result.push(

              {"Collection":collections[c].name,
              "Cursor":r
              }

            )
          }
          else
            while(await r.hasNext()==true){
              result2.push(await r.next());
            }

          await r.close();

          result.push(

            {"Collection":collections[c].name,
            "Data":result2
            }

          )
        }
        catch(e){
          console.error(e);
          return await MongoFactory.TryOperation(
            MongoFactory.Query,[J],Try || 1
          )
        }
      }

      break;
    }

    return result;

  }
  catch(e){

    console.error(e);

    return await MongoFactory.TryOperation(
      MongoFactory.Query,[J],Try || 1
    )
    /*
    console.log("TRY to Reconnect... Then query again");

    var Retries = MongoFactory.Retries;

    if(Try >= Retries){
      return null;
    }

    //for(var i=1;i<Retries;i+=1){
    //do{

      MongoFactory.Mongo = await MongoFactory.TryConnect(MongoFactory.Url);

      console.log("QUERY TRY #:"+Try+"\n"+JSON.stringify(J));

      console.log("WAIT:"+MongoFactory.TIMEOUT)
      await timeout(MongoFactory.TIMEOUT)

      var result = await MongoFactory.Query(J,(Try?Try:0)+1);

      if(result){
        return result;
      }
      else{
        return null
      }

    //}while(Try<Retries);

    //}

    throw("Could not Successfully Query using:"+JSON.stringify(J));
    */
  }
      return null;

  }


  if(MongoFactory.Url){
    try{
      var a = async function(){  MongoFactory.Mongo = await MongoFactory.TryConnect(MongoFactory.Url); } ();
    }catch(e){
      console.error(e);
    }
    var err = new Error();
   return err.stack;
  }


  // catch ctrl+c event and exit normally

  process.on('SIGINT', async function () {
    console.log('Ctrl-C...');

    //checks mongodb every 1 second if processes in progress.
    //if my pid == mongo pid, wait until cleanup array == 0
    //when cleanup array 0, exit while loop;
    var done = false;
    do{

      var Processes = await MongoFactory.Query(

          {
            "database":"Memory",
            "collection":"Process",
            "type":"aggregate",
            "query":[
              {"$match":{
                  "Processes":{
                    "$elemMatch":{
                      "pid":process.pid,
                      //"cleanup":callback.toString()
                    }
                  }
              }}

          ]
        }

      );

      done = Processes.length==0;

      if(!done){
        console.log("Waiting for other processes to clean up:");
        console.log(JSON.stringify(Processes));

        await timeout(1000);
      }
    }while(!done);

    await MongoFactory.Close();

    process.exit(2);

  });

  return MongoFactory;

}
