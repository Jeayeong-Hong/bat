import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { getOAuthUrl, loginWithOAuth } from '../../api/auth';
import { saveAuthData, clearAuthData } from '../../lib/storage';
import OAuthWebView from '../../components/OAuthWebView';

type Props = {
  onLoginSuccess: (email: string, nickname: string) => void;
  onNicknameRequired: (email: string, socialId: string) => void;
};

export default function LoginScreen({ onLoginSuccess, onNicknameRequired }: Props) {
  const [loading, setLoading] = useState(false);
  const [showOAuthWebView, setShowOAuthWebView] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<'kakao' | 'naver'>('kakao');

  const handleSocialLogin = async (provider: 'kakao' | 'naver') => {
    setOauthProvider(provider);
    setShowOAuthWebView(true);
  };

  const handleOAuthCode = async (code: string) => {
    try {
      setLoading(true);

      // 백엔드에서 직접 처리된 응답인지 확인
      if (code.startsWith('__DIRECT_RESPONSE__')) {
        const responseData = JSON.parse(code.replace('__DIRECT_RESPONSE__', ''));
        console.log('백엔드 직접 응답:', responseData);

        if (responseData.status === 'nickname_required') {
          // 닉네임 설정 필요
          console.log('닉네임 설정 필요:', responseData.email, responseData.social_id);
          setLoading(false); // 로딩 해제
          onNicknameRequired(responseData.email, responseData.social_id);
          return;
        } else if (responseData.status === 'success') {
          await saveAuthData(responseData.token, responseData.email, responseData.nickname);
          setLoading(false); // 로딩 해제
          onLoginSuccess(responseData.email, responseData.nickname);
          return;
        }
      }

      // 일반적인 code 처리
      const response = await loginWithOAuth(oauthProvider, code);

      console.log('OAuth 응답:', response);

      if (response.status === 'nickname_required') {
        // 닉네임 설정 필요
        console.log('닉네임 설정 필요:', response.email, response.social_id);
        setLoading(false); // 로딩 해제
        onNicknameRequired(response.email, response.social_id!);
      } else if (response.status === 'success') {
        // 로그인 성공 - 토큰 저장
        console.log('로그인 성공:', response.email, response.nickname);
        await saveAuthData(response.token!, response.email, response.nickname!);
        setLoading(false); // 로딩 해제
        onLoginSuccess(response.email, response.nickname!);
      } else {
        console.log('알 수 없는 응답 상태:', response);
        setLoading(false); // 로딩 해제
        Alert.alert('로그인 실패', '알 수 없는 응답입니다.');
      }
    } catch (error) {
      console.error(`${oauthProvider} 로그인 오류:`, error);
      setLoading(false); // 로딩 해제
      Alert.alert(
        '로그인 실패',
        error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5E82FF" />
        <Text style={styles.loadingText}>로그인 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/bat-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />

      <View style={styles.buttonGroup}>
        {/* 카카오 로그인 */}
        <Pressable
          style={[styles.button, styles.kakao]}
          onPress={() => handleSocialLogin('kakao')}
        >
          <Image
            source={require('../../../assets/kakao.png')}
            style={styles.kakaoIcon}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>카카오로 간편 로그인</Text>
        </Pressable>

        {/* 네이버 로그인 */}
        <Pressable
          style={[styles.button, styles.naver]}
          onPress={() => handleSocialLogin('naver')}
        >
          <Text style={styles.naverIcon}>N</Text>
          <Text style={[styles.buttonText, styles.naverText]}>
            네이버로 간편 로그인
          </Text>
        </Pressable>
      </View>

      {/* 디버그: 캐시 클리어 버튼 */}
      <Pressable
        style={styles.clearCacheButton}
        onPress={async () => {
          try {
            await clearAuthData();
            Alert.alert('완료', '로그인 정보가 삭제되었습니다.');
          } catch (error) {
            Alert.alert('오류', '캐시 삭제 실패');
          }
        }}
      >
        <Text style={styles.clearCacheText}>캐시 클리어 (문제 발생 시)</Text>
      </Pressable>

      {/* OAuth WebView */}
      <OAuthWebView
        visible={showOAuthWebView}
        provider={oauthProvider}
        oauthUrl={getOAuthUrl(oauthProvider)}
        onCode={handleOAuthCode}
        onClose={() => setShowOAuthWebView(false)}
      />
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
    width: 18,
    height: 18,
    marginRight: 8,
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5E82FF',
  },
  clearCacheButton: {
    marginTop: 20,
    padding: 10,
  },
  clearCacheText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'underline',
  },
});
