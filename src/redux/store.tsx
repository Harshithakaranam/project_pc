import { configureStore } from '@reduxjs/toolkit';
import imageReducer, { loadImages, loadImagesFromStorage } from './imageSlice';
import authReducer, { loadUsersFromStorage } from './authSlice';

const store = configureStore({
  reducer: {
    images: imageReducer,
    auth: authReducer,
  },
});

export interface RootState {
  images: {
    byDate: Record<string, unknown>; 
  };
  auth: {
    isLoggedIn: boolean;
    user: null | {
      name: string;
      email: string;
    };
    users: Array<{
      name: string;
      email: string;
      password: string;
      phoneNumber: string;
    }>;
  };
}

export type AppDispatch = typeof store.dispatch;

const loadInitialData = async () => {
  try {
    const images = await loadImagesFromStorage();
    store.dispatch(loadImages(images));
    await store.dispatch(loadUsersFromStorage());
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }
};

loadInitialData();

export default store;
