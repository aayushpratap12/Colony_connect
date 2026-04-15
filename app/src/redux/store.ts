import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { mmkvStorageAdapter } from '@services/storage/mmkv';

const persistConfig = {
  key: 'root',
  storage: mmkvStorageAdapter,
  whitelist: ['auth'], // only persist auth — API cache handled separately
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
