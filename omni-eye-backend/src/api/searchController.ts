import { exec } from 'child_process';
import { checkIfProfileIsPublic } from '../services/profileChecker.js'; // for public/private checking
import { scrapeProfilePublicData } from '../services/socialScraper.js';  // 🔥 New
import { calculateSimilarityScore } from '../services/similarityScorer.js'; // (we'll define shortly)

import { runSherlock } from '../services/sherlockRunner.js'; // for running Sherlock CLI
import { parseSherlockOutput } from '../services/parseSherlockOutput.js'; // for parsing Sherlock output

import axios from 'axios'; // for HTTP requests
import * as cheerio from 'cheerio'; // for HTML parsing

import dotenv from 'dotenv';
dotenv.config();   // ← must come before any process.env usage


/****************************************************************************
 * Function: detectMissingPlatforms
 * Purpose: Check which major social platforms are missing from the found profiles
 ****************************************************************************/
export function detectMissingPlatforms(profiles) {
  const importantPlatforms = ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'X']; // X for newer Twitter

  const foundPlatforms = new Set(
    profiles.map(profile => normalizePlatformName(profile.platform))
  );

  const missingPlatforms = importantPlatforms.filter(platform => !foundPlatforms.has(platform));

  return missingPlatforms;
}

/****************************************************************************
 * Function: normalizePlatformName
 * Purpose: Normalize slight variations (Twitter/X etc.)
 ****************************************************************************/
function normalizePlatformName(name) {
  if (!name) return '';
  
  const lower = name.toLowerCase();

  if (lower.includes('twitter') || lower === 'x') return 'Twitter';
  if (lower.includes('instagram')) return 'Instagram';
  if (lower.includes('linkedin')) return 'LinkedIn';
  if (lower.includes('facebook')) return 'Facebook';

  return name;
}

/****************************************************************************
 * Function: CheckSocialProfile
 * Purpose: Generic function to check if a social profile exists.
 ****************************************************************************/
async function CheckSocialProfile(cPlatform, cUsername) {

  if (!cPlatform || !cUsername) {
      console.error("Invalid platform or username provided.");
      return;
  }

  const dPlatforms = {
      facebook: `https://facebook.com/${cUsername}`,
      instagram: `https://instagram.com/${cUsername}`,
      twitter: `https://X.com/${cUsername}`,
      linkedin: `https://linkedin.com/in/${cUsername}`
  };

  if (!dPlatforms[cPlatform]) {
      console.error("Unsupported platform:", cPlatform);
      return;
  }

  try {
      const cResponse = await fetch(dPlatforms[cPlatform]);
      const cText = await cResponse.text();

      // Basic checks for error messages
      if (cText.includes("Sorry, this content isn't available") || 
          cText.includes("Page Not Found") || 
          cResponse.status === 404) {
          console.warn(`${cPlatform} profile ${cUsername} does not exist.`);
          return false;
      }

      console.log(`${cPlatform} profile ${cUsername} exists.`);
      return true;
  } catch (cError) {
      console.error(`Error checking ${cPlatform} profile:`, cError);
      return false;
  }

}

/****************************************************************************
* Function: fetchLinkedInProfilePages
* Purpose: Fetch LinkedIn profile pages using Google Custom Search API
****************************************************************************/
async function fetchLinkedInProfilePages(firstName, lastName, location, occupation) {
  const query = `site:linkedin.com/in/ "${firstName} ${lastName} ${location} ${occupation}"`;
  const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
  const GOOGLE_CX = process.env.GOOGLE_CX;

  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    throw new Error('Missing GOOGLE_API_KEY or GOOGLE_CX in env');
  }

  const url = 'https://www.googleapis.com/customsearch/v1';
  const params = {
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CX,
    q: query,
    num: 10, // max 10 per request
    safe: 'off'
  };

  const resp = await axios.get(url, { params, timeout: 10000 });
  const items = resp.data.items || [];
  const linkedInProfilePages = items.map((item) => item.link);
  return linkedInProfilePages;
}

/****************************************************************************
* Function: fetchImageLinks
* Purpose: Fetch image links from Google Custom Search API
****************************************************************************/
async function fetchImageLinks(
  query,
  num = 10// max 10 per request
) {

  const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
  const GOOGLE_CX = process.env.GOOGLE_CX;

  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    throw new Error('Missing GOOGLE_API_KEY or GOOGLE_CX in env');
  }
  
  const url = 'https://www.googleapis.com/customsearch/v1';
  const params = {
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CX,
    q: query,
    searchType: 'image',
    num,            // max 10 per request
    safe: 'off'
  };

  const resp = await axios.get(url, { params, timeout: 10000 });
  const items = resp.data.items || [];

  // Extract the direct image link from each result
  return items.map((item) => item.link);

}

/****************************************************************************
* Function: runPeopleSearch
* Purpose: Perform basic OSINT search (Sherlock), normalize results, rank matches
****************************************************************************/
export async function runPeopleSearch(req, res) {

  const { 
    firstName, 
    lastName, 
    email, 
    username, 
    location, 
    DOB, 
    age, 
    occupation 
  } = req.body;

  try {

    // 1. Build Search Parameters
    const usernames = username ? [username] : [
      // `${firstName[0]}${lastName}`.toLowerCase(),
      // `${firstName}${lastName[0]}`.toLowerCase(),
      `${firstName}.${lastName}`.toLowerCase(),
      `${firstName}${lastName}`.toLowerCase(),
      `${firstName}-${lastName}`.toLowerCase(),
      `${firstName}_${lastName}`.toLowerCase()
    ];
    
    // 2. Run Sherlock Tool (local CLI tool) for each username
    const profiles = [];

    const sherlockOutput = '';// await runSherlock(usernames);

    const parsedProfiles = parseSherlockOutput(sherlockOutput);

    profiles.push(...parsedProfiles);

    const enrichedProfiles = await Promise.all(profiles.map(async (profile) => {

      const privacyStatus = await checkIfProfileIsPublic(profile.platformURL);
      const publicData = await scrapeProfilePublicData(profile.platformURL);

      return { 
        ...profile, 
        ...privacyStatus,
        ...publicData
      };
    }));

    // 5. Build Candidates
    const candidates = [
      {
        firstName,
        lastName,
        imageLinks: [],
        bio: 'No bio found',
        email,
        DOB,
        age,
        usernames: [usernames],
        location,
        occupation,
        profiles: enrichedProfiles,
        privacyRank: 'F',
        AdditionalInfo: 'No additional info found',
      }
    ];

    // Add Google Images search results to candidates
    const imageLinks = await fetchImageLinks(`${firstName} ${lastName} ${location} ${occupation}`, 10);

    // Run google dorks against linkedIn 
    const linkedInImageLinks = await fetchImageLinks(`site:linkedin.com/in/ "${firstName} ${lastName} ${location} ${occupation}"`, 10);
    imageLinks.push(...linkedInImageLinks);

  
    // Run a google dork search for linkedIn profiles should not use the fetch image links function it should be a separate function

    // For each of the linkedIn results, try to scrape out the candidate's name, location, and occupation and other information and add it to the candidate object
    const linkedInProfiles = (await fetchLinkedInProfilePages( firstName, lastName, location, occupation)).map(async (profile) => {
      const privacyStatus = await checkIfProfileIsPublic(profile);
      const publicData = await scrapeProfilePublicData(profile);

      return { 
        ...profile, 
        ...privacyStatus,
        ...publicData
      };
    });


    candidates.forEach(candidate => {
      candidate.imageLinks = imageLinks;
    });

    const missingPlatforms = detectMissingPlatforms(enrichedProfiles);

    // if (missingPlatforms.includes('Facebook')) {
    //   const fbResults = await searchFacebookByName(firstName, lastName, location);
    //   enrichedProfiles.push(...fbResults);
    // }
    // if (missingPlatforms.includes('Instagram')) {
    //   const igResults = await searchInstagramByName(firstName, lastName, location);
    //   enrichedProfiles.push(...igResults);
    // }
    // if (missingPlatforms.includes('LinkedIn')) {
    //   const liResults = await searchLinkedInByName(firstName, lastName, location);
    //   enrichedProfiles.push(...liResults);
    // }

    // TODO - Voter registration, court records, etc.
    // Voter registration search using https://vt.ncsbe.gov/RegLkup/ in North Carolina. 
    // Looks like I can get voter details like county status party race, ethnicity, gender, reg date. Can also get jurisdictions which could be used for more specific searches.
    // Court records search using https://www.nccourts.gov/court-records in North Carolina

    // need to use playwright to scrape the data from the page and return it as JSON

    // Can use AI to provide ideas for spear phishing attacks based on the data collected.
    // For example, if the candidate is a lawyer, I can suggest sending an email with a fake court document attached.

    // 6. Score Candidates
    const scoredCandidates = candidates.map(candidate => ({
      ...candidate,
      similarityScore: calculateSimilarityScore(req.body, candidate)
    }));

    // 7. Sort Candidates by Score
    scoredCandidates.sort((a, b) => b.similarityScore - a.similarityScore);

    // 8. Return Results
    res.json({
      query: { firstName, lastName, imageLinks, email, username, location, DOB, age, occupation },
      candidates: scoredCandidates
    });

  } catch (error) {
    console.error('Error during people search:', error);
    res.status(500).json({ error: 'Failed to complete search', details: error.message });
  }

}
