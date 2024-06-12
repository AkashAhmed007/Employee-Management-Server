const express = require('express')
const app = express()
const cors = require("cors")
require('dotenv').config()
const port = process.env.PORT || 8000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jp6bbe4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const userCollection = client.db('Employee-Management').collection('User')
    const socialLoginCollection = client.db('Employee-Management').collection('socialLoginUser')
    const workSheetCollection = client.db('Employee-Management').collection('Worksheet')
    const paymentCollection = client.db('Employee-Management').collection('Payment')

    app.get('/user', async(req,res)=>{
      const cursor = userCollection.find().sort()
      const result = await cursor.toArray()
      res.send(result)
    })

   app.post('/user',async(req,res)=>{
    const userData = req.body
    const result = await userCollection.insertOne(userData)
    res.send(result)
   }) 

   app.get('/socialloginuser', async(req,res)=>{
    const cursor = socialLoginCollection.find()
    const result = await cursor.toArray()
    res.send(result)
  })

   app.post('/socialloginuser',async(req,res)=>{
    const userData = req.body
    const result = await socialLoginCollection.insertOne(userData)
    res.send(result)
   }) 

   app.get('/worksheet', async(req,res)=>{
    const cursor = workSheetCollection.find().sort({date: -1})
    const result = await cursor.toArray()
    res.send(result)
  })

   app.post('/worksheet', async(req,res)=>{
    const data = req.body
    const result = await workSheetCollection.insertOne(data)
    res.send(result)
   })

   app.get('/worksheet/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {'email' : email};
      const result = await workSheetCollection.find(query).toArray()
      res.send(result)
   })

   app.get('/employees', async(req,res)=>{
      const cursor = userCollection.find()
      const result = await cursor.toArray()
      res.send(result)
   })

app.put('/employees/:id/verify', async(req,res)=>{
  const id = req.params.id
  const isVerified = req.body.isVerified
  const result = await userCollection.updateOne(
      {_id: new ObjectId(id)},
      { $set:{isVerified}}
  )
  res.send(result)

})

app.post('/pay', async(req,res)=>{
  const {amount, month, year , email} = req.body.data
  const existingPayment = await paymentCollection.findOne({"month": month, "year":year, "amount":amount})
  if(existingPayment){
    return res.send({ success: false, message: "Payment for this month and year already exists." });
  }
 await paymentCollection.insertOne({amount,month,year,email})
  res.status(200).send({ success: true, message: "Payment successful!"})
})

app.get('/pay', async(req,res)=>{
      const cursor = paymentCollection.find()
      const result = await cursor.toArray()
      res.send(result)
})

app.get('/employeelist/:email', async(req,res)=>{
      const email = req.params.email;
      const query = {'email' : email};
      const result = await userCollection.find(query).toArray()
      res.send(result)
})

app.get('/payment/:email', async(req,res)=>{
  const email = req.params.email;
  const query = {'email' : email};
  const result = await paymentCollection.find(query).toArray()
  res.send(result)
})


// // Update employee role to HR
app.put('/make-hr/:id', async (req, res) => {
  const { id } = req.params;
  const result = await userCollection.updateOne({ _id: new ObjectId(id) }, { $set: { role: 'HR' } });
  res.send(result);
});

// // Fire an employee
app.put('/fire/:id', async (req, res) => {
  const { id } = req.params;
  const result = await userCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isFired: true } });
  res.send(result);
});



    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})