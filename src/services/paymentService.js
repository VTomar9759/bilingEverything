import { supabase } from '../lib/supabaseClients';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function callFunction(name, options = {}) {
  const token = await getAuthToken();
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Function ${name} failed`);
  return data;
}

export const createSubscriptionOrder = (planId) =>
  callFunction('create-subscription-order', { method: 'POST', body: { plan_id: planId } });

export const verifySubscriptionPayment = (payload) =>
  callFunction('verify-subscription-payment', { method: 'POST', body: payload });

export const getOrgSubscription = (includeHistory = false) =>
  callFunction(`get-org-subscription${includeHistory ? '?include_history=true' : ''}`);

export const cancelPendingSubscription = (subscriptionId) =>
  callFunction('cancel-pending-subscription', { method: 'POST', body: { subscription_id: subscriptionId } });
