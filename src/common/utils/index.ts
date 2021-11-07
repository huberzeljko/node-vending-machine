import slug from 'slugify';

export function slugify(title: string) {
  return slug(title, { lower: true });
}
