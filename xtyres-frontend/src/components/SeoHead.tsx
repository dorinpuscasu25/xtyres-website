import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description?: string | null;
  keywords?: string | null;
}

function upsertMetaTag(name: string, content?: string | null) {
  const existing = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

  if (!content) {
    existing?.remove();
    return;
  }

  if (existing) {
    existing.content = content;
    return;
  }

  const tag = document.createElement('meta');
  tag.name = name;
  tag.content = content;
  document.head.appendChild(tag);
}

export function SeoHead({ title, description, keywords }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;
    upsertMetaTag('description', description);
    upsertMetaTag('keywords', keywords);
  }, [title, description, keywords]);

  return null;
}
