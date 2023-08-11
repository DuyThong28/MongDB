const { MongoClient } = require("mongodb");

let database;

async function connect() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  database = client.db("blog");
}

function getDb() {
  if (!database) {
    throw { message: "database connection not established!" };
  }
  return database;
}

module.exports = { connectToDatabase: connect, getDb: getDb };
