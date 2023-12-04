const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggrwjrl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const campCollection = client.db("MedicalCamp").collection("campData");
    const reviewsCollection = client.db("MedicalCamp").collection("reviews");
    const upComingCollection = client
      .db("MedicalCamp")
      .collection("upCommingCamp");
    const joinCampCollection = client
      .db("MedicalCamp")
      .collection("joinCampData");
    const usersCollection = client.db("MedicalCamp").collection("users");
    const contactInfoCollection = client.db("MedicalCamp").collection("contactInfo");


    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }


    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })
    
    
    app.get("/availableCamp", async (req, res) => {
      const result = await campCollection.find().toArray();
      res.send(result);
    });

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

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/role/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      
      res.send(result);
    });
    app.get("/users/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.delete('/delete-camp/:id',  async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) }
      const result = await campCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    })

    app.patch('/update-camp/:id', async (req, res) => {
      const camp = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedFields = {
        name: camp.name,
        image: camp.image,
        fees:camp.camp_fees,
        dateTime: camp.dateTime,
        location: camp.location,
        services: camp.services,
        professionals: camp.professionals,
        audience: camp.audience,
        participantCount: camp.participantCount,
        comprehensiveDetails: camp.comprehensiveDetails,
        moreDetails: camp.moreDetails
      };
  

      const updateOperation = {
        $set: updatedFields,
      };
  

      const result = await campCollection.updateOne(filter, updateOperation)
      res.send(result);
    })
    app.post('/addACamp', async (req, res) => {
      const camp = req.body;
      const result = await campCollection.insertOne(camp);
      res.send(result);
    })
    app.patch('/update-participant-profile', async (req, res) => {
      const { name, email, attendedCamps, medicalInterests } = req.body;
      const emailMatch = req.query;
      const updatedFields = {
        name: name,
        email: email,
        attendedCamps: attendedCamps,
        medicalInterests: medicalInterests,
      };
      const updateOperation = {
        $set: updatedFields,
      };
      const result = await usersCollection.updateOne(emailMatch, updateOperation)
      res.send(result);
    })
    app.patch('/update-healthcare-professional-profile', async (req, res) => {
      const { name, email, medicalSpecialty, certifications,contactInformation,impact } = req.body;
      const emailMatch = req.query;
      const updatedFields = {
        name: name,
        email: email,
        medicalSpecialty: medicalSpecialty,
        certifications: certifications,
        contactInformation:contactInformation,
        impact:impact
      };
      const updateOperation = {
        $set: updatedFields,
      };
      const result = await usersCollection.updateOne(emailMatch, updateOperation)
      res.send(result);
    })

    app.post('/contact-info', async (req, res) => {
      const info = req.body;
      const result = await contactInfoCollection.insertOne(info);
      res.send(result);
    })

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
