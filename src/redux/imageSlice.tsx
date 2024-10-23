// redux/imageSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_STORAGE_KEY = '@images';

interface ImageState {
  byDate: Record<string, string[]>;
}

const initialState: ImageState = {
  byDate: {},
};

const imageSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    addImage: (state, action: PayloadAction<{ uri: string; date: string }>) => {
      const { uri, date } = action.payload;
      if (!state.byDate[date]) {
        state.byDate[date] = [];
      }
      state.byDate[date].push(uri);
    },
    loadImages: (state, action: PayloadAction<Record<string, string[]>>) => {
      state.byDate = action.payload;
    },
    clearImages: (state) => {
      return { byDate: {} };
    },
  },
});

// AsyncStorage functions
export const saveImagesToStorage = async (images: Record<string, string[]>): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(images);
    await AsyncStorage.setItem(IMAGE_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save images:', e);
  }
};

export const loadImagesFromStorage = async (): Promise<Record<string, string[]>> => {
  try {
    const jsonValue = await AsyncStorage.getItem(IMAGE_STORAGE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : {}; 
  } catch (e) {
    console.error('Failed to load images:', e);
    return {}; 
  }
};

export const { addImage, loadImages, clearImages } = imageSlice.actions;
export default imageSlice.reducer;
