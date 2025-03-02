import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedText: '',
  history: [],
};

const textSlice = createSlice({
  name: 'text',
  initialState,
  reducers: {
    setSelectedText: (state, action) => {
      if (action.payload && action.payload.trim() !== '') {
        state.selectedText = action.payload;
        // Add to history if it's not empty and not a duplicate of the last entry
        if (state.history.length === 0 || state.history[state.history.length - 1] !== action.payload) {
          state.history.push(action.payload);
          // Keep only the last 10 items
          if (state.history.length > 10) {
            state.history.shift();
          }
        }
      }
    },
    clearSelectedText: (state) => {
      state.selectedText = '';
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const { setSelectedText, clearSelectedText, clearHistory } = textSlice.actions;
export default textSlice.reducer;