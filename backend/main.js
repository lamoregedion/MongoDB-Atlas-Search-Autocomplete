// https://www.youtube.com/watch?v=3IDlOI0D8-8&
const { MongoClient, ObjectId} = require('mongodb');
const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
require('dotenv').config()

const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
const server = Express();

server.use(BodyParser.json());
server.unsubscribe(BodyParser.urlencoded({ extended: true}));
server.use(Cors());

var collection;

server.get("/search", async (request, response) => {
    console.log(`${request.query.term}`)
    try {
        let result = await collection.aggregate([
            {
                "$search": {
                    "index": "autocomplete",
                    "autocomplete" : {
                        "query": `${request.query.term}`,
                        "path": "properties.FULL_ADDRESS", 
                    }
                }
            },
            {
              $limit: 10,
            }
        ]).toArray(); // rather than having a cursor, create an array of the entire resultset.
        response.send(result);
    } catch (e) {
        response.status(500).send({ message: e.message})
    }
})

server.get("/get/:id", async (request, response) => {
    try {
        console.log(request.params.id);
        let result = await collection.findOne({ "_id": ObjectId.createFromHexString(request.params.id) })       
         response.send(result);
    } catch (e) {
        response.status(500).send({ message: e.message})
    }
});

server.listen("3000", async() => {
    try {
        await client.connect();
        collection = client.db(process.env.DATABASE).collection(process.env.COLLECTION);
    } catch (e) {
        console.error(e);
    }
});