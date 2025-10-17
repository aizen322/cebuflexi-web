import DOMPurify from 'isomorphic-dompurify';

// HTML sanitization
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Basic cleanup first
  const cleaned = input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' '); // Normalize whitespace

  // Use DOMPurify to sanitize HTML
  return DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'], // Only allow basic formatting
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true,
  });
}

// Text sanitization (no HTML)
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Email sanitization
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Basic cleanup
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/[^\w@.-]/g, ''); // Keep only alphanumeric, @, ., and -
  
  // Validate email format
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(cleaned)) {
    return '';
  }
  
  // Additional validation checks
  const [localPart, domain] = cleaned.split('@');
  
  // Local part validation
  if (localPart.length > 64 || localPart.length < 1) {
    return '';
  }
  
  // Domain validation
  if (domain.length > 253 || domain.length < 1) {
    return '';
  }
  
  // Check for consecutive dots
  if (cleaned.includes('..')) {
    return '';
  }
  
  // Check for dots at start/end of local part
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return '';
  }
  
  // Check for dots at start/end of domain
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return '';
  }
  
  // Limit total length
  return cleaned.substring(0, 254);
}

// Phone number sanitization
export function sanitizePhone(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove all non-digit characters except + at the beginning
  let cleaned = input.trim();
  if (cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.slice(1).replace(/\D/g, '');
  } else {
    cleaned = cleaned.replace(/\D/g, '');
  }
  
  // Validate Philippine phone number format
  if (cleaned.startsWith('+63')) {
    return cleaned.substring(0, 13); // +63XXXXXXXXXX
  } else if (cleaned.startsWith('63')) {
    return '+' + cleaned.substring(0, 12); // +63XXXXXXXXXX
  } else if (cleaned.startsWith('0')) {
    return '+63' + cleaned.substring(1, 11); // +63XXXXXXXXX
  } else if (cleaned.length === 10) {
    return '+63' + cleaned; // +63XXXXXXXXXX
  }
  
  return cleaned;
}

// URL sanitization
export function sanitizeURL(input: string): string {
  if (typeof input !== 'string') return '';
  
  try {
    const url = new URL(input);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    
    // Remove dangerous characters from pathname
    url.pathname = url.pathname.replace(/[<>]/g, '');
    
    return url.toString();
  } catch {
    return '';
  }
}

// File name sanitization
export function sanitizeFileName(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 255); // Limit length
}

// SQL injection prevention (basic)
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, ''); // Remove SQL keywords
}

// XSS prevention
export function preventXSS(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Input length validation
export function validateLength(input: string, min: number = 0, max: number = Infinity): boolean {
  if (typeof input !== 'string') return false;
  return input.length >= min && input.length <= max;
}

// Check for suspicious patterns
export function detectSuspiciousPatterns(input: string): string[] {
  const warnings: string[] = [];
  
  if (typeof input !== 'string') return warnings;
  
  // Check for potential XSS
  if (/<script|javascript:|data:|vbscript:|on\w+\s*=/i.test(input)) {
    warnings.push('Potential XSS detected');
  }
  
  // Check for SQL injection attempts
  if (/(union|select|insert|update|delete|drop|create|alter|exec|execute).*from|where|into/i.test(input)) {
    warnings.push('Potential SQL injection detected');
  }
  
  // Check for command injection
  if (/[;&|`$(){}[\]]/.test(input)) {
    warnings.push('Potential command injection detected');
  }
  
  // Check for excessive special characters
  const specialCharCount = (input.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > input.length * 0.3) {
    warnings.push('Excessive special characters detected');
  }
  
  return warnings;
}

// Comprehensive sanitization for user input
export function sanitizeUserInput(input: string, type: 'text' | 'html' | 'email' | 'phone' | 'url' | 'filename' = 'text'): string {
  if (typeof input !== 'string') return '';
  
  switch (type) {
    case 'html':
      return sanitizeHTML(input);
    case 'email':
      return sanitizeEmail(input);
    case 'phone':
      return sanitizePhone(input);
    case 'url':
      return sanitizeURL(input);
    case 'filename':
      return sanitizeFileName(input);
    default:
      return sanitizeText(input);
  }
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  return token === sessionToken;
}

// Rate limiting helper
export class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  constructor(
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
    private maxRequests: number = 100
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const current = this.store.get(key);
    
    if (!current || now > current.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (current.count >= this.maxRequests) {
      return false;
    }
    
    current.count++;
    return true;
  }
  
  getRemainingRequests(key: string): number {
    const current = this.store.get(key);
    if (!current) return this.maxRequests;
    
    const now = Date.now();
    if (now > current.resetTime) return this.maxRequests;
    
    return Math.max(0, this.maxRequests - current.count);
  }
  
  getResetTime(key: string): number | null {
    const current = this.store.get(key);
    return current ? current.resetTime : null;
  }
}

// Input validation helper
export function validateInput(input: any, rules: {
  type?: 'string' | 'number' | 'boolean' | 'email' | 'phone' | 'url';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  sanitizeType?: 'text' | 'html' | 'email' | 'phone' | 'url' | 'filename';
}): { valid: boolean; value?: any; error?: string } {
  // Check required
  if (rules.required && (input === null || input === undefined || input === '')) {
    return { valid: false, error: 'This field is required' };
  }
  
  // Skip validation if not required and empty
  if (!rules.required && (input === null || input === undefined || input === '')) {
    return { valid: true, value: input };
  }
  
  let value = input;
  
  // Type validation
  if (rules.type) {
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') return { valid: false, error: 'Must be a string' };
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) return { valid: false, error: 'Must be a number' };
        break;
      case 'boolean':
        if (typeof value !== 'boolean') return { valid: false, error: 'Must be a boolean' };
        break;
      case 'email':
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { valid: false, error: 'Must be a valid email' };
        }
        break;
      case 'phone':
        if (typeof value !== 'string' || !/^(\+63|0)?[0-9]{10}$/.test(value)) {
          return { valid: false, error: 'Must be a valid Philippine phone number' };
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          return { valid: false, error: 'Must be a valid URL' };
        }
        break;
    }
  }
  
  // Length validation
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return { valid: false, error: `Must be at least ${rules.minLength} characters` };
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return { valid: false, error: `Must be no more than ${rules.maxLength} characters` };
    }
  }
  
  // Pattern validation
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return { valid: false, error: 'Invalid format' };
  }
  
  // Sanitization
  if (rules.sanitize && typeof value === 'string') {
    value = sanitizeUserInput(value, rules.sanitizeType);
  }
  
  return { valid: true, value };
}
