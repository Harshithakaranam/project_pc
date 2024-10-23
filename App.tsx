import React, { useEffect } from 'react';
import { AppRegistry, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './src/redux/store';
import FloatingActionButton from './src/components/FloatingActionButton';
import LoginScreen from './src/components/LoginScreen';
import { name as appName } from './app.json';
import Toast from 'react-native-toast-message';
import { loadUsersFromStorage } from './src/redux/authSlice';
import { RootState, AppDispatch } from './src/redux/store';
//import ImageGallery from './src/components/ImageGallery';
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { FlatList, StyleSheet, Dimensions, Image, Animated, useWindowDimensions, Modal, TouchableOpacity, Text } from 'react-native';
 
 
 
const AppContent: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
 
  useEffect(() => {
    dispatch(loadUsersFromStorage());
  }, [dispatch]);
 
  return (
    <View style={{ flex: 1 }}>
      {isLoggedIn ? <FloatingActionButton /> : <LoginScreen />}
    </View>
  );
};
 
const App: React.FC = () => {
 
 
 
 
  return (
    <GestureHandlerRootView>
 
      <Provider store={store}>
        <AppContent />
        <Toast />
        {/* <ImageGallery/> */}
      </Provider>
    </GestureHandlerRootView>
 
 
  );
};
 
AppRegistry.registerComponent(appName, () => App);
 
export default App;
 