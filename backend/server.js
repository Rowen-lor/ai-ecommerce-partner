const express = require('express');
const cors = require('cors');
const path = require('path');
const { generateListingTitles } = require('./listingGenerator');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API endpoint for generating titles
app.post('/api/generate-title', async (req, res) => {
    const { product_keywords } = req.body;

    if (!product_keywords) {
        return res.status(400).json({ error: 'product_keywords is required' });
    }

    try {
        console.log(`Received request to generate titles for: ${product_keywords}`);
        const titles = await generateListingTitles(product_keywords);
        console.log(`Successfully generated titles.`);
        res.json({ titles });
    } catch (error) {
        console.error('Error generating listing titles:', error);
        res.status(500).json({ error: 'Failed to generate titles' });
    }
});

// Serve the main index.html for any other GET request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});