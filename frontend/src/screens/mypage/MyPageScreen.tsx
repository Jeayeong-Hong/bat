// src/screens/mypage/MyPageScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    ScrollView,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';

type Screen = 'home' | 'league' | 'alarm' | 'mypage';

type Props = {
    nickname: string;
    typeLabel: string;
    level: number;
    totalStudyCount: number;
    continuousDays: number;
    onNavigate: (screen: Screen) => void;
};

// 홈 화면에서 쓰는 것과 같은 유형별 캐릭터 매핑 함수
const getCharacterSourceByType = (typeLabel: string) => {
    if (!typeLabel) {
        return require('../../../assets/bat-character.png');
    }
    if (typeLabel.includes('분석형')) {
        return require('../../../assets/character/bat-green.png');
    }
    if (typeLabel.includes('협력형')) {
        return require('../../../assets/character/bat-red.png');
    }
    if (typeLabel.includes('창의형')) {
        return require('../../../assets/character/bat-yellow.png');
    }
    if (typeLabel.includes('사회형')) {
        return require('../../../assets/character/bat-purple.png');
    }
    return require('../../../assets/bat-character.png');
};

const BG = '#F6F7FB';

export default function MyPageScreen({
    nickname,
    typeLabel,
    level,
    totalStudyCount,
    continuousDays,
    onNavigate,
}: Props) {
    const characterSource = getCharacterSourceByType(typeLabel);

    // 간단 더미 상태: 처음에는 카카오만 연결된 상태라고 가정
    const [kakaoEmail, setKakaoEmail] = useState<string | null>(
        'example@example.com',
    );
    const [naverEmail, setNaverEmail] = useState<string | null>(null);

    const [showSingleDisconnectModal, setShowSingleDisconnectModal] =
        useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const kakaoConnected = !!kakaoEmail;
    const naverConnected = !!naverEmail;
    const connectedCount =
        (kakaoConnected ? 1 : 0) + (naverConnected ? 1 : 0);

    const handleConnectKakao = () => {
        // 실제 연동 로직은 나중에 백엔드/SDK 붙일 때 교체
        setKakaoEmail('example@example.com');
    };

    const handleConnectNaver = () => {
        setNaverEmail('example@example.com');
    };

    const tryDisconnect = (provider: 'kakao' | 'naver') => {
        if (connectedCount <= 1) {
            setShowSingleDisconnectModal(true);
            return;
        }
        if (provider === 'kakao') {
            setKakaoEmail(null);
        } else {
            setNaverEmail(null);
        }
    };

    return (
        <View style={styles.root}>
            {/* 좌측 사이드바 (Home/League와 동일 구조, 마이만 활성화) */}
            <View style={styles.sidebar}>
                <View style={styles.menuGroup}>
                    {/* 홈 */}
                    <Pressable
                        style={styles.menuButton}
                        onPress={() => onNavigate('home')}
                    >
                        <Image
                            source={require('../../../assets/homebutton/home.png')}
                            style={styles.menuIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.menuText}>홈</Text>
                    </Pressable>

                    {/* 자료 입력 */}
                    <Pressable style={styles.menuButton} onPress={() => { }}>
                        <Image
                            source={require('../../../assets/homebutton/data.png')}
                            style={styles.menuIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.menuText}>자료 입력</Text>
                    </Pressable>

                    {/* 복습 */}
                    <Pressable style={styles.menuButton} onPress={() => { }}>
                        <Image
                            source={require('../../../assets/homebutton/review.png')}
                            style={styles.menuIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.menuText}>복습</Text>
                    </Pressable>

                    {/* 리그 */}
                    <Pressable
                        style={styles.menuButton}
                        onPress={() => onNavigate('league')}
                    >
                        <Image
                            source={require('../../../assets/homebutton/league.png')}
                            style={styles.menuIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.menuText}>리그</Text>
                    </Pressable>

                    {/* 마이 (활성) */}
                    <Pressable
                        style={styles.menuButton}
                        onPress={() => onNavigate('mypage')}
                    >
                        <Image
                            source={require('../../../assets/homebutton/my.png')}
                            style={[styles.menuIcon, styles.menuIconActive]}
                            resizeMode="contain"
                        />
                        <Text style={[styles.menuText, styles.menuTextActive]}>
                            마이
                        </Text>
                    </Pressable>

                    {/* 로그아웃 – 나중에 onPress에서 step을 login으로 돌려도 됨 */}
                    <Pressable style={styles.menuButton} onPress={() => { }}>
                        <Image
                            source={require('../../../assets/homebutton/logout.png')}
                            style={styles.menuIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.menuText}>로그아웃</Text>
                    </Pressable>
                </View>
            </View>

            {/* 우측 마이페이지 메인 */}
            <ScrollView
                style={styles.main}
                contentContainerStyle={styles.mainContent}
            >
                {/* 상단 프로필 카드 */}
                <View style={styles.profileCard}>
                    <View style={styles.profileLeft}>
                        <Image
                            source={characterSource}
                            style={styles.character}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.profileRight}>
                        {/* 닉네임 + 수정 버튼 */}
                        <View style={styles.nameRow}>
                            <Text style={styles.nickname}>{nickname}</Text>
                            <Pressable
                                style={styles.nicknameEditButton}
                                onPress={() => {
                                    // 닉네임 변경 화면으로 이동은 나중에 연결
                                }}
                            >
                                <Image
                                    source={require('../../../assets/mypage/nickname-change.png')}
                                    style={styles.nicknameEditIcon}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        </View>

                        {/* 레벨 / 유형 */}
                        <Text style={styles.levelLine}>
                            <Text style={styles.levelLabel}>Level </Text>
                            <Text style={styles.levelValue}>{level}</Text>{' '}
                            {typeLabel || '학습 유형 미지정'}
                        </Text>

                        {/* 총 학습 횟수 / 연속 학습일 */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <View style={styles.statIconRow}>
                                    <Image
                                        source={require('../../../assets/mypage/total-study.png')}
                                        style={styles.statIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.statTitle}>총 학습 횟수</Text>
                                </View>
                                <Text style={styles.statValue}>
                                    {totalStudyCount}회
                                </Text>
                            </View>

                            <View style={styles.statBox}>
                                <View style={styles.statIconRow}>
                                    <Image
                                        source={require('../../../assets/mypage/continuous-study.png')}
                                        style={styles.statIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.statTitle}>연속 학습일</Text>
                                </View>
                                <Text style={styles.statValue}>
                                    {continuousDays}일
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 연결된 계정 섹션 */}
                <View style={styles.accountSection}>
                    <Text style={styles.sectionTitle}>연결된 계정</Text>

                    {/* 카카오 계정 박스 */}
                    <View style={[styles.accountBox, styles.kakaoBox]}>
                        <View style={styles.accountRow}>
                            <View style={styles.providerInfo}>
                                <Image
                                    source={require('../../../assets/kakao.png')}
                                    style={styles.providerIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.providerName}>카카오 계정</Text>
                            </View>

                            {kakaoConnected ? (
                                <Pressable
                                    style={styles.accountAction}
                                    onPress={() => tryDisconnect('kakao')}
                                >
                                    <Text style={styles.accountActionText}>연결해제</Text>
                                    <Image
                                        source={require('../../../assets/shift.png')}
                                        style={styles.shiftIcon}
                                        resizeMode="contain"
                                    />
                                </Pressable>
                            ) : (
                                <Pressable
                                    style={styles.accountAction}
                                    onPress={handleConnectKakao}
                                >
                                    <Text style={styles.accountActionText}>연결</Text>
                                    <Image
                                        source={require('../../../assets/shift.png')}
                                        style={styles.shiftIcon}
                                        resizeMode="contain"
                                    />
                                </Pressable>
                            )}
                        </View>

                        {kakaoConnected && (
                            <Text style={styles.emailText}>
                                이메일: {kakaoEmail}
                            </Text>
                        )}
                    </View>

                    {/* 네이버 계정 박스 */}
                    <View style={[styles.accountBox, styles.naverBox]}>
                        <View style={styles.accountRow}>
                            <View style={styles.providerInfo}>
                                <View style={styles.naverIconCircle}>
                                    <Text style={styles.naverIconText}>N</Text>
                                </View>
                                <Text style={styles.providerName}>네이버 계정</Text>
                            </View>

                            {naverConnected ? (
                                <Pressable
                                    style={styles.accountAction}
                                    onPress={() => tryDisconnect('naver')}
                                >
                                    <Text style={styles.accountActionText}>연결해제</Text>
                                    <Image
                                        source={require('../../../assets/shift.png')}
                                        style={styles.shiftIcon}
                                        resizeMode="contain"
                                    />
                                </Pressable>
                            ) : (
                                <Pressable
                                    style={styles.accountAction}
                                    onPress={handleConnectNaver}
                                >
                                    <Text style={styles.accountActionText}>연결</Text>
                                    <Image
                                        source={require('../../../assets/shift.png')}
                                        style={styles.shiftIcon}
                                        resizeMode="contain"
                                    />
                                </Pressable>
                            )}
                        </View>

                        {naverConnected && (
                            <Text style={styles.emailText}>
                                이메일: {naverEmail}
                            </Text>
                        )}
                    </View>

                    {/* 탈퇴하기 */}
                    <Pressable
                        style={styles.withdrawButton}
                        onPress={() => setShowWithdrawModal(true)}
                    >
                        <Text style={styles.withdrawText}>탈퇴하기</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* 연결 1개일 때 해제 불가 모달 */}
            {showSingleDisconnectModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalMessage}>
                            연결된 계정이 1개여서 해제할 수 없어요.
                        </Text>
                        <Text style={styles.modalSubMessage}>
                            먼저 다른 계정을 추가로 연결한 뒤 해제해주세요.
                        </Text>

                        <Pressable
                            style={styles.modalPrimaryButton}
                            onPress={() => setShowSingleDisconnectModal(false)}
                        >
                            <Text style={styles.modalPrimaryText}>확인</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* 탈퇴하기 모달 */}
            {showWithdrawModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalMessage}>
                            지금까지의 학습 기록과 리그 데이터가 모두 삭제돼요.
                        </Text>
                        <Text style={styles.modalStrong}>
                            정말 탈퇴하시겠어요?
                        </Text>

                        <View style={styles.modalButtonRow}>
                            <Pressable
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={() => setShowWithdrawModal(false)}
                            >
                                <Text style={styles.modalCancelText}>취소</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalDanger]}
                                onPress={() => {
                                    // 실제 탈퇴 로직은 나중에 연결
                                    setShowWithdrawModal(false);
                                }}
                            >
                                <Text style={styles.modalDangerText}>탈퇴</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: BG,
    },

    /* 사이드바 */
    sidebar: {
        width: scale(80),
        backgroundColor: '#FFFFFF',
        paddingTop: scale(32),
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    menuGroup: {
        gap: scale(16),
        alignItems: 'center',
    },
    menuButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(4),
    },
    menuIcon: {
        width: scale(24),
        height: scale(24),
        tintColor: '#9CA3AF',
    },
    menuIconActive: {
        tintColor: '#5E82FF',
    },
    menuText: {
        fontSize: fontScale(12),
        color: '#9CA3AF',
    },
    menuTextActive: {
        color: '#5E82FF',
        fontWeight: '700',
    },

    /* 메인 영역 */
    main: {
        flex: 1,
    },
    mainContent: {
        paddingHorizontal: scale(32),
        paddingVertical: scale(24),
        gap: scale(24),
    },

    /* 프로필 카드 */
    profileCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: scale(24),
        paddingVertical: scale(20),
        paddingHorizontal: scale(24),
        elevation: 3,
    },
    profileLeft: {
        justifyContent: 'center',
        marginRight: scale(40),
    },
    character: {
        width: scale(160),
        height: scale(160),
    },
    profileRight: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    nickname: {
        fontSize: fontScale(24),
        fontWeight: '800',
        marginRight: scale(8),
    },
    nicknameEditButton: {
        padding: scale(4),
    },
    nicknameEditIcon: {
        width: scale(20),
        height: scale(20),
    },
    levelLine: {
        fontSize: fontScale(14),
        color: '#4B5563',
        marginBottom: scale(16),
    },
    levelLabel: {
        fontWeight: '600',
    },
    levelValue: {
        fontSize: fontScale(18),
        fontWeight: '800',
    },

    statsRow: {
        flexDirection: 'row',
        gap: scale(16),
    },
    statBox: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: scale(16),
        paddingVertical: scale(12),
        paddingHorizontal: scale(12),
    },
    statIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(6),
        gap: scale(6),
    },
    statIcon: {
        width: scale(20),
        height: scale(20),
    },
    statTitle: {
        fontSize: fontScale(12),
        color: '#6B7280',
    },
    statValue: {
        fontSize: fontScale(18),
        fontWeight: '800',
    },

    /* 계정 섹션 */
    accountSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(24),
        paddingVertical: scale(20),
        paddingHorizontal: scale(24),
    },
    sectionTitle: {
        fontSize: fontScale(18),
        fontWeight: '800',
        marginBottom: scale(16),
    },

    accountBox: {
        borderRadius: scale(16),
        paddingVertical: scale(12),
        paddingHorizontal: scale(16),
        marginBottom: scale(12),
    },
    kakaoBox: {
        backgroundColor: '#FEE500',
    },
    naverBox: {
        backgroundColor: '#03C75A',
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    providerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    providerIcon: {
        width: scale(18),
        height: scale(18),
    },
    providerName: {
        fontSize: fontScale(15),
        fontWeight: '700',
    },
    accountAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    accountActionText: {
        fontSize: fontScale(14),
        fontWeight: '600',
    },
    shiftIcon: {
        width: scale(14),
        height: scale(14),
    },
    emailText: {
        marginTop: scale(8),
        fontSize: fontScale(12),
    },

    naverIconCircle: {
        width: scale(20),
        height: scale(20),
        borderRadius: scale(10),
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    naverIconText: {
        fontSize: fontScale(12),
        fontWeight: '900',
        color: '#03C75A',
    },

    withdrawButton: {
        marginTop: scale(16),
    },
    withdrawText: {
        fontSize: fontScale(13),
        color: '#EF4444',
    },

    /* 모달 공통 */
    modalOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '50%',
        maxWidth: 480,
        backgroundColor: '#FFFFFF',
        borderRadius: scale(24),
        paddingVertical: scale(24),
        paddingHorizontal: scale(24),
        alignItems: 'center',
    },
    modalMessage: {
        fontSize: fontScale(14),
        textAlign: 'center',
        marginBottom: scale(8),
    },
    modalSubMessage: {
        fontSize: fontScale(12),
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: scale(16),
    },
    modalStrong: {
        fontSize: fontScale(18),
        fontWeight: '800',
        color: '#EF4444',
        marginTop: scale(4),
        marginBottom: scale(20),
    },
    modalPrimaryButton: {
        marginTop: scale(8),
        borderRadius: scale(12),
        backgroundColor: '#5E82FF',
        paddingVertical: scale(10),
        paddingHorizontal: scale(32),
    },
    modalPrimaryText: {
        fontSize: fontScale(14),
        fontWeight: '700',
        color: '#FFFFFF',
    },

    modalButtonRow: {
        flexDirection: 'row',
        marginTop: scale(8),
        gap: scale(12),
    },
    modalButton: {
        flex: 1,
        borderRadius: scale(12),
        paddingVertical: scale(10),
        alignItems: 'center',
    },
    modalCancel: {
        backgroundColor: '#E5E7EB',
    },
    modalDanger: {
        backgroundColor: '#F97373',
    },
    modalCancelText: {
        fontWeight: '700',
        color: '#111827',
    },
    modalDangerText: {
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
