import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch } from './store'; 

interface User {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  users: User[];
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  users: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
      AsyncStorage.setItem('users', JSON.stringify(state.users));
    },
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      const { email, password } = action.payload;
      const foundUser = state.users.find(
        (user) => user.email === email && user.password === password
      );
      if (foundUser) {
        state.isLoggedIn = true;
        state.user = foundUser;
        AsyncStorage.setItem('isLoggedIn', 'true'); 
      } else {
        state.isLoggedIn = false;
        state.user = null;
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      AsyncStorage.setItem('isLoggedIn', 'false'); 
    },
    loadUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setLoginState: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
  },
});

export const { register, login, logout, loadUsers, setLoginState } = authSlice.actions;

export const loadUsersFromStorage = () => async (dispatch: AppDispatch) => { 
  try {
    const users = await AsyncStorage.getItem('users');
    if (users) {
      dispatch(loadUsers(JSON.parse(users)));
    }
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      dispatch(setLoginState(true));
    }
  } catch (error) {
    console.error('Failed to load users from storage:', error);
  }
};

export default authSlice.reducer;
