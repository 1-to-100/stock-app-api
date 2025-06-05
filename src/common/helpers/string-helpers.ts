import { PUBLIC_EMAIL_DOMAINS } from '@/common/helpers/public-email-domains';

export function getDomainFromEmail(email: string): string {
  if (!email) return '';

  const trimmed = email.trim().toLowerCase();
  const domainRegex = /@([^@\s]+)$/;
  const match = domainRegex.exec(trimmed);
  return match ? match[1] : '';
}

export function isPublicEmailDomain(domain: string): boolean {
  return PUBLIC_EMAIL_DOMAINS.has(domain.toLowerCase().trim());
}
