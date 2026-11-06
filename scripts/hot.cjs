// The parent notifies us only after a successful compilation.
// Unaccepted updates (for example app.ts) require a fresh server process.
let checking = false;
let pending = false;

process.on('message', async (message) => {
  if (message !== 'rspack:built') return;
  pending = true;
  if (checking) return;
  checking = true;
  try {
    while (pending) {
      pending = false;
      await module.hot.check(true);
    }
  } catch (error) {
    console.error('[HMR] Restarting server:', error.message);
    process.exit(75);
  } finally {
    checking = false;
  }
});
