import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import MF from "./modules/mongofactory/MongoFactory.js"
import cors from 'cors'


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
 
  app.listen(port,"0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${port}`);
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