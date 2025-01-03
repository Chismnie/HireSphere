import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./modules/user";
import UploadReducer from "./modules/upload";

const store = configureStore({
  reducer: {
    UserReducer,
    UploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
