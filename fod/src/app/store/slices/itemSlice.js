import { createSlice } from "@reduxjs/toolkit";
import { emptyStore } from "../actions";

const initialState = [];

const itemSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setItems: (_, action) => action.payload,
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

export const { setItems, clearItems, deleteItem } = itemSlice.actions;
export default itemSlice.reducer;
