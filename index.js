const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.asfev.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
    try {
        client.connect();
        const toolsCollection = client.db("hammer").collection("tools");
        const reviewCollection = client.db("hammer").collection("reviews");
        const userCollection = client.db("hammer").collection("user");
        const bookingCollection = client.db("hammer").collection("booking");

        //show all tools in home
        app.get('/tools', async (req, res) => {
            const result = await toolsCollection.find().limit(6).toArray();
            res.send(result);
        });

        //show review in home
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        });

        //post a review in Myreview page
        app.post('/reviews', async (req, res) => {
            const rev = req.body;
            console.log(rev);
            const result = await reviewCollection.insertOne(rev);
            res.send(result);
        });

        //show cliciable tools in boooking page
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolsCollection.findOne(query);
            res.send(result);
        });

        //update available quantity booking page
        app.put('/tools/:id', async (req, res) => {
            const user = req.body;
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    availableQuantity: user.available
                }
            };
            const result = await toolsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //login jwt token and create user 
        app.put('/users/:email', async (req, res) => {
            const user = req.body;
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign(filter, process.env.ACCESS_SECREET_KEY, { expiresIn: '1h' });
            res.send({ result, token });
        })

        //add order booking page 
        app.post('/booking', async (req, res) => {
            const book = req.body;
            const result = await bookingCollection.insertOne(book);
            res.send(result)
        })

        //show mybooking   myOrder page 
        app.get('/booking', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        // delete booking in myOrder page
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const available = await bookingCollection.findOne(query);
            const totalAvailable = await toolsCollection.findOne({ name: available.toolsName });
            const result = await bookingCollection.deleteOne(query);
            res.send({ success: result, update: totalAvailable });
        });
    }
    finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('welcome to hammer tools manufacture');
})
app.listen(port, () => {
    console.log('manufacture tools running ', port);
})