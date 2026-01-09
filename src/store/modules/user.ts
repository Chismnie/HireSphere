import { createSlice } from "@reduxjs/toolkit";
const UserSlice = createSlice({
  name: "user",
  initialState: {
    id: "",
    token: "",
  },
  reducers: {
    changeId: (state, action) => {
      state.id = action.payload;
    },
    changeToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
  },
});
export const { changeId, changeToken } = UserSlice.actions;
export default UserSlice.reducer;
