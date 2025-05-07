import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { runPeopleSearch } from './api/searchController.js';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Function to analyze the fingerprint using the Ollama API
export async function AnalyzeFingerprint(c_fingerprintJson: object): Promise<string> {

    // Extract all properties except canvasFingerPrint
    const { canvasFingerprint, ...filteredFingerprint } = c_fingerprintJson;

    // Convert the filtered fingerprint object to a string
    const fingerprintData = JSON.stringify(filteredFingerprint, null, 2);

    const prompt = `You are a digital OSINT analyst. Given the following fingerprint and browser metadata, respond directly to the visitor with what you can infer about them.
        Use a friendly but informative tone. Start by identifying their specific location as granular as possible, system, then mention any other insights or assumptions based on the device, specs, or usage patterns.
        Only respond with the message — no setup, context, or explanations. Keep the response short and use phrasing that highlights how much you know about them based on the data provided. The response should only be 4 sentences long.
        Here is the data: ${fingerprintData}
        Respond like: “We can tell you’re visiting from [city, state], using a [device/OS/browser]. Based on your system specifications and setup, here’s what we can infer about you: ... Here are ways this data exposes you”

    `;

  const response = await axios.post(
        process.env.OLLAMA_URL, 
        {
            model: 'llama3',
            prompt: prompt,
            stream: false, // We want the full response at once
            temperature: 0.1, // Adjust the temperature for more or less randomness
        }
    );

  return response.data.response;
}


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

/*********************************************************************
* Route: /api/user/summary
* Method: POST
* Description: Returns a summary of a user based on browser fingerprint data
**********************************************************************/

app.post('/api/user/summary', async (req, res) => {
  try {
    const m_cData = req.body;

    if (!m_cData || typeof m_cData !== 'object') {
      return res.status(400).json({ error: 'Invalid or missing fingerprint data' });
    }

    const m_sAnalysis = await AnalyzeFingerprint(m_cData);
    return res.json({ analysis: m_sAnalysis });
  } catch (err) {
    console.error('Failed to analyze fingerprint:', err);
    return res.status(500).json({ error: 'Analysis failed', errorMessage: err });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
