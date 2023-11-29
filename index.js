const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://Medical-camp:6s12bLm0EQPaNfmx@cluster0.ggrwjrl.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    await client.connect();

    const campCollection = client.db("MedicalCamp").collection("campData");
    // const commentCollection = client.db("MedicalCamp").collection("comments");
    // const wishListCollection = client.db("MedicalCamp").collection("items");
    
    app.get('/popularCamps',  async (req, res) => {
      const result = await campCollection.find().sort({ participantCount: -1 }).limit(6).toArray();
      res.send(result);
    });

    

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("MedicalCamp application is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
