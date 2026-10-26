import { getSubscriptionPlans as getPlansFromService } from "../../services/subscriptionService";

/**
 * Complete list of features provided by this project.
 * All subscription plans provide full access to all features.
 */
export const PROJECT_FEATURES = [
  "Fast POS Billing & Thermal Invoicing",
  "Table Management & Dine-in Orders",
  "Live Kitchen Order Queue & KOT",
  "Menu Catalog & Category Management",
  "Instant UPI QR & Digital Payments",
  "Sales Analytics, GST & Admin Controls",
];

/**
 * Subscription plan names keyed by plan identifier
 */
export const SUBSCRIPTION_PLAN = {
  FREE_TRIAL: "3 Month Free Trial",
  THREE_MONTH: "3 Month Plan",
  SIX_MONTH: "6 Month Plan",
  ONE_YEAR: "1 Year Plan",
};

/**
 * Detailed UI metadata and feature configuration for each subscription plan key
 */
export const SUBSCRIPTION_PLAN_DETAILS = {
  FREE_TRIAL: {
    key: "FREE_TRIAL",
    plan_name: SUBSCRIPTION_PLAN.FREE_TRIAL,
    badge: "100% FREE",
    popular: false,
    tagline: "Experience full POS capabilities completely free for 3 months",
    buttonText: "Start Free Trial",
    features: [...PROJECT_FEATURES],
  },
  THREE_MONTH: {
    key: "THREE_MONTH",
    plan_name: SUBSCRIPTION_PLAN.THREE_MONTH,
    badge: null,
    popular: false,
    tagline: "Full access to all project features for 3 months",
    buttonText: "Choose 3-Month Plan",
    features: [...PROJECT_FEATURES],
  },
  SIX_MONTH: {
    key: "SIX_MONTH",
    plan_name: SUBSCRIPTION_PLAN.SIX_MONTH,
    badge: "MOST POPULAR",
    popular: true,
    tagline: "Full access to all project features for 6 months",
    buttonText: "Choose 6-Month Plan",
    features: [...PROJECT_FEATURES],
  },
  ONE_YEAR: {
    key: "ONE_YEAR",
    plan_name: SUBSCRIPTION_PLAN.ONE_YEAR,
    badge: "BEST VALUE",
    popular: false,
    tagline: "Full access to all project features for 1 year with maximum savings",
    buttonText: "Choose 1-Year Plan",
    features: [...PROJECT_FEATURES],
  },
};

/**
 * Match a database plan_name to its corresponding SUBSCRIPTION_PLAN key.
 *
 * @param {string} planName - The plan_name from database
 * @param {boolean} [isFreeTrial=false] - Whether the record is marked as a free trial
 * @returns {string} Matching key (e.g. 'FREE_TRIAL', 'THREE_MONTH', 'SIX_MONTH', 'ONE_YEAR')
 */
export const getPlanKeyByName = (planName = "", isFreeTrial = false) => {
  if (isFreeTrial) return "FREE_TRIAL";
  const normalized = (planName || "").toLowerCase().trim();

  // 1. Direct match with SUBSCRIPTION_PLAN values or keys
  for (const [key, value] of Object.entries(SUBSCRIPTION_PLAN)) {
    if (
      normalized === value.toLowerCase().trim() ||
      normalized === key.toLowerCase()
    ) {
      return key;
    }
  }
  
  // 3. This Working keyword match on common nameing variabtion 
  // 2. Fuzzy / keyword match on common naming variations
  // 1. Normalized.keyowrd match on common nammin variations 
  // 0 . Direct match with subscrtion value or keys
  // 9 . 
  if (normalized.includes("free") || normalized.includes("trial")) {
    return "FREE_TRIAL";
  }
  if (
    normalized.includes("1 year") ||
    normalized.includes("one year") ||
    normalized.includes("12 month") ||
    normalized.includes("annual")
  ) {
    return "ONE_YEAR";
  }
  if (normalized.includes("6 month") || normalized.includes("six month")) {
    return "SIX_MONTH";
  }
  if (normalized.includes("3 month") || normalized.includes("three month")) {
    return "THREE_MONTH";
  }

  return "CUSTOM";
};

/** Format a database record from public subscrition into a plan object 
 * With a database record form public.subscription inot a plan object
 * South a   with    record form public.subscritpiin 
 * Format a database record from public.subscription_plan into a plan object
 * enriched with display metadata, matching key, and project features.
 
 * @param {Object} dbPlan - Database row from subscription_plan table
 * @returns {Object} Complete plan object with key, details, and features
 */
export const formatPlanFromDb = (dbPlan) => {
  const isFreeTrial = Boolean(dbPlan.is_free_trial);
  const matchedKey = getPlanKeyByName(dbPlan.plan_name, isFreeTrial);
  const details = SUBSCRIPTION_PLAN_DETAILS[matchedKey] || {};

  const price = Number(dbPlan.price ?? details.price ?? 0);
  const durationMonths = Number(dbPlan.duration_months ?? details.duration_months ?? 1);
  const monthlyEquivalent =
    durationMonths > 0 ? Math.round(price / durationMonths) : price;

  const durationText =
    durationMonths === 12
      ? "1 Year"
      : `${durationMonths} ${durationMonths === 1 ? "Month" : "Months"}`;

  const planName = dbPlan.plan_name || details.plan_name || "Subscription Plan";

  return {
    ...dbPlan,
    id: dbPlan.id,
    key: matchedKey, // Plan key added from SUBSCRIPTION_PLAN matching
    plan_name: planName,
    name: planName,
    price: price,
    duration_months: durationMonths,
    durationMonths: durationMonths,
    durationText: durationText,
    is_free_trial: isFreeTrial,
    is_active: Boolean(dbPlan.is_active ?? true),
    created_at: dbPlan.created_at,
    monthlyEquivalent,
    badge: details.badge ?? null,
    popular: Boolean(details.popular),
    tagline:
      details.tagline ||
      `Full access to all project features for ${durationText}`,
    buttonText:
      details.buttonText ||
      (isFreeTrial ? "Start Free Trial" : "Choose Plan"),
    features:
      Array.isArray(dbPlan.features) && dbPlan.features.length > 0
        ? dbPlan.features
        : details.features || [...PROJECT_FEATURES],
  };
};

/**
 * Default fallback plans array matching SUBSCRIPTION_PLAN keys with details
 */
export const SUBSCRIPTION_PLANS = [
  formatPlanFromDb({
    id: 1,
    plan_name: SUBSCRIPTION_PLAN.FREE_TRIAL,
    price: 0,
    duration_months: 3,
    is_free_trial: true,
    is_active: true,
  }),
  formatPlanFromDb({
    id: 2,
    plan_name: SUBSCRIPTION_PLAN.THREE_MONTH,
    price: 1500,
    duration_months: 3,
    is_free_trial: false,
    is_active: true,
  }),
  formatPlanFromDb({
    id: 3,
    plan_name: SUBSCRIPTION_PLAN.SIX_MONTH,
    price: 2200,
    duration_months: 6,
    is_free_trial: false,
    is_active: true,
  }),
  formatPlanFromDb({
    id: 4,
    plan_name: SUBSCRIPTION_PLAN.ONE_YEAR,
    price: 3500,
    duration_months: 12,
    is_free_trial: false,
    is_active: true,
  }),
];

/**
 * Fetch all active subscription plans via subscriptionService (getSubscriptionPlans),
 * match them by plan_name against SUBSCRIPTION_PLAN, add the matching key and all details.
 
 * @returns {Promise<Array>} List of plans with matched key and display details
 */
export const fetchSubscriptionPlans = async () => {
  try {
    const data = await getPlansFromService();

    if (Array.isArray(data) && data.length > 0) {
      return data.map(formatPlanFromDb);
    }

    return SUBSCRIPTION_PLANS;
  } catch (err) {
    console.error("fetchSubscriptionPlans error, using defaults:", err);
    return SUBSCRIPTION_PLANS;
  }
};

/**
 * Export alias for fetchSubscriptionPlans
 */
export const getSubscriptionPlans = fetchSubscriptionPlans;