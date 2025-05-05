import axios from 'axios';

/****************************************************************************
 * Function: checkIfProfileIsPublic
 * Purpose: Check if a social profile URL is public or private
 ****************************************************************************/
export async function checkIfProfileIsPublic(profileUrl) {
  try {
    const { data } = await axios.get(profileUrl, { timeout: 5000 });

    const isPrivate = (
      data.includes('This Account is Private') ||
      data.includes('These Tweets are protected') ||
      data.includes('Profile not available')
    );

    return {
      isPublic: !isPrivate,
      reason: isPrivate ? 'Detected privacy protection marker on page' : 'No privacy marker detected'
    };

  } catch (error) {
    console.error(`Error checking profile ${profileUrl}:`, error.message);

    return {
      isPublic: false,
      reason: 'Could not access profile (timeout, blocked, or error)'
    };
  }
}
