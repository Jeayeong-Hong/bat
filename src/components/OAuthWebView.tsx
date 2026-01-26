// src/components/OAuthWebView.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Pressable, Text, ActivityIndicator, Platform } from 'react-native';
import { scale, fontScale } from '../lib/layout';

type Props = {
    visible: boolean;
    provider: 'kakao' | 'naver';
    oauthUrl: string;
    onCode: (code: string) => void;
    onClose: () => void;
};

export default function OAuthWebView({ visible, provider, oauthUrl, onCode, onClose }: Props) {
    const [loading, setLoading] = useState(true);

    // 웹 환경에서는 팝업 윈도우 사용
    useEffect(() => {
        if (!visible || Platform.OS !== 'web') return;

        // postMessage 리스너 설정
        const handleMessage = (event: MessageEvent) => {
            // 보안: origin 체크는 프로덕션에서 필수
            if (event.data && event.data.type === 'oauth-code') {
                console.log('OAuth code 수신:', event.data.code);
                onCode(event.data.code);
                onClose();
            } else if (event.data && event.data.type === 'oauth-success') {
                // 백엔드에서 직접 처리된 경우 - 응답 데이터를 그대로 사용
                console.log('OAuth 성공 응답 수신:', event.data.data);
                // 모든 응답을 __DIRECT_RESPONSE__ 형식으로 전달
                if (event.data.data) {
                    onCode(`__DIRECT_RESPONSE__${JSON.stringify(event.data.data)}`);
                    onClose();
                }
            } else if (event.data && event.data.type === 'oauth-error') {
                console.error('OAuth 에러:', event.data.error);
                alert('로그인 중 오류가 발생했습니다: ' + event.data.error);
                onClose();
            }
        };

        window.addEventListener('message', handleMessage);

        // 웹 환경: 새 창으로 OAuth 페이지 열기
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            oauthUrl,
            'oauth',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // 팝업이 닫혔는지 주기적으로 확인
        const interval = setInterval(() => {
            if (popup && popup.closed) {
                clearInterval(interval);
                // 사용자가 팝업을 그냥 닫은 경우
                onClose();
            }
        }, 500);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearInterval(interval);
            if (popup && !popup.closed) {
                popup.close();
            }
        };
    }, [visible, oauthUrl, onCode, onClose]);

    // 웹 환경에서는 빈 모달만 표시 (실제 OAuth는 팝업에서)
    if (Platform.OS === 'web') {
        return (
            <Modal visible={visible} transparent animationType="fade">
                <View style={styles.webOverlay}>
                    <View style={styles.webModal}>
                        <ActivityIndicator size="large" color="#5E82FF" />
                        <Text style={styles.webText}>
                            {provider === 'kakao' ? '카카오' : '네이버'} 로그인 진행 중...
                        </Text>
                        <Text style={styles.webSubText}>팝업 창에서 로그인을 완료해주세요</Text>
                        <Pressable style={styles.webCancelButton} onPress={onClose}>
                            <Text style={styles.webCancelText}>취소</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        );
    }

    // 모바일 환경: WebView 사용
    const WebView = require('react-native-webview').WebView;

    const handleNavigationStateChange = (navState: any) => {
        const { url } = navState;

        // redirect_uri로 돌아왔을 때 code 추출
        if (url.includes('/auth/') && url.includes('/mobile')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const code = urlParams.get('code');

            if (code) {
                onCode(code);
                onClose();
            }
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {provider === 'kakao' ? '카카오' : '네이버'} 로그인
                    </Text>
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>✕</Text>
                    </Pressable>
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5E82FF" />
                        <Text style={styles.loadingText}>로딩 중...</Text>
                    </View>
                )}

                <WebView
                    source={{ uri: oauthUrl }}
                    onNavigationStateChange={handleNavigationStateChange}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    style={styles.webview}
                    javaScriptEnabled
                    domStorageEnabled
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: scale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    headerTitle: {
        fontSize: fontScale(18),
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: scale(8),
    },
    closeText: {
        fontSize: fontScale(24),
        color: '#6B7280',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        zIndex: 1,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: scale(12),
        fontSize: fontScale(14),
        color: '#6B7280',
    },
    // 웹 환경용 스타일
    webOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    webModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        padding: scale(32),
        alignItems: 'center',
        minWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    webText: {
        marginTop: scale(16),
        fontSize: fontScale(18),
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    webSubText: {
        marginTop: scale(8),
        fontSize: fontScale(14),
        color: '#6B7280',
        textAlign: 'center',
    },
    webCancelButton: {
        marginTop: scale(24),
        paddingVertical: scale(12),
        paddingHorizontal: scale(24),
        backgroundColor: '#E5E7EB',
        borderRadius: scale(8),
    },
    webCancelText: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#374151',
    },
});
