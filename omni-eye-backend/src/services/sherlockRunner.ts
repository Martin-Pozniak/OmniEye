import { exec } from 'child_process';


const sherlockPath = 'C:/OSINTTools/sherlock';

/****************************************************************************
 * Function: runSherlock
 * Purpose: Run Sherlock CLI to find social profiles for a username
 ****************************************************************************/
export function runSherlock(usernames) {

  return new Promise((resolve, reject) => {

    if (!Array.isArray(usernames)) {
      return reject(new Error('Input must be an array of usernames'));
    }

    const command = `python3 -m sherlock_project ${usernames.join(' ')} --print-found --timeout 5`;

    exec(command, { cwd: sherlockPath }, (error, stdout, stderr) => {

      if (error) {
        console.error('Sherlock error:', error.message);
        return reject(error);
      }

      resolve(stdout);

    });

  });

}