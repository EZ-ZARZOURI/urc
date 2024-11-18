import { configureStore } from "@reduxjs/toolkit";
import messagingReducer from "./messagingSlice";

const store = configureStore({
  reducer: {
    messaging: messagingReducer, // Inclut le reducer de messagerie
  },
});

export default store;
