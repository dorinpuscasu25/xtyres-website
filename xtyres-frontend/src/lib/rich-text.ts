function normalizeLineBreaks(value: string): string {
  return value
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

export function normalizeRichText(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = normalizeLineBreaks(value).trim();

  return normalized === '' ? null : normalized;
}

export function hasHtmlMarkup(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function sanitizeHtml(value: string): string {
  if (typeof DOMParser === 'undefined') {
    return value;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(value, 'text/html');

  document
    .querySelectorAll('script, style, iframe, object, embed, link, meta')
    .forEach((node) => node.remove());

  document.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (['src', 'href', 'xlink:href'].includes(name) && value.startsWith('javascript:')) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return document.body.innerHTML;
}

export function prepareRichText(value?: string | null): {
  html: string | null;
  isHtml: boolean;
} {
  const normalized = normalizeRichText(value);

  if (!normalized) {
    return {
      html: null,
      isHtml: false,
    };
  }

  if (!hasHtmlMarkup(normalized)) {
    return {
      html: normalized,
      isHtml: false,
    };
  }

  return {
    html: sanitizeHtml(normalized),
    isHtml: true,
  };
}
