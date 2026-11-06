const { fork } = require('node:child_process');
const path = require('node:path');
const { watchFile, unwatchFile } = require('node:fs');
const { rspack } = require('@rspack/core');

process.env.NODE_ENV = 'development';
const config = require('../rspack.config');
const compiler = rspack(config);
let child;
let stopping = false;
let restarting = false;
let restartTimeout;
const envFile = path.resolve(__dirname, '../.env');

function startServer() {
  child = fork(path.join(config.output.path, config.output.filename), [], { stdio: 'inherit' });
  console.log(`[dev] Server started (PID ${child.pid})`);
  child.on('error', (error) => console.error('[dev] Server process error:', error));
  child.on('exit', (code) => {
    clearTimeout(restartTimeout);
    child = undefined;
    if (!stopping && (restarting || code === 75)) {
      restarting = false;
      startServer();
    }
  });
}

// Poll this single file so .env reloads also work with mounted filesystems.
watchFile(envFile, { interval: 500 }, (current, previous) => {
  if (stopping || !child || restarting) return;
  if (current.mtimeMs === previous.mtimeMs && current.size === previous.size) return;
  console.log('[dev] .env changed, restarting server');
  restarting = true;
  child.kill('SIGINT');
  restartTimeout = setTimeout(() => child?.kill('SIGKILL'), 5000);
  restartTimeout.unref();
});

// Coalesce the initial save and subsequent format-on-save write before applying HMR.
const watching = compiler.watch({ aggregateTimeout: 1000 }, (error, stats) => {
  if (stopping) return;
  if (error) {
    console.error(error);
    return;
  }
  console.log(stats.toString({ colors: process.stdout.isTTY, preset: 'errors-warnings' }));
  if (stats.hasErrors()) return;
  if (!child) startServer();
  else if (child.connected) child.send('rspack:built');
});

function stop() {
  if (stopping) return;
  stopping = true;
  unwatchFile(envFile);
  clearTimeout(restartTimeout);
  if (child) child.kill('SIGINT');
  const timeout = setTimeout(() => {
    if (child) child.kill('SIGKILL');
    process.exit(0);
  }, 5000);
  timeout.unref();
  watching.close(() => {
    compiler.close(() => {
      process.exitCode = 0;
    });
  });
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
