const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config()
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

        app.get('/tools', async (req, res) => {
            const result = await toolsCollection.find().limit(6).toArray();
            res.send(result);
        });
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().limit(3).toArray();
            res.send(result);
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