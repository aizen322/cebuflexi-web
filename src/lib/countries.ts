export interface Country {
  code: string;
  name: string;
  phonePrefix: string;
  flag: string;
  phoneLength: {
    min: number;
    max: number;
  };
  phonePattern: RegExp;
}

// Popular tourist countries with phone number configurations
export const countries: Country[] = [
  {
    code: 'PH',
    name: 'Philippines',
    phonePrefix: '+63',
    flag: '🇵🇭',
    phoneLength: { min: 10, max: 10 },
    phonePattern: /^(\+63|0)?[0-9]{10}$/
  },
  {
    code: 'US',
    name: 'United States',
    phonePrefix: '+1',
    flag: '🇺🇸',
    phoneLength: { min: 10, max: 10 },
    phonePattern: /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    phonePrefix: '+44',
    flag: '🇬🇧',
    phoneLength: { min: 10, max: 11 },
    phonePattern: /^(\+44|0)?[1-9]\d{8,9}$/
  },
  {
    code: 'AU',
    name: 'Australia',
    phonePrefix: '+61',
    flag: '🇦🇺',
    phoneLength: { min: 9, max: 9 },
    phonePattern: /^(\+61|0)?[2-9]\d{8}$/
  },
  {
    code: 'CA',
    name: 'Canada',
    phonePrefix: '+1',
    flag: '🇨🇦',
    phoneLength: { min: 10, max: 10 },
    phonePattern: /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/
  },
  {
    code: 'JP',
    name: 'Japan',
    phonePrefix: '+81',
    flag: '🇯🇵',
    phoneLength: { min: 10, max: 11 },
    phonePattern: /^(\+81|0)?[1-9]\d{9,10}$/
  },
  {
    code: 'KR',
    name: 'South Korea',
    phonePrefix: '+82',
    flag: '🇰🇷',
    phoneLength: { min: 9, max: 11 },
    phonePattern: /^(\+82|0)?[1-9]\d{7,9}$/
  },
  {
    code: 'CN',
    name: 'China',
    phonePrefix: '+86',
    flag: '🇨🇳',
    phoneLength: { min: 11, max: 11 },
    phonePattern: /^(\+86|0)?1[3-9]\d{9}$/
  },
  {
    code: 'SG',
    name: 'Singapore',
    phonePrefix: '+65',
    flag: '🇸🇬',
    phoneLength: { min: 8, max: 8 },
    phonePattern: /^(\+65|0)?[689]\d{7}$/
  },
  {
    code: 'MY',
    name: 'Malaysia',
    phonePrefix: '+60',
    flag: '🇲🇾',
    phoneLength: { min: 9, max: 11 },
    phonePattern: /^(\+60|0)?[1-9]\d{7,9}$/
  },
  {
    code: 'TH',
    name: 'Thailand',
    phonePrefix: '+66',
    flag: '🇹🇭',
    phoneLength: { min: 9, max: 9 },
    phonePattern: /^(\+66|0)?[689]\d{8}$/
  },
  {
    code: 'ID',
    name: 'Indonesia',
    phonePrefix: '+62',
    flag: '🇮🇩',
    phoneLength: { min: 10, max: 13 },
    phonePattern: /^(\+62|0)?[1-9]\d{8,11}$/
  },
  {
    code: 'VN',
    name: 'Vietnam',
    phonePrefix: '+84',
    flag: '🇻🇳',
    phoneLength: { min: 9, max: 10 },
    phonePattern: /^(\+84|0)?[1-9]\d{8,9}$/
  },
  {
    code: 'IN',
    name: 'India',
    phonePrefix: '+91',
    flag: '🇮🇳',
    phoneLength: { min: 10, max: 10 },
    phonePattern: /^(\+91|0)?[6-9]\d{9}$/
  },
  {
    code: 'DE',
    name: 'Germany',
    phonePrefix: '+49',
    flag: '🇩🇪',
    phoneLength: { min: 10, max: 12 },
    phonePattern: /^(\+49|0)?[1-9]\d{8,10}$/
  },
  {
    code: 'FR',
    name: 'France',
    phonePrefix: '+33',
    flag: '🇫🇷',
    phoneLength: { min: 9, max: 9 },
    phonePattern: /^(\+33|0)?[1-9]\d{8}$/
  },
  {
    code: 'ES',
    name: 'Spain',
    phonePrefix: '+34',
    flag: '🇪🇸',
    phoneLength: { min: 9, max: 9 },
    phonePattern: /^(\+34|0)?[6-9]\d{8}$/
  },
  {
    code: 'IT',
    name: 'Italy',
    phonePrefix: '+39',
    flag: '🇮🇹',
    phoneLength: { min: 9, max: 11 },
    phonePattern: /^(\+39|0)?[3]\d{8,10}$/
  },
  {
    code: 'NL',
    name: 'Netherlands',
    phonePrefix: '+31',
    flag: '🇳🇱',
    phoneLength: { min: 9, max: 9 },
    phonePattern: /^(\+31|0)?[6]\d{8}$/
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    phonePrefix: '+971',
    flag: '🇦🇪',
    phoneLength: { min: 9, max: 9 },
    phonePattern: /^(\+971|0)?[5]\d{8}$/
  }
];

// Default country (Philippines)
export const defaultCountry = countries.find(c => c.code === 'PH') || countries[0];

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code);
}

export function validatePhoneNumber(phone: string, country: Country): boolean {
  if (!phone || !country) return false;
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Test against country-specific pattern
  return country.phonePattern.test(cleaned);
}

export function formatPhoneNumber(phone: string, country: Country): string {
  if (!phone || !country) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already has prefix, return as is
  if (cleaned.startsWith(country.phonePrefix)) {
    return cleaned;
  }
  
  // Remove leading zeros and add country prefix
  const digitsOnly = cleaned.replace(/^0+/, '');
  return `${country.phonePrefix}${digitsOnly}`;
}

export function getFullPhoneNumber(phone: string, country: Country): string {
  const formatted = formatPhoneNumber(phone, country);
  return formatted;
}

export function stripPhonePrefix(phone: string, country: Country): string {
  if (!phone || !country) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove the country prefix if present
  if (cleaned.startsWith(country.phonePrefix)) {
    return cleaned.substring(country.phonePrefix.length);
  }
  
  // Remove leading zeros
  return cleaned.replace(/^0+/, '');
}

export function getDigitsOnly(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}
