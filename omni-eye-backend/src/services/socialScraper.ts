import axios from 'axios';
import * as cheerio from 'cheerio';

/****************************************************************************
 * Function: scrapeProfilePublicData
 * Purpose: Try to fetch bio, location, follower count from public profile pages
 ****************************************************************************/
export async function scrapeProfilePublicData(profileUrl) {
  try {
    const { data } = await axios.get(profileUrl, { timeout: 5000 });
    const $ = cheerio.load(data);

    // 🔵 Detect platform based on URL
    if (profileUrl.includes('twitter.com')) {
      return scrapeTwitter($);
    } else if (profileUrl.includes('instagram.com')) {
      return scrapeInstagram($);
    } else if (profileUrl.includes('linkedin.com')) {
      return scrapeLinkedIn($);
    } else if (profileUrl.includes('facebook.com')) {
      return scrapeFacebook($);
    } else {
      return {};
    }

  } catch (error) {
    console.error(`Scrape failed for ${profileUrl}:`, error.message);
    return {};
  }
}

/****************************************************************************
 * Scraping helpers per platform
 ****************************************************************************/

function scrapeTwitter($) {
  return {
    bio: $('div[data-testid="UserDescription"]').text().trim() || null,
    location: $('div[data-testid="UserProfileHeader_Items"] span').first().text().trim() || null,
    followers: $('a[href$="/followers"] > span').first().text().trim() || null
  };
}

function scrapeInstagram($) {
  const metaDescription = $('meta[property="og:description"]').attr('content') || '';
  const parts = metaDescription.split('•');

  return {
    bio: parts.length > 2 ? parts[2].trim() : null,
    followers: parts.length > 0 ? parts[0].trim() : null
  };
}

function scrapeLinkedIn($) {
  return {
    bio: $('section.pv-about-section p').text().trim() || null,
    location: $('li.t-16.t-black.t-normal.inline-block').text().trim() || null
  };
}

function scrapeFacebook($) {
  return {
    bio: $('div[data-testid="profile_intro_card_bio"]').text().trim() || null,
    location: $('div[data-overviewsection="current_city"]').text().trim() || null
  };
}
