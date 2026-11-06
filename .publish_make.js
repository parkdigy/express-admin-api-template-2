const ll = console.log;

const exec = require('child_process').exec;

const isWin = process.platform === 'win32';
const mode = process.env.NODE_ENV;
const modeBranchName = `publish/${mode}`;

if (!['development', 'staging', 'production'].includes(mode)) {
  ll('Invalid mode :', mode);
  return;
}

const makePublishBranch = (branchName, callback) => {
  const commands = [
    'git checkout main',
    'git remote update',
    `git branch ${branchName}`,
    `git checkout ${branchName}`,
    isWin
      ? `(Get-Content .gitignore) -replace '#PUB#', '' | Set-Content .gitignore`
      : `sed -i '' 's/#PUB#//g' .gitignore`,
    'npm run reset:gitignore',
    'git add .',
    `git commit -m '${branchName}'`,
    `git push --set-upstream origin ${branchName}`,
    'git checkout main',
  ];

  const runCommand = (index) => {
    if (index >= commands.length) {
      callback && callback(true);
      return;
    }

    const commandInfo = commands[index];
    let command;
    let skipError = false;
    if (typeof commandInfo === 'string') {
      command = commandInfo;
    } else {
      command = commandInfo.command;
      skipError = commandInfo.skipError;
    }

    ll(`\$ ${command}`);
    exec(command, (err, stdout, stderr) => {
      if (!skipError && err) {
        ll('🚨ERROR🚨', err);
        callback && callback(false);
        return;
      }

      runCommand(index + 1);
    });
  };

  runCommand(0);
};

exec('git branch', (err, stdout, stderr) => {
  if (err) {
    ll('🚨ERROR🚨', err);
    return;
  }

  let commonBranchExists = false;
  let modeBranchExists = false;

  stdout.split('\n').find((branch) => {
    let branchName = branch.trim();
    if (branchName.indexOf('* ') === 0) {
      branchName = branch.substr(2).trim();
    }
    if (branchName === modeBranchName) {
      modeBranchExists = true;
    }
  });

  if (!modeBranchExists) {
    makePublishBranch(modeBranchName);
  } else {
    ll(`${modeBranchName} branch already exists.`);
  }
});
