const express = require('express')
const app = express()
const cors = require("cors")
require('dotenv').config()
const port = process.env.PORT || 8000
const { MongoClient, ServerApiVersion } = require('mongodb');

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
    const cursor = workSheetCollection.find().sort()
    const result = await cursor.toArray()
    res.send(result)
  })

   app.post('/worksheet', async(req,res)=>{
    const data = req.body
    const result = await workSheetCollection.insertOne(data)
    res.send(result)
   })

   app.get('/employees', async(req,res)=>{
      const cursor = userCollection.find()
      const result = await cursor.toArray()
      res.send(result)
   })














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