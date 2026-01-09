import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./modules/user";
export default configureStore({
  reducer: {
    UserReducer,
  },
});
