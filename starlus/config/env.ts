import Constants from 'expo-constants';

interface EnvConfig {
  GOOGLE_DIGITAL_INK_API_KEY: string;
}

// Get the environment variables from app.config.js
const env = Constants.expoConfig?.extra?.env as EnvConfig;

if (!env?.GOOGLE_DIGITAL_INK_API_KEY) {
  console.warn('Google Digital Ink API key is not configured. Please add it to app.config.js');
}

export const config = {
  GOOGLE_DIGITAL_INK_API_KEY: env?.GOOGLE_DIGITAL_INK_API_KEY || '',
}; 