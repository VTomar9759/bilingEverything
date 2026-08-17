import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlices";
import itemSlice from "./slices/itemSlice";
import themeSlice from "./slices/themeSlice";

const rootReducer = combineReducers({
    authSlice,
    itemSlice,
    themeSlice
});

export default rootReducer;


