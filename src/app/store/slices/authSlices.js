import { createSlice } from "@reduxjs/toolkit";
import { emptyStore } from "../actions";


const initialisation = {
  token: null,
  refreshToken: null,
  org_id: null,
  gst_number: null,
  gst_status: null,
  created_by: null,
  userData: null,
  show_customer_details: false,
  user_subscription: {
    subscription: {
      is_active: false,
      status: "expired", // active, expired, trial, cancelled

      subscription_id: "SUB-10001",
      user_id: "USER-10001",
      organization_id: "ORG-10001",

      // Plan details
      plan_id: 2,
      plan_name: "3 Month Plan",
      plan_key: "three_month",
      plan_price: 1500,
      currency: "INR",
      billing_cycle: "3 months",

      // Subscription dates
      purchase_date: "2026-07-15T10:00:00.000Z",
      start_date: "2026-07-15T10:00:00.000Z",
      expiry_date: "2026-10-15T10:00:00.000Z",
      next_billing_date: null,
      cancelled_at: null,

      // Trial details
      is_trial: false,
      trial_start_date: null,
      trial_end_date: null,
      trial_days: 0,

      // Payment details
      payment_status: "paid", // pending, paid, failed, refunded
      payment_method: "UPI",
      transaction_id: "TXN-DEMO-10001",
      payment_date: "2026-07-15T10:05:00.000Z",

      // Renewal details
      auto_renew: false,
      renewal_count: 0,
      previous_subscription_id: null,

      // Access and limits
    }
  }
}

const authSlice = createSlice({
  name: "auth_details",
  initialState: initialisation,
  reducers: {
    logingAuth: (state, action) => {
      state.userData = action?.payload?.userData;
      state.token = action?.payload.token;
      state.refreshToken = action?.payload?.refreshToken;
      state.org_id = action?.payload?.org_id;
      state.gst_number = action?.payload?.userData?.gst_number;
      state.gst_status = action?.payload?.userData?.gst_status;
      state.created_by = action?.payload?.userData?.created_by;
    },
    udpateProfile: (state, action) => {
      state.userData = {
        ...state.userData,
        ...action?.payload
      };
    },
    setShowCustomerDetails: (state, action) => {
      if (typeof action?.payload === "boolean") {
        state.show_customer_details = action.payload;
      } else {
        state.show_customer_details = !state.show_customer_details;
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(emptyStore, () => {
      return initialisation;
    });
  },
});

export const { logingAuth, udpateProfile, setShowCustomerDetails } = authSlice.actions;
export default authSlice.reducer;
