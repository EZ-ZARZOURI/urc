import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import messagingReducer from "./messagingSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    reducer: { messaging: messagingReducer },
  },
});

export default store;
