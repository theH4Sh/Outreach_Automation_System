const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { before } = require('node:test');

let mongo;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri);
})

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany();
    }
})

afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
})