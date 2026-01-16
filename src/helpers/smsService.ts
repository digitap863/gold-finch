/**
 * SMS Gateway Service (web.smsgw.in)
 * Handles OTP and SMS sending via HTTP/JSON API
 */

import axios from 'axios';

// SMS Gateway Configuration
const SMS_CONFIG = {
  username: process.env.SMS_GATEWAY_USERNAME || '',
  password: process.env.SMS_GATEWAY_PASSWORD || '',
  senderId: process.env.SMS_GATEWAY_SENDER_ID || '',
  peId: process.env.SMS_GATEWAY_PE_ID || '',
  templateIdLogin: process.env.SMS_GATEWAY_TEMPLATE_ID_LOGIN || '',
  templateIdPassword: process.env.SMS_GATEWAY_TEMPLATE_ID_PASSWORD || '',
  apiUrl: process.env.SMS_GATEWAY_API_URL || 'https://web.smsgw.in/smsapi/jsonapi.jsp',
};

// Response interfaces
interface SMSSuccessResponse {
  data: {
    ackid: string;
    msgid: string[];
  };
}

interface SMSErrorResponse {
  Error: {
    ErrorCode: string;
    ErrorDesc: string;
  };
}

type SMSResponse = SMSSuccessResponse | SMSErrorResponse;

// Error code descriptions from documentation
const ERROR_CODES: Record<string, string> = {
  '010': 'Sender ID length/format error',
  '011': 'Mobile number length/format error',
  '015': 'Insufficient credit error',
  '103': 'Message empty error',
  '104': 'Coding error',
  '105': 'Schedule time format error',
};

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validate SMS Gateway configuration
 */
function validateConfig(templateId?: string): void {
  if (!SMS_CONFIG.username || !SMS_CONFIG.password) {
    throw new Error('SMS Gateway credentials not configured');
  }
  if (!SMS_CONFIG.senderId) {
    throw new Error('SMS Gateway sender ID not configured');
  }
  if (!SMS_CONFIG.peId) {
    throw new Error('SMS Gateway PE ID not configured');
  }
  if (templateId && !templateId) {
    throw new Error('Template ID not provided');
  }
}

/**
 * Parse SMS Gateway API response
 */
function parseSMSResponse(response: any): { success: boolean; message: string; ackid?: string } {
  // Log the raw response for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Raw SMS Gateway Response:', JSON.stringify(response, null, 2));
  }

  // Check for error response
  if ('Error' in response) {
    const errorCode = response.Error.ErrorCode;
    const errorDesc = ERROR_CODES[errorCode] || response.Error.ErrorDesc || 'Unknown error';
    return {
      success: false,
      message: `SMS Gateway Error (${errorCode}): ${errorDesc}`,
    };
  }

  // Success response - nested data format (handles both ack_id and ackid)
  if ('data' in response && (response.data?.ack_id || response.data?.ackid)) {
    return {
      success: true,
      message: 'SMS sent successfully',
      ackid: response.data.ack_id || response.data.ackid,
    };
  }

  // Success response - direct ackid format (common in many SMS gateways)
  if ('ackid' in response && response.ackid) {
    return {
      success: true,
      message: 'SMS sent successfully',
      ackid: response.ackid,
    };
  }

  // Success response - msgid array format
  if ('msgid' in response && Array.isArray(response.msgid) && response.msgid.length > 0) {
    return {
      success: true,
      message: 'SMS sent successfully',
      ackid: response.msgid[0],
    };
  }

  // Success response - status based format
  if ('status' in response && (response.status === 'success' || response.status === 'submitted' || response.status === 'sent')) {
    return {
      success: true,
      message: 'SMS sent successfully',
      ackid: response.msgid || response.id || response.transactionId || undefined,
    };
  }

  // Check for string response that indicates success (some gateways return plain text)
  if (typeof response === 'string' && (response.includes('success') || response.includes('submitted') || response.includes('sent'))) {
    return {
      success: true,
      message: 'SMS sent successfully',
    };
  }

  // Unexpected response format - include response data for debugging
  return {
    success: false,
    message: `Unexpected SMS Gateway response format: ${JSON.stringify(response)}`,
  };
}

/**
 * Send OTP via SMS Gateway API
 * @param mobile - Mobile number (10-digit or with country code)
 * @param otp - 6-digit OTP code
 * @param context - 'login' or 'password' to determine which template to use
 * @returns Promise with success status and message
 */
export async function sendOTP(
  mobile: string,
  otp: string,
  context: 'login' | 'password' = 'login'
): Promise<{ success: boolean; message: string; ackid?: string }> {
  try {
    // Select appropriate template ID based on context
    const templateId = context === 'password' 
      ? SMS_CONFIG.templateIdPassword 
      : SMS_CONFIG.templateIdLogin;

    validateConfig(templateId);

    // Format mobile number (ensure it has country code)
    let formattedMobile = mobile.replace(/\D/g, '');
    if (formattedMobile.length === 10) {
      formattedMobile = '91' + formattedMobile; // Add India country code
    }

    // OTP message template - matches your approved templates
    // First {#var#} = App/Brand name, Second {#var#} = OTP code
    const appName = 'GoldFinch Jewels';
    const message = context === 'password'
      ? `Dear Customer, Your OTP to reset your password for ${appName} is ${otp}. This OTP is valid for 10 minutes. Do not share it with anyone. goldfinch jewels.com`
      : `Dear Customer, Your OTP for login to ${appName} is ${otp}. This OTP is valid for 10 minutes. Do not share it with anyone. goldfinch jewels.com`;

    const finalMessage = message;

    // Prepare JSON payload
    const payload = {
      username: SMS_CONFIG.username,
      password: SMS_CONFIG.password,
      from: SMS_CONFIG.senderId,
      pe_id: SMS_CONFIG.peId,
      template_id: templateId,
      to: [formattedMobile],
      text: finalMessage,
      coding: '0', // 0 for English, 2 for Unicode
    };

    // Send request to SMS Gateway
    const response = await axios.post<SMSResponse>(SMS_CONFIG.apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Parse and return response
    const result = parseSMSResponse(response.data);

    // Log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('SMS Gateway Response:', {
        mobile: formattedMobile,
        otp,
        context,
        templateId,
        result,
      });
    }

    return result;
  } catch (error: any) {
    console.error('SMS Gateway Error:', error);

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        return {
          success: false,
          message: `SMS Gateway API Error: ${error.response.status} - ${error.response.statusText}`,
        };
      } else if (error.request) {
        // Request made but no response
        return {
          success: false,
          message: 'SMS Gateway API is not responding. Please try again later.',
        };
      }
    }

    // Generic error
    return {
      success: false,
      message: error.message || 'Failed to send SMS',
    };
  }
}

/**
 * Send generic SMS (for notifications, alerts, etc.)
 * @param mobile - Mobile number
 * @param message - Message content
 * @param coding - 0 for English, 2 for Unicode
 * @param templateId - Optional template ID, defaults to login template
 * @returns Promise with success status and message
 */
export async function sendSMS(
  mobile: string,
  message: string,
  coding: '0' | '2' = '0',
  templateId?: string
): Promise<{ success: boolean; message: string; ackid?: string }> {
  try {
    const finalTemplateId = templateId || SMS_CONFIG.templateIdLogin;
    validateConfig(finalTemplateId);

    // Format mobile number
    let formattedMobile = mobile.replace(/\D/g, '');
    if (formattedMobile.length === 10) {
      formattedMobile = '91' + formattedMobile;
    }

    // Prepare JSON payload
    const payload = {
      username: SMS_CONFIG.username,
      password: SMS_CONFIG.password,
      from: SMS_CONFIG.senderId,
      pe_id: SMS_CONFIG.peId,
      template_id: finalTemplateId,
      to: [formattedMobile],
      text: message,
      coding,
    };

    // Send request
    const response = await axios.post<SMSResponse>(SMS_CONFIG.apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return parseSMSResponse(response.data);
  } catch (error: any) {
    console.error('SMS Gateway Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send SMS',
    };
  }
}

/**
 * Send bulk SMS to multiple recipients
 * @param recipients - Array of {mobile, message} objects
 * @returns Promise with results for each recipient
 */
export async function sendBulkSMS(
  recipients: Array<{ mobile: string; message: string; coding?: '0' | '2' }>
): Promise<Array<{ mobile: string; success: boolean; message: string }>> {
  const results = [];

  for (const recipient of recipients) {
    const result = await sendSMS(recipient.mobile, recipient.message, recipient.coding || '0');
    results.push({
      mobile: recipient.mobile,
      ...result,
    });
  }

  return results;
}
