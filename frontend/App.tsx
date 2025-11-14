import React, { useState } from 'react';
import { View } from 'react-native';
import Splash from './src/components/Splash';
import LoginScreen from './src/screens/auth/LoginScreen';
import NicknameScreen from './src/screens/auth/NicknameScreen';
import DiagnosisScreen from './src/screens/diagnosis/DiagnosisScreen';
import TypeResultScreen from './src/screens/diagnosis/TypeResultScreen';
import HomeScreen from './src/screens/home/HomeScreen';

type Step = 'splash' | 'login' | 'nickname' | 'diagnosis' | 'result' | 'home';

export default function App() {
  const [step, setStep] = useState<Step>('splash');
  const [nickname, setNickname] = useState('');
  const [typeLabel, setTypeLabel] = useState('');

  return (
    <View style={{ flex: 1 }}>
      {step === 'splash' && (
        <Splash
          duration={1500}
          onDone={() => setStep('login')}
        />
      )}

      {step === 'login' && (
        <LoginScreen
          onSocialLogin={() => setStep('nickname')}
        />
      )}

      {step === 'nickname' && (
        <NicknameScreen
          onConfirm={(name) => {
            setNickname(name);
            setStep('diagnosis');
          }}
        />
      )}

      {step === 'diagnosis' && (
        <DiagnosisScreen
          onFinishTest={() => {
            setTypeLabel('분석형 학습자');
            setStep('result');
          }}
        />
      )}
      {step === 'result' && (
        <TypeResultScreen
          nickname={nickname}
          typeLabel={typeLabel}
          onGoHome={() => setStep('home')}
        />
      )}

      {step === 'home' && (
        <HomeScreen
          nickname={nickname}
          typeLabel={typeLabel}
        />
      )}

    </View>
  );
}
