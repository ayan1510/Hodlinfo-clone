import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios'; // To fetch data from WazirX API
import path from 'path'; // To serve the frontend
import { fileURLToPath } from 'url';
import cors from 'cors'; // Import CORS middleware
dotenv.config();

// MongoDB connection
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

// Use CORS middleware
app.use(cors());

// Serve static files from the 'client' folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'client')));

// Define schema for the ticker data
const tickerSchema = new mongoose.Schema({
  name: String,
  last: String,
  buy: String,
  sell: String,
  volume: String,
  base_unit: String,
});

// Create the model
const Ticker = mongoose.model('Ticker', tickerSchema);

// Fetch and store data from WazirX API
const fetchAndStoreData = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    // Extract top 10 tickers
    const top10Results = Object.values(data).slice(0, 10);

    // Clear previous data in the MongoDB collection
    await Ticker.deleteMany({});

    // Save new data
    for (let ticker of top10Results) {
      const newTicker = new Ticker({
        name: ticker.name,
        last: ticker.last,
        buy: ticker.buy,
        sell: ticker.sell,
        volume: ticker.volume,
        base_unit: ticker.base_unit,
      });
      await newTicker.save();
    }

    console.log('Data fetched and stored in MongoDB');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Fetch data every minute
setInterval(fetchAndStoreData, 60000);

// API route to get stored data from MongoDB
app.get('/api/tickers', async (req, res) => {
  try {
    const tickers = await Ticker.find({});
    res.json(tickers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tickers' });
  }
});

// Serve the frontend (ensure this is the correct path to your HTML file)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Initial data fetch
fetchAndStoreData();
