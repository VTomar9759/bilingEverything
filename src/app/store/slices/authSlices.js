import { createSlice } from "@reduxjs/toolkit";
import { emptyStore } from "../actions";

const initialisation = {
  token: null,
  refreshToken: null,
  org_id: null,
  userData: null,
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
    },
    udpateProfile: (state, action) => {
      state.userData = {
        ...state.userData,
        ...action?.payload
      };

    },
  },
  extraReducers(builder) {
    builder.addCase(emptyStore, () => {
      return initialisation;
    });
  },
});

export const { logingAuth, udpateProfile } = authSlice.actions;
export default authSlice.reducer;
