import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// The site is served on both 3digree.com and 3digree.in; Google should only index .com.
const CANONICAL_ORIGIN = 'https://3digree.com';

function upsert(selector, create, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const CanonicalTags = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
    const url = `${CANONICAL_ORIGIN}${path}`;

    upsert(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        return l;
      },
      'href',
      url
    );
    upsert(
      'meta[property="og:url"]',
      () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:url');
        return m;
      },
      'content',
      url
    );
  }, [pathname]);

  return null;
};

export default CanonicalTags;
