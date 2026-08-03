import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlices";
import itemSlice from "./slices/itemSlice";
import themeSlice from "./slices/themeSlice";
import itemsCategorySlices from "./slices/itemsCategorySlices";

const rootReducer = combineReducers({
    authSlice,
    itemSlice,
    themeSlice,
    itemsCategorySlices
});

export default rootReducer;


