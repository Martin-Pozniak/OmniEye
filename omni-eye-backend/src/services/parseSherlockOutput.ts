/****************************************************************************
 * Function: parseSherlockOutput
 * Purpose: Turn Sherlock text output into structured profile list
 ****************************************************************************/
export function parseSherlockOutput(output) {

    const lines = output.split('\n');
    const profiles = [];
    let currentUsername = '';

    // parse the lines
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect username being checked
        if (line.startsWith('[*] Checking username')) {
            const parts = line.split(' ');
            currentUsername = parts[3]; // Extract the username
        }

        // Parse platform results
        if (line.startsWith('[+]')) {
            const parts = line.split(':');
            if (parts.length === 3) {
                const platformName = parts[0].replace('[+]', '').trim();
                const platformURL = parts[1].trim() + ':' + parts[2].trim();
                profiles.push({
                    username: currentUsername,
                    platformName,
                    platformURL,
                });
            }
        }
    }

    return profiles;

}
  