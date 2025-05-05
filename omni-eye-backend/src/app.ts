import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { runPeopleSearch } from './api/searchController.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/*********************************************************************
* Route: /api/status
* Method: GET
* Description: Returns the status of the server and environment variables
**********************************************************************/
app.get('/api/status', (req, res) => {
  
    // Create a response object with the status and env variables
    const response = {
        status: 'OK',
        env: {
            NODE_ENV: process.env.NODE_ENV ? 'Set' : 'Not Set',
            GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY ? 'Set' : 'Not Set',
            PORT: process.env.PORT ? 'Set' : 'Not Set',
            OLLAMA_URL: process.env.OLLAMA_URL ? 'Set' : 'Not Set',
            GOOGLE_CX: process.env.GOOGLE_CX ? 'Set' : 'Not Set',
        },
    };

    res.send(response);

});

/*********************************************************************
* Route: /api/search/people
* Method: POST
* Description: Searches for people using the Google Search API
**********************************************************************/
app.post('/api/search/people', runPeopleSearch);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
