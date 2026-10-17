// Busy-waits MS milliseconds so remote images can finish loading before a screenshot.
// (Maestro has no sleep command, and waitForAnimationToEnd returns while tiles are still blank.)
const end = Date.now() + Number(MS || 3000);
while (Date.now() < end) {
  // wait
}
