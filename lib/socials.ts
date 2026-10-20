import {z} from 'zod';

const httpsUrl = z.string().refine(value => {
  if (!value) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}, 'Enter a valid https:// URL or leave this field empty.');

export const emptySocials = {
  facebook: '',
  instagram: '',
  x: '',
  linkedin: '',
  youtube: '',
  tiktok: '',
  whatsapp: '',
};

export const socialsSchema = z.object({
  facebook: httpsUrl.default(''),
  instagram: httpsUrl.default(''),
  x: httpsUrl.default(''),
  linkedin: httpsUrl.default(''),
  youtube: httpsUrl.default(''),
  tiktok: httpsUrl.default(''),
  whatsapp: httpsUrl.default(''),
});