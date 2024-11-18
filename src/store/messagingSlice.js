import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  currentConversation: {
    userId: null,  // L'ID de l'utilisateur avec lequel vous discutez
    messages: [],  // Initialisez les messages comme un tableau vide
  },
};

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    setUsers(state, action) {
      state.users = action.payload;
    },
    setSelectedConversation(state, action) {
      const userId = action.payload;
      state.currentConversation = {
        userId: userId,
        messages: [],  // Initialisez les messages comme un tableau vide lors de la sélection d'une conversation
      };
    },
    addMessageToConversation(state, action) {
      if (state.currentConversation) {
        state.currentConversation.messages.push(action.payload);
      }
    },
  },
});

export const { setUsers, setSelectedConversation, addMessageToConversation } = messagingSlice.actions;

export const selectUsers = (state) => state.messaging.users;
export const selectCurrentConversation = (state) => state.messaging.currentConversation;

export default messagingSlice.reducer;
