import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

import { runPeopleSearch } from './api/searchController.js';
import axios from 'axios';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Function to analyze the fingerprint using the Ollama API
export async function AnalyzeFingerprint(c_fingerprintJson: object): Promise<string> {

    if (process.env.OLLAMA_URL === undefined) {
      throw new Error('OLLAMA_URL is not defined in the environment variables.');
    }

    if (process.env.OPENAI_API_KEY === undefined) {
      throw new Error('OPENAI_API_KEY is not defined in the environment variables.');
    }

    const m_bUseOllama = false;

    // Extract all properties except canvasFingerPrint
    const { canvasFingerprint, ...filteredFingerprint } = c_fingerprintJson;

    // Convert the filtered fingerprint object to a string
    const fingerprintData = JSON.stringify(filteredFingerprint, null, 2);

    const prompt = `You are a skilled digital OSINT analyst. Using the detailed fingerprint and browser metadata provided below, directly respond to the visitor by revealing insightful and personalized inferences about their current situation, likely environment, device usage patterns, and potential privacy implications.

Explicitly mention their precise geographic location (city, state), the type of device they're using (including OS and browser), and infer if they're currently mobile or stationary based on battery status, connection type, touch support, screen resolution, hardware specs (CPU cores, GPU, RAM), installed plugins, ISP details, and browsing mode. Highlight specifically what their device configuration and browsing data might imply about their professional or personal context, and briefly indicate privacy risks or insights that this data reveals about them.

Keep your response concise, friendly, and engaging, strictly limited to 5 sentences. Do not include any introductory explanations.

Provided data:
${fingerprintData}

Respond exactly like:
"We see you're currently in [City, State], using a [Device type/OS/Browser]. Your [battery level, connection type, and touch support status] suggest you’re likely [mobile/stationary]. Given your hardware specs like [CPU/GPU/RAM], you’re probably engaged in [type of professional, technical, or personal activity]. Using [plugins installed or ISP type] indicates [insight about their context]. Together, these details expose [specific privacy implications or insights about their behavior]."`;

    try {
      let response;
  
      if (m_bUseOllama) {
          // Using Ollama for local model inference
          response = await axios.post(
              process.env.OLLAMA_URL, 
              {
                  model: 'llama3',
                  prompt: prompt,
                  stream: false,
                  temperature: 0.1,
              }
          );
      } else {
          // Using OpenAI as a fallback
          response = await client.responses.create({
              model: 'gpt-4-turbo',
              input: prompt,
          });
      }
  
      // Handle the response based on the provider
      const cResponseText = m_bUseOllama
          ? response.data.response // Ollama response format
          : response.output_text; // OpenAI response format
  
      return cResponseText;
  
  } catch (error) {
      console.error("Error during LLM request:", error);
      throw new Error("Unable to fetch response from language model provider.");
  }

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
