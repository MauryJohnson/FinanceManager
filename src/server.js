import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import MF from "./modules/mongofactory/MongoFactory.js"
import cors from 'cors'

import https  from 'https'
import fs from 'fs'
let start = async function(){
  let Mongo = new MF({
    "url":"mongodb://localhost:27017/admin?serverSelectionTimeoutMS=5000"
  });
  try{

  
  
  await Mongo.TryConnect();
    }catch(e){
    console.error(e)
  }

  dotenv.config();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const port = process.env.PORT || 3001;
  const app = express();
  app.use(express.json());
// Apply CORS middleware
app.use(cors());
  // Serve static files from the Vite build
  app.use(express.static(path.join(__dirname, process.env.env)));
  

  // Example route
  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
  });

  app.get('/api/getUsers',async (req,res)=>{
    res.json((await Mongo.Mongo.db("financeManager").listCollections().toArray()).map(x=>x.name));

  })

  app.post('/api/getCollections',async (req,res)=>{
    res.json((await Mongo.Mongo.db(req.body.db).listCollections().toArray()).map(x=>x.name));
  })

  app.post('/api/getDB',async (req,res)=>{
    res.json(await Mongo.Query(req.body));
  })

  app.post('/api/updateDB',async (req,res)=>{
    let search = req.body.update[0];
    if(search._id)
      search._id = Mongo.ObjectID(search._id)
    res.json(await Mongo.Mongo.db(req.body.db).collection(req.body.collection).updateMany(...req.body.update));
  })

  app.post('/api/insertDB',async (req,res)=>{
    res.json(await Mongo.Mongo.db(req.body.db).collection(req.body.collection).insertOne(req.body.insert));
  })

  app.post('/api/removeDB',async (req,res)=>{
    let search = req.body.remove;
    if(search._id)
      search._id = Mongo.ObjectID(search._id)
    res.json(await Mongo.Mongo.db(req.body.db).collection(req.body.collection).deleteMany(req.body.remove));
  })

  app.get('/api/getFinances/*',async (req,res)=>{
    let path = req.url.split("/").map(x=>decodeURIComponent(x));
    res.json(await Mongo.Query({
      "type":"aggregate",
      "database":"financeManager",
      "collection":(path[path.length-1]),
      "query":[{
        $sort:{
          id:1
        }
      }],
      "options":{allowDiskUse:true}
    }));

  })

  app.post('/api/addFinance/*',async (req,res)=>{
    let path = req.url.split("/").map(x=>decodeURIComponent(x));
    console.warn(req.body)
    console.warn(path)
    await Mongo.Mongo.db("financeManager").collection(path[path.length-1]).updateMany(
      {id:{$gte:req.body.id}},{
        "$inc":{
          id:1
        }
      }
    )

    res.json((await Mongo.Mongo.db("financeManager").collection(path[path.length-1]).insertOne(req.body)).insertedId);
  })

  app.post('/api/updateFinance/*',async (req,res)=>{
    let path = req.url.split("/").map(x=>decodeURIComponent(x));
    res.json(await Mongo.Mongo.db("financeManager").collection(path[path.length-1]).updateOne({id:req.body.id},{$set:req.body},{upsert:true}));
  })

  app.post('/api/deleteFinance/*',async (req,res)=>{
    let path = req.url.split("/").map(x=>decodeURIComponent(x));

    res.json(await Mongo.Mongo.db("financeManager").collection(path[path.length-1]).remove({id:req.body.id}));

    await Mongo.Mongo.db("financeManager").collection(path[path.length-1]).updateMany(
      {id:{$gte:req.body.id}},{
        "$inc":{
          id:-1
        }
      }
    )

  })
  
  // Define the path to your SSL certificate and key
  const privateKey = fs.readFileSync(path.join("/etc/letsencrypt/live/optimalfrequencytrader.com/", 'privkey.pem'), 'utf8');
  const certificate = fs.readFileSync(path.join("/etc/letsencrypt/live/optimalfrequencytrader.com/", 'fullchain.pem'), 'utf8');

  const credentials = { key: privateKey, cert: certificate };

  // Create an HTTPS server
  const httpsServer = https.createServer(credentials, app);

  // Define the port and start the server
  //const PORT = 5173; // Standard HTTPS port is 443
  
  httpsServer.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
  });
  
  app.listen(port+1, () => {
    console.log(`HTTPS Server running on port ${port}`);
  });
  
  



  if(false)
  new Promise(async function(rs,rj){
    
    var y = 0;

    for(var x of [
      {
      "title":"Income 1",
      "amount":5400,
      "time":"weekly"
      },{
        "title":"Business Income",
        "amount":0,
        "time":"weekly"
        },

        {
          "title":"Elham Payment",
          "amount":200,
          "time":"monthly"
          },

          {
            "title":"Rent",
            "amount":-2125,
            "time":"monthly"
            },

            {
              "title":"Loan 1",
              "amount":-347.42,
              "time":"monthly"
              },


            {
              "title":"Loan 2",
              "amount":-448,
              "time":"monthly"
              },


            {
              "title":"Loan 3",
              "amount":-740,
              "time":"monthly"
              },

              {
                "title":"Verizon",
                "amount":-111,
                "time":"monthly"
                },

                {
                  "title":"Acorn",
                  "amount":-33,
                  "time":"weekly"
                  },

                  {
                    "title":"Amazon Prime",
                    "amount":-15,
                    "time":"monthly"
                    },

                    {
                      "title":"Life Insurance",
                      "amount":-140,
                      "time":"monthly"
                      },

                      {
                        "title":"Haircut",
                        "amount":-35,
                        "time":"monthly"
                        },

                        {
                          "title":"Progressive",
                          "amount":-375,
                          "time":"monthly"
                          },
                          {
                            "title":"Other",
                            "amount":-500,
                            "time":"monthly"
                            },
    ]){
      
      x.id = y++;
      await Mongo.Mongo.db("financeManager").collection("Maury Johnson").insert(x)
    }

  })

}();