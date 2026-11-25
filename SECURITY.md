# Security policy

This is a static website (HTML, CSS, JavaScript and images) with no server, database,
login or stored visitor data.

## Reporting a vulnerability

Please report security issues privately through GitHub:
**Security → Report a vulnerability** on this repository
(https://github.com/tawananyashamarekwa-design/tinombaseramusic/security/advisories/new).
Please do not open a public issue for a security problem.

You can expect an acknowledgement within a few days. Once a fix is published, we're happy
to credit you if you'd like.

## What the site does to protect visitors

- **Content Security Policy** (in `index.html`, and in `_headers` for hosts that support it):
  only the site's own scripts can run. Styles and fonts load only from the site and Google
  Fonts, images only from the site and YouTube thumbnails, and frames only from the
  privacy-enhanced YouTube player. Plugins, `<base>` hijacking and posting forms to other
  sites are all blocked.
- **No inline scripts, inline styles or `eval`**, so the policy needs no `unsafe-*`
  exceptions.
- **Output escaping and URL allow-listing**: every value from `config.js` is HTML-escaped
  before it reaches the page. Every link and image passes an allow-list (`https:`,
  `mailto:` or the site's own files), so `javascript:` and `data:` URLs are refused. YouTube
  IDs must match the 11-character format.
- **Clickjacking guard**: the page refuses to render inside another site's frame.
  `X-Frame-Options` and `frame-ancestors` in `_headers` do the same on hosts that support
  headers.
- **External links** open with `rel="noopener noreferrer"`.
- **YouTube player** loads only when the visitor presses play. It is isolated by origin (only that player domain can be framed) and uses
  `youtube-nocookie.com`.
- **Contact form**:
  - a hidden honeypot field and a minimum-time check against bots;
  - length limits and stripping of control and bidirectional-override characters;
  - a cooldown and a per-visit limit on sends;
  - an `https`-only endpoint, called without cookies or a referrer, with a timeout;
  - it never claims to have sent a note that wasn't sent.
- **No secrets** are stored in this repository.

## Limits of GitHub Pages

GitHub Pages does not let a site set its own HTTP headers. HSTS, `X-Frame-Options`,
`Permissions-Policy`, `X-Content-Type-Options` and `frame-ancestors` therefore apply only if
the site is moved to a host that reads `_headers` (Netlify, Cloudflare Pages) or one with
equivalent settings.

GitHub Pages does serve the site over HTTPS. Keep **Settings → Pages → Enforce HTTPS** turned on.
