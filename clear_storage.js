// 로그인 정보 초기화 스크립트
// React Native 앱 개발 중 저장된 인증 정보를 삭제하려면 이 스크립트를 실행하세요

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearAuthData() {
    try {
        await AsyncStorage.multiRemove([
            '@bat_auth_token',
            '@bat_user_email',
            '@bat_user_nickname',
        ]);
        console.log('✅ 인증 정보가 초기화되었습니다.');
        console.log('앱을 재시작하면 로그인 화면이 나타납니다.');
    } catch (error) {
        console.error('❌ 인증 정보 삭제 실패:', error);
    }
}

clearAuthData();
