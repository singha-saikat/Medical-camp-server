const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://Medical-camp:6s12bLm0EQPaNfmx@cluster0.ggrwjrl.mongodb.net/?retryWrites=true&w=majority";

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
    const reviewsCollection = client.db("MedicalCamp").collection("reviews");
    const upComingCollection = client
      .db("MedicalCamp")
      .collection("upCommingCamp");
    const joinCampCollection = client
      .db("MedicalCamp")
      .collection("joinCampData");

    // app.get("/availableCamp", async (req, res) => {
    //   const result = await campCollection.find().toArray();
    //   res.send(result);
    // });

    app.get("/popularCamps", async (req, res) => {
      const result = await campCollection
        .find()
        .sort({ participantCount: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.get("/upComingCamp", async (req, res) => {
      const result = await upComingCollection.find().toArray();
      res.send(result);
    });

    app.get("/camp-Details/:_id", async (req, res) => {
      const id = req.params._id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await campCollection.findOne(query);
      res.send(result);
    });

    app.post("/joinCamp", async (req, res) => {
      try {
        const fromData = req.body;
        console.log(req.body);
        const result = await joinCampCollection.insertOne(fromData);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
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
