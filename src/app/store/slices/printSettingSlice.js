import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { emptyStore } from "../actions";
import {
  getPrintSettings,
  savePrintSettings,
  DEFAULT_PRINT_SETTINGS,
} from "../../../services/printSettingsService";

// Async thunk: fetch print settings from Supabase
export const fetchPrintSettings = createAsyncThunk(
  "printSettings/fetch",
  async (orgId, { rejectWithValue }) => {
    try {
      const data = await getPrintSettings(orgId);
      return data || { ...DEFAULT_PRINT_SETTINGS, org_id: orgId };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch print settings");
    }
  }
);

// Async thunk: save/update print settings to Supabase
export const updatePrintSettings = createAsyncThunk(
  "printSettings/update",
  async ({ orgId, settingsData, createdBy }, { rejectWithValue }) => {
    try {
      const data = await savePrintSettings(orgId, settingsData, createdBy);
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to save print settings");
    }
  }
);

const initialState = {
  settings: { ...DEFAULT_PRINT_SETTINGS },
  loading: false,
  saving: false,
  error: null,
  fetched: false,
};

const printSettingSlice = createSlice({
  name: "printSettings",
  initialState,
  reducers: {
    // Optimistic local update (used by settings form to keep preview in sync)
    setPrintSettingsLocal: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchPrintSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrintSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = { ...DEFAULT_PRINT_SETTINGS, ...action.payload };
        state.fetched = true;
      })
      .addCase(fetchPrintSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updatePrintSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updatePrintSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.settings = { ...DEFAULT_PRINT_SETTINGS, ...action.payload };
      })
      .addCase(updatePrintSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });

    // Reset on logout
    builder.addCase(emptyStore, () => initialState);
  },
});

export const { setPrintSettingsLocal } = printSettingSlice.actions;

// Selectors
export const selectPrintSettings = (state) =>
  state.printSettingSlice?.settings || DEFAULT_PRINT_SETTINGS;
export const selectPrintSettingsLoading = (state) =>
  state.printSettingSlice?.loading || false;
export const selectPrintSettingsSaving = (state) =>
  state.printSettingSlice?.saving || false;
export const selectPrintSettingsFetched = (state) =>
  state.printSettingSlice?.fetched || false;

export default printSettingSlice.reducer;
