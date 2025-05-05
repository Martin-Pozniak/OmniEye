/****************************************************************************
 * Function: calculateSimilarityScore
 * Purpose: Basic scoring based on input matching
 ****************************************************************************/
export function calculateSimilarityScore(input, candidate) {
    let score = 0;
  
    if (candidate.usernames.includes(input.username)) {
      score += 0.4;
    }
    if (candidate.email && input.email && candidate.email === input.email) {
      score += 0.3;
    }
    if (candidate.location && input.location && candidate.location === input.location) {
      score += 0.2;
    }
    if (candidate.occupation && input.occupation && candidate.occupation === input.occupation) {
      score += 0.1;
    }
  
    return Math.min(score, 1); // Always cap at 1
  }
  