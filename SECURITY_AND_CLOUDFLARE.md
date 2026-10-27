# 🛡️ Kolom24 (কলম২৪) Security, SEO & Cloudflare Enterprise Hardening Guide

## 1. Cloudflare Integration Guidelines
To activate enterprise-grade DDoS defense and Bot mitigation on **kolom24.com**:

### A. SSL/TLS Configuration:
- Set encryption mode to **Full (Strict)**.
- Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.
- Enable **HTTP/2**, **HTTP/3 (with QUIC)**, and **0-RTT Connection Resumption**.

### B. WAF (Web Application Firewall) & Bot Fight Mode:
- **Bot Fight Mode**: Turn ON under `Security > Bots`.
- **Managed Challenge**: Trigger interactive challenge for visitors with threat score > 15.
- **Rate Limiting Rule**: Limit API requests to max 60 requests per minute per IP for `/api/*` and comments.
- **Custom WAF Rule for Admin Protection**:
  ```
  (http.request.uri.path contains "/admin" and not ip.src in {your_office_ips}) -> Block or Managed Challenge
  ```

### C. Security Headers (CSP & HSTS):
- **Content-Security-Policy (CSP)**:
  `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.maateen.me; font-src 'self' https://fonts.gstatic.com https://fonts.maateen.me data:; img-src 'self' data: https: blob:; connect-src 'self' https://graph.facebook.com https://indexing.googleapis.com;`
- **X-Frame-Options**: `SAMEORIGIN` (prevents clickjacking)
- **X-Content-Type-Options**: `nosniff` (prevents MIME sniffing)
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=()`

---

## 2. Dynamic Sitemap & Google Indexing API
- **Dynamic XML Sitemap**: Generated via `/src/utils/securityAndSeo.ts` `generateDynamicSitemapXml`. Downloads directly from Admin SEO panel.
- **Google Indexing API**: Instant notification dispatched whenever a new article is published from the Admin CMS.

---

## 3. Bot Protection & Honeypot
- **Invisible Honeypot**: Hidden `website_hp` field in forms. Any automated bot that populates this field is instantly dropped and logged in the Audit Trail (`অডিট লগ`).
- **Invisible reCAPTCHA v3**: Automated score verification (threshold 0.7+) without disturbing real human readers.
- **IP Rate Limiting**: Max 5 attempts per minute per IP for comment and login routes.
