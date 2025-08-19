export function msToMinutes(ms) {
  return Math.floor(ms / 60000);
}

export function msToSeconds(ms) {
  return Math.floor((ms % 60000) / 1000);
}

export function minutesToMs(minutes) {
  return minutes * 60000;
}
