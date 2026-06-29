# Xtyres legacy redirects

These redirects preserve traffic from the old WordPress/WooCommerce site when
the new frontend is launched on `xtyres.md`.

Production domain layout:

- `xtyres.md` / `www.xtyres.md`: frontend
- `api.xtyres.md`: backend API

Use one of these files depending on the production web server:

- Nginx: `deploy/xtyres-legacy-redirects.nginx.conf`
- Apache: `deploy/xtyres-legacy-redirects.htaccess`

Include the Nginx rules only in the `xtyres.md` / `www.xtyres.md` server block,
before the generic `proxy_pass` to the frontend app. Do not include them in the
`api.xtyres.md` backend server block.

The new frontend serves these SEO files from `xtyres-frontend/public`:

- `/sitemap.xml`
- `/robots.txt`

If the redirect rules are missing, old URLs will be served by the frontend app
instead of returning a `301`.

Covered legacy patterns:

- `/shop/` and `/shop/page/N/`
- `/shop/?filter_season=vara`
- `/product-category/anvelope/`
- `/product-category/acumulatoare/`
- `/product-category/anvelope/{brand}/`
- `/product-category/acumulatoare/{brand}/`
- direct old brand archives like `/product-category/hankook/`
- product trailing slash normalization `/produs/{slug}/`
- static aliases like `/contact/ -> /contacts`
- old WooCommerce utility pages like `/cart/`, `/checkout/`, `/my-account/`
- WordPress internals and feeds

After launch, check Google Search Console and access logs for 404 URLs during
the first 7-14 days and add any missing high-traffic legacy patterns here.
