import express from 'express';
import { MongoClient } from "mongodb";
import dotenv from 'dotenv'

dotenv.config()

const DB_NAME = process.env.DB_DATABASE_NAME ?? "online_book_store";
const DB_COLLECTION_NAME = process.env.DB_COLLECTION_NAME ?? "books";

const app = express();

app.use(express.static('public'));

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db(DB_NAME);
const messages = db.collection(DB_COLLECTION_NAME);

// filtering using title
// books?title=titanic
// books?category=fantasy
app.get('/books', async (req, res) => {
  const title = req.query.title;
  const category = req.query.category;

  if (!title && !category) {
    const all = await messages.find().limit(10).toArray();
    res.json(all);
    return
  }

  // prioritize title filter
  if (title) {
    const titleFilter = await messages.find({
      title: { $regex: title, $options: "i" }
    }).limit(5).toArray();

    if (titleFilter.length == 0) {
      res.status(404).json({
        success: false,
        message: "Data Not Found",
      });
      return;
    } else {
      res.json(titleFilter);

      return
    }
  }

  if (category) {
    const categoryFilter = await messages.find({
      category: { $regex: category, $options: "i" }
    }).limit(5).toArray();

    if (categoryFilter.length == 0) {
      res.status(404).json({
        success: false,
        message: "Data Not Found",
      });
      return;
    } else {
      res.json(categoryFilter);
      return
    }
  }

  res.status(400).json({
    success: false,
    message: "Bad Request",
  });
});


app.listen(3001, () => console.log("API running on http://localhost:3001"));
