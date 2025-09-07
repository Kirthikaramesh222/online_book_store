import express from 'express';
import dotenv from 'dotenv'
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

dotenv.config()

if (!process.env.AWS_SECRET_KEY && !process.env.AWS_ACCESS_KEY) {
  throw new Error("failed to setup AWS related config")
}

const clientDynamo = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

const app = express();

app.use(express.static('public'));

// books?title=titanic
// books?category=fantasy
app.get('/books', async (req, res) => {
  const title = req.query.title;
  const category = req.query.category;

  if (!title && !category) {
    const cmd = new ScanCommand({
      TableName: "books",
    });

    const all = await clientDynamo.send(cmd)
    res.json(all);
    return
  }

  // prioritize title filter
  if (title) {
    const cmd = new ScanCommand({
      TableName: "books",
      FilterExpression: "contains(#title, :titleVal)",
      ExpressionAttributeNames: {
        "#title": "title",
      },
      ExpressionAttributeValues: {
        ":titleVal": title,
      },
      Limit: 10
    });

    const json = await clientDynamo(cmd)
    const titleFilter = json.Items

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
    const cmd = new ScanCommand({
      TableName: "messages",
      FilterExpression: "contains(#category, :catVal)",
      ExpressionAttributeNames: {
        "#category": "category",
      },
      ExpressionAttributeValues: {
        ":catVal": category,
      },
      Limit: 5, // same as .limit(5)
    });

    const json = await clientDynamo.send(cmd);
    const categoryFilter = json.Items;

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
