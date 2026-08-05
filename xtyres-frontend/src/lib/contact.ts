export const FACEBOOK_URL = 'https://www.facebook.com/xtyresmd';
export const INSTAGRAM_URL = 'https://www.instagram.com/xtyres.md/';

export function getPhoneHref(phone: string) {
  const normalizedPhone = phone.trim().replace(/[^\d+]/g, '');

  if (normalizedPhone.startsWith('0')) {
    return `tel:+373${normalizedPhone.slice(1)}`;
  }

  return `tel:${normalizedPhone}`;
}

export function getSocialUrl(name: string, url: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName === 'facebook') {
    return FACEBOOK_URL;
  }

  if (normalizedName === 'instagram') {
    return INSTAGRAM_URL;
  }

  return url;
}
