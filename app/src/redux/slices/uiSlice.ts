import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isOnline: boolean;
  pendingActionsCount: number;
}

const initialState: UiState = {
  isOnline: true,
  pendingActionsCount: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setPendingActionsCount: (state, action: PayloadAction<number>) => {
      state.pendingActionsCount = action.payload;
    },
  },
});

export const { setOnlineStatus, setPendingActionsCount } = uiSlice.actions;
export default uiSlice.reducer;
