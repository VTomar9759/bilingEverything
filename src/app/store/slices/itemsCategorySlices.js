import { createSlice } from "@reduxjs/toolkit";
import { emptyStore } from "../actions";

const initialState = [];

const itemsCategorySlices = createSlice({
  name: "itemsCategorySlices",
  initialState,
  reducers: {
    setCategories: (_, action) => action.payload || [],
    addCategoryAction: (state, action) => {
      const payload = action.payload;
      if (payload) {
        state.push(payload);
      }
    },
    updateCategoryAction: (state, action) => {
      const payload = action.payload;
      if (!payload) return;
      const { id, name } =
        typeof payload === "object" ? payload : { id: payload, name: payload };
      const idx = state.findIndex((item) =>
        typeof item === "object" && item !== null
          ? item.id === id || item.name === name
          : item === name || item === id
      );
      if (idx >= 0) {
        if (typeof state[idx] === "object" && state[idx] !== null) {
          state[idx] = { ...state[idx], ...payload };
        } else {
          state[idx] = payload;
        }
      }
    },
    deleteCategoryAction: (state, action) => {
      const target = action.payload;
      return state.filter((item) => {
        if (typeof item === "object" && item !== null) {
          return item.id !== target && item.name !== target;
        }
        return item !== target;
      });
    },
    clearCategories: () => initialState,
  },
  extraReducers(builder) {
    builder.addCase(emptyStore, () => {
      return initialState;
    });
  },
});

export const {
  setCategories,
  addCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  clearCategories,
} = itemsCategorySlices.actions;

export default itemsCategorySlices.reducer;


