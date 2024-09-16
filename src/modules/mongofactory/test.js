const MF = (require(__dirname+"/../mongofactory/MongoFactory.js"));
var MongoFactory = new MF({"url":"mongodb://127.0.0.1:27017/admin","Timeout":5000,"Verbose":false});
var a = async function(){

  var doc = await MongoFactory.FindAndModify(
    "Test","Test",
  {
      "test2":{"$exists":true}
  },null,
  {
    "$set":{
      "test":"test"
    },
    "$setOnInsert":{
      "test2":"test2"
    }
  },

      {"new":true,"upsert":true}

  )

  console.log(doc);
  console.log(doc._id)
  // ((doc.upserted||[])[0]||{})._id
  //or doc.result.n>0 , then
  //
}();
