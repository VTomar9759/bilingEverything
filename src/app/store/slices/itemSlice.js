import { createSlice } from "@reduxjs/toolkit";
import { emptyStore } from "../actions";

const initialState = [];

const itemSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setItems: (_, action) => action.payload,
    updateItemAction: (state, action) => {
      const { id, status } = action.payload;
      const idx = state.findIndex((i) => i.id === id);
      if (idx >= 0) {
        state[idx] = { ...state[idx], status };
      }
    },
    clearItems: () => initialState,
    deleteItem: (state, action) =>
      state.filter((item) => item.id !== action.payload),
  },
  extraReducers(builder) {
    builder.addCase(emptyStore, () => {
      return initialState;
    });
  },
});

export const { setItems, clearItems, deleteItem, updateItemAction } = itemSlice.actions;
export default itemSlice.reducer;
