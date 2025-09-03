import crypto from 'crypto';

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateExpiryDate = (hours: number = 24): Date => {
  // Use milliseconds to avoid fractional hours issues with Date.setHours
  const ms = Math.round(hours * 60 * 60 * 1000);
  return new Date(Date.now() + ms);
};

export const isTokenExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
}; 