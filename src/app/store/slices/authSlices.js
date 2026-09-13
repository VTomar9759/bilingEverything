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
};

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
