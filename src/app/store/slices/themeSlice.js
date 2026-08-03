import { createSlice } from '@reduxjs/toolkit';
import { lightTheme, darkTheme } from '../../utils/theme';
import { emptyStore } from '../actions';


const initialState = {
  currentTheme: 'light',
  theme: lightTheme,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      if (state.currentTheme === 'light') {
        state.currentTheme = 'dark';
        state.theme = darkTheme;
      } else {
        state.currentTheme = 'light';
        state.theme = lightTheme;
      }
    },
    setTheme: (state, action) => {
      const themeName = action.payload;
      if (themeName === 'light') {
        state.currentTheme = 'light';
        state.theme = lightTheme;
      } else if (themeName === 'dark') {
        state.currentTheme = 'dark';
        state.theme = darkTheme;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(emptyStore, () => {
      return initialState;
    });
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
