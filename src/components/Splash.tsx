import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Dimensions } from 'react-native';

type Props = {
  onDone?: () => void;
  duration?: number;
};

export default function Splash({ onDone, duration = 1500 }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onDone?.());
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDone, opacity]);

  const { width } = Dimensions.get('window');
  // 패드 기준 비율 유지용 – 화면 크기에 따라 살짝 조정
  const characterSize = Math.min(260, width * 0.35);
  const logoWidth = Math.min(200, width * 0.28);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.inner}>
        <Image
          source={require('../../assets/bat-character.png')}
          style={{ width: characterSize, height: characterSize }}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/bat-logo.png')}
          style={{ width: logoWidth, height: 60, marginTop: 24 }}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // 시안과 같은 연한 회색 배경
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    // 위/아래 여백은 디자인처럼 위쪽이 조금 더 많이 비어 보이도록
    marginTop: -40,
  },
});
