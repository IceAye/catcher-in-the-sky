export function buildDefaultSettings(config) {
  return Object.fromEntries(Object.entries(config).map((key , config) => [key , config.defaultConfigValue]));
}