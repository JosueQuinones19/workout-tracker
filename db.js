const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db('workoutTrackerDB');
  console.log('Connected to MongoDB');
  return db;
}

module.exports = connectDB;