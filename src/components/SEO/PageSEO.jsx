import { useLocation } from "react-router-dom";
import { resolveSEO } from "../../config/seo";
import SEO from "./SEO";

/**
 * PageSEO — Auto-resolves SEO metadata from the central config.
 *
 * Reads the current pathname, looks it up in PAGE_SEO, and passes all
 * resolved values to <SEO />.  Any prop you pass here will override the
 * config value, enabling easy dynamic overrides at the page level.
 *
 * Usage (no props needed — uses config automatically):
 *   <PageSEO />
 *
 * Usage (override specific values dynamically):
 *   <PageSEO title={`Edit Order #${orderId}`} />
 */
const PageSEO = (overrides) => {
  const { pathname } = useLocation();
  const config = resolveSEO(pathname);

  // Merge config with any explicit overrides passed as props
  const merged = { ...config, ...overrides };

  return (
    <SEO
      title={merged.title}
      description={merged.description}
      keywords={merged.keywords}
      robots={merged.robots}
      author={merged.author}
      themeColor={merged.themeColor}
      ogTitle={merged.ogTitle}
      ogDescription={merged.ogDescription}
      ogImage={merged.ogImage}
      ogUrl={merged.ogUrl}
      ogType={merged.ogType}
      twitterCard={merged.twitterCard}
      twitterTitle={merged.twitterTitle}
      twitterDescription={merged.twitterDescription}
      twitterImage={merged.twitterImage}
    />
  );
};

export default PageSEO;
