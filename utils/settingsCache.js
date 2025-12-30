// Module-scoped cache that persists until the module is reloaded
let settingsCache = null;

export const getCachedSettings = () => {
  if (typeof window === 'undefined') {
        return null;
    }
  return settingsCache;
};

export const setCachedSettings = (settings) => {
  settingsCache = settings;
};

export const clearSettingsCache = () => {
  settingsCache = null;
};