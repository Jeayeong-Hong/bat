import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';

type Props = {
  onSocialLogin: () => void; // 카카오/네이버 아무거나 누르면 다음으로
};

export default function LoginScreen({ onSocialLogin }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/bat-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />


      <View style={styles.buttonGroup}>
        <Pressable style={[styles.button, styles.kakao]} onPress={onSocialLogin}>
          <Text style={styles.kakaoIcon}>💬</Text>
          <Text style={styles.buttonText}>카카오로 간편 로그인</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.naver]} onPress={onSocialLogin}>
          <Text style={styles.naverIcon}>N</Text>
          <Text style={[styles.buttonText, styles.naverText]}>
            네이버로 간편 로그인
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const BG = '#F3F4F6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  logo: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#5E82FF',
  },
  buttonGroup: {
    alignItems: 'center', // 가운데 정렬
    gap: 16,
  },
  button: {
    width: 309,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    elevation: 2,
  },

  kakao: {
    backgroundColor: '#FEE500',
  },
  naver: {
    backgroundColor: '#03C75A',
  },
  kakaoIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  naverIcon: {
    marginRight: 8,
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  naverText: {
    color: '#fff',
  },
  logoImage: {
  width: 160,     // 필요하면 조정 가능
  height: 70,
  marginBottom: 40,
},

});
