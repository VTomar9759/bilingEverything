import { createSlice } from "@reduxjs/toolkit";
import { emptyStore } from "../actions";

const initialState = [];

const itemsCategorySlices = createSlice({
  name: "itemsCategorySlices",
  initialState,
  reducers: {
    setCategories: (_, action) => {
      return [...new Set(action.payload)];
    },
    clearCategories: () => initialState,
  },
  extraReducers(builder) {
    builder.addCase(emptyStore, () => {
      return initialState;
    });
  },
});

export const { setCategories, clearCategories } = itemsCategorySlices.actions;
export default itemsCategorySlices.reducer;
