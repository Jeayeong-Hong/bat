import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../components/Splash';
import LoginScreen from '../screens/auth/LoginScreen';
import MainScreen from '../screens/MainScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreenRoute} />
      <Stack.Screen name="Login" component={LoginRoute} />
      <Stack.Screen name="Main" component={MainScreen} />
    </Stack.Navigator>
  );
}

// 스플래시 라우트: 1.5초 후 Login으로 이동
function SplashScreenRoute({ navigation }: any) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Login'), 1500);
    return () => clearTimeout(t);
  }, [navigation]);

  return <Splash onDone={() => navigation.replace('Login')} duration={1500} />;
}

// 로그인 라우트: 임시 버튼 → 메인 이동
function LoginRoute({ navigation }: any) {
  return <LoginScreen onLogin={() => navigation.replace('Main')} />;
}
