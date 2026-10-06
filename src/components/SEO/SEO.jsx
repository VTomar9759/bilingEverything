import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { DEFAULT_SEO, SITE_URL, OG_IMAGE } from "../../config/seo";

/**
 * SEO Component — Bill Everything
 *
 * Renders all necessary <head> meta tags for a page using react-helmet-async.
 * All props are optional; missing values fall back to DEFAULT_SEO constants.
 *
 * Usage:
 *   <SEO
 *     title="Dashboard"
 *     description="View your restaurant performance at a glance."
 *     robots="noindex,nofollow"
 *   />
 *
 * Canonical URL is automatically derived from SITE_URL + current pathname
 * unless you pass an explicit `canonical` prop.
 */
const SEO = ({
  // Basic
  title,
  description,
  keywords,
  robots,
  author,
  themeColor,

  // Canonical
  canonical,

  // Open Graph
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,

  // Twitter
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
}) => {
  const { pathname } = useLocation();

  // ── Resolve values (prop → default) ──────────────────────────────────────
  const resolvedTitle = title || DEFAULT_SEO.title;
  const resolvedDescription = description || DEFAULT_SEO.description;
  const resolvedKeywords = keywords || DEFAULT_SEO.keywords;
  const resolvedRobots = robots || DEFAULT_SEO.robots;
  const resolvedAuthor = author || DEFAULT_SEO.author;
  const resolvedThemeColor = themeColor || DEFAULT_SEO.themeColor;

  // Canonical — explicit prop wins; auto-build from SITE_URL otherwise
  const resolvedCanonical = canonical || `${SITE_URL}${pathname}`;

  // Open Graph
  const resolvedOgTitle = ogTitle || resolvedTitle;
  const resolvedOgDescription = ogDescription || resolvedDescription;
  const resolvedOgImage = ogImage || OG_IMAGE;
  const resolvedOgUrl = ogUrl || resolvedCanonical;
  const resolvedOgType = ogType || DEFAULT_SEO.ogType;

  // Twitter
  const resolvedTwitterCard = twitterCard || DEFAULT_SEO.twitterCard;
  const resolvedTwitterTitle = twitterTitle || resolvedTitle;
  const resolvedTwitterDescription = twitterDescription || resolvedDescription;
  const resolvedTwitterImage = twitterImage || resolvedOgImage;

  return (
    <Helmet>
      {/* ── Primary ──────────────────────────────────────────────────────── */}
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={resolvedKeywords} />
      <meta name="robots" content={resolvedRobots} />
      <meta name="author" content={resolvedAuthor} />
      <meta name="theme-color" content={resolvedThemeColor} />

      {/* ── Canonical ────────────────────────────────────────────────────── */}
      <link rel="canonical" href={resolvedCanonical} />

      {/* ── Open Graph (Facebook, WhatsApp, LinkedIn, etc.) ──────────────── */}
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDescription} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:url" content={resolvedOgUrl} />
      <meta property="og:type" content={resolvedOgType} />
      <meta property="og:site_name" content="Bill Everything" />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter / X Card ─────────────────────────────────────────────── */}
      <meta name="twitter:card" content={resolvedTwitterCard} />
      <meta name="twitter:title" content={resolvedTwitterTitle} />
      <meta name="twitter:description" content={resolvedTwitterDescription} />
      <meta name="twitter:image" content={resolvedTwitterImage} />
      <meta name="twitter:image:alt" content={resolvedTitle} />
    </Helmet>
  );
};

export default SEO;
