/**
 * Utility functions for mobile number formatting and validation
 */

export function formatMobileNumber(mobile: string): string {
  // Remove all non-digits
  let cleanMobile = mobile.replace(/\D/g, '');
  
  // Auto-add country code for Indian numbers if missing
  if (cleanMobile.length === 10 && (
    cleanMobile.startsWith('6') || 
    cleanMobile.startsWith('7') || 
    cleanMobile.startsWith('8') || 
    cleanMobile.startsWith('9')
  )) {
    cleanMobile = '91' + cleanMobile; // Add India country code
  }
  
  // Ensure it starts with country code for 10-digit numbers
  if (!cleanMobile.startsWith('91') && cleanMobile.length === 10) {
    cleanMobile = '91' + cleanMobile; // Default to India for 10-digit numbers
  }
  
  return cleanMobile;
}

export function getMobileVariations(mobile: string): string[] {
  const cleanMobile = formatMobileNumber(mobile);
  
  return [
    mobile, // Original input
    `+${cleanMobile}`, // With + prefix
    cleanMobile, // Just the clean number
  ];
}
