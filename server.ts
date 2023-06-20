import express from 'express';
import cors from 'cors';
import env from 'dotenv';
import { MongoClient } from 'mongodb';
import Scraper from './Scraper';

const app = express();

env.config();
const port = process.env.PORT || 2820;

// Bypass CORS policy
app.use(cors({ origin: '*' }));

app.listen(port, () => console.log(`Listening on port ${port}`));

const uri: string | undefined = process.env.MONGO_URI;
const client: MongoClient = new MongoClient(uri as string);

const scraper = new Scraper(client);

const main = async () => {
  try {
    await client.connect();
    await scraper.scrape();
  } catch (e: unknown) {
    console.error(e);
  } finally {
    await client.close();
  }
};

(async () => await main())();
