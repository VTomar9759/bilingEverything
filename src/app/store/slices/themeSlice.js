import { createSlice } from '@reduxjs/toolkit';
import { lightTheme, generatePrimaryPalette } from '../../utils/theme';
import { emptyStore } from '../actions';


const initialState = {
  theme: lightTheme,
  primaryColor: lightTheme.colors.primary,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    changePrimaryColor: (state, action) => {
      const color = action.payload;
      const palette = generatePrimaryPalette(color);
      state.primaryColor = color;
      state.theme.colors.primary = palette.primary;
      state.theme.colors.primaryLight = palette.primaryLight;
      state.theme.colors.primaryDark = palette.primaryDark;
      state.theme.colors.primary50 = palette.primary50;
      state.theme.colors.primary100 = palette.primary100;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(emptyStore, () => {
      return initialState;
    });
  },
});

export const { changePrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;
