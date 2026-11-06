#!/usr/bin/env node

const ll = console.log;
const le = console.error;

const args = process.argv;
if (args.length < 4) {
  ll('Usage: node .git-merge.js <repositoryName> <branchName>');
  process.exit(1);
}

const repositoryName = args[2];
const branchName = args[3];

const { spawn } = require('child_process');

function run(execCommands) {
  return new Promise(async (resolve) => {
    if (Array.isArray(execCommands)) {
      for (const execCommand of execCommands) {
        await run(execCommand);
      }
      resolve();
    } else {
      ll(`> ${execCommands}`);

      const execCommandsArray = execCommands.split(' ');
      const command = execCommandsArray[0];
      const args = execCommandsArray.slice(1);
      const child = spawn(command, args, {
        stdio: 'pipe', // 기본값
      });

      let dataText = '';

      child.stdout.on('data', (data) => {
        ll(data.toString());
        dataText += data.toString();
      });

      child.stderr.on('data', (data) => {
        le(data.toString());
      });

      child.on('close', (code) => {
        if (code !== 0) {
          process.exit(1);
        } else {
          resolve(dataText.trim());
        }
      });
    }
  });
}

(async () => {
  await run([`git fetch ${repositoryName}`, `git merge ${repositoryName}/${branchName} --no-edit`]);
})();
