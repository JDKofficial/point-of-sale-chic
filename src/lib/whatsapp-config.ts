// WhatsApp Configuration Utility
import { createWhatsAppService, WhatsAppConfig } from './whatsapp';

// Get WhatsApp configuration from environment variables
export function getWhatsAppConfig(): WhatsAppConfig {
  const platform = import.meta.env.VITE_WHATSAPP_PLATFORM as 'waha' | 'dripsender' | 'starsender' | 'wablas';
  const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
  const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY;
  const sessionId = import.meta.env.VITE_WHATSAPP_SESSION_ID;
  const deviceId = import.meta.env.VITE_WHATSAPP_DEVICE_ID;

  if (!platform || !apiUrl) {
    throw new Error('WhatsApp configuration is incomplete. Please check your environment variables.');
  }

  return {
    platform,
    apiUrl,
    apiKey,
    sessionId,
    deviceId,
  };
}

// Create WhatsApp service instance
export function createWhatsAppServiceInstance() {
  try {
    const config = getWhatsAppConfig();
    return createWhatsAppService(config);
  } catch (error) {
    console.error('Failed to create WhatsApp service:', error);
    return null;
  }
}

// Check if WhatsApp is configured
export function isWhatsAppConfigured(): boolean {
  try {
    const config = getWhatsAppConfig();
    return !!(config.platform && config.apiUrl);
  } catch {
    return false;
  }
}

// Get platform-specific configuration hints
export function getConfigurationHints(platform: string) {
  switch (platform) {
    case 'waha':
      return {
        title: 'WAHA (WhatsApp HTTP API)',
        description: 'Self-hosted WhatsApp API solution',
        requiredFields: ['API URL', 'Session ID'],
        defaultUrl: 'http://localhost:3000',
        documentation: 'https://waha.devlike.pro/',
      };
    case 'dripsender':
      return {
        title: 'DripSender',
        description: 'WhatsApp marketing platform Indonesia',
        requiredFields: ['API URL', 'API Key', 'Device ID'],
        defaultUrl: 'https://api.dripsender.id',
        documentation: 'https://dripsender.id/docs',
      };
    case 'starsender':
      return {
        title: 'StarSender',
        description: 'WhatsApp automation platform',
        requiredFields: ['API URL', 'API Key', 'Device ID'],
        defaultUrl: 'https://api.starsender.online',
        documentation: 'https://starsender.online/docs',
      };
    case 'wablas':
      return {
        title: 'Wablas',
        description: 'WhatsApp API Gateway Indonesia',
        requiredFields: ['API URL', 'API Key'],
        defaultUrl: 'https://console.wablas.com',
        documentation: 'https://wablas.com/documentation',
      };
    default:
      return {
        title: 'Unknown Platform',
        description: 'Platform tidak dikenal',
        requiredFields: [],
        defaultUrl: '',
        documentation: '',
      };
  }
}