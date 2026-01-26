// src/screens/mypage/MyPageScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';
import Sidebar from '../../components/Sidebar';
import OAuthWebView from '../../components/OAuthWebView';
import { getToken, clearAuthData } from '../../lib/storage';
import { confirmLogout } from '../../lib/auth';
import {
    getUserInfo,
    getOAuthUrl,
    connectAccount,
    disconnectAccount,
    withdrawAccount,
    updateNickname as apiUpdateNickname,
} from '../../api/auth';

type Screen = 'home' | 'league' | 'alarm' | 'mypage' | 'takePicture' | 'brushup';

type Props = {
    nickname: string;
    typeLabel: string;
    level: number;
    totalStudyCount: number;
    continuousDays: number;
    monthlyGoal: number | null;
    onNavigate: (screen: Screen) => void;
    onMonthlyGoalChange?: (goal: number) => void;
    onNicknameChange?: (nickname: string) => void;
    onLogout?: () => void;
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
    monthlyGoal,
    onNavigate,
    onMonthlyGoalChange,
    onNicknameChange,
    onLogout,
}: Props) {
    const characterSource = getCharacterSourceByType(typeLabel);

    // 닉네임 상태 관리
    const [currentNickname, setCurrentNickname] = useState(nickname);

    // 계정 연결 상태
    const [kakaoEmail, setKakaoEmail] = useState<string | null>(null);
    const [naverEmail, setNaverEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // OAuth WebView 상태
    const [showOAuthWebView, setShowOAuthWebView] = useState(false);
    const [oauthProvider, setOauthProvider] = useState<'kakao' | 'naver'>('kakao');

    const [showSingleDisconnectModal, setShowSingleDisconnectModal] =
        useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showMonthlyGoalModal, setShowMonthlyGoalModal] = useState(false);
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [tempGoal, setTempGoal] = useState(monthlyGoal || 20);
    const [tempNickname, setTempNickname] = useState(nickname);

    // 계정 정보 로드
    useEffect(() => {
        loadAccountInfo();
    }, []);

    const loadAccountInfo = async () => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다');
                return;
            }

            const userInfo = await getUserInfo(token);
            setKakaoEmail(userInfo.kakao_email);
            setNaverEmail(userInfo.naver_email);
            setLoading(false);
        } catch (error) {
            console.error('계정 정보 로드 실패:', error);
            Alert.alert('오류', '계정 정보를 불러오지 못했습니다');
            setLoading(false);
        }
    };

    const kakaoConnected = !!kakaoEmail;
    const naverConnected = !!naverEmail;
    const connectedCount =
        (kakaoConnected ? 1 : 0) + (naverConnected ? 1 : 0);

    const handleConnectKakao = () => {
        setOauthProvider('kakao');
        setShowOAuthWebView(true);
    };

    const handleConnectNaver = () => {
        setOauthProvider('naver');
        setShowOAuthWebView(true);
    };

    const handleOAuthCode = async (code: string) => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다');
                return;
            }

            const result = await connectAccount(token, oauthProvider, code);

            if (oauthProvider === 'kakao') {
                setKakaoEmail(result.connected_email);
            } else {
                setNaverEmail(result.connected_email);
            }

            Alert.alert('성공', result.message);
        } catch (error: any) {
            Alert.alert('오류', error.message || '계정 연동 실패');
        }
    };

    const tryDisconnect = async (provider: 'kakao' | 'naver') => {
        const connectedCount = (kakaoEmail ? 1 : 0) + (naverEmail ? 1 : 0);

        if (connectedCount <= 1) {
            setShowSingleDisconnectModal(true);
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다');
                return;
            }

            await disconnectAccount(token, provider);

            if (provider === 'kakao') {
                setKakaoEmail(null);
            } else {
                setNaverEmail(null);
            }

            Alert.alert('성공', `${provider === 'kakao' ? '카카오' : '네이버'} 계정 연동이 해제되었습니다`);
        } catch (error: any) {
            Alert.alert('오류', error.message || '연동 해제 실패');
        }
    };

    const handleWithdraw = async () => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다');
                return;
            }

            await withdrawAccount(token);
            await clearAuthData();

            Alert.alert('성공', '회원 탈퇴가 완료되었습니다');
            // 로그인 화면으로 이동하도록 onNavigate 호출
            // onNavigate('login'); // 로그인 화면으로 이동하는 로직 필요
        } catch (error: any) {
            Alert.alert('오류', error.message || '회원 탈퇴 실패');
        }
    };

    const handleNicknameChange = async (newNickname: string) => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('오류', '로그인이 필요합니다');
                return;
            }

            await apiUpdateNickname(token, newNickname);
            setCurrentNickname(newNickname);
            onNicknameChange?.(newNickname);
            Alert.alert('성공', '닉네임이 변경되었습니다');
        } catch (error: any) {
            Alert.alert('오류', error.message || '닉네임 변경 실패');
        }
    };

    return (
        <View style={styles.root}>
            <Sidebar
                activeScreen="mypage"
                onNavigate={onNavigate}
                onLogout={() => confirmLogout(onLogout)}
            />

            {/* 우측 마이페이지 메인 */}
            <ScrollView
                style={styles.main}
                contentContainerStyle={styles.mainContent}
            >
                {/* 상단 프로필 영역 */}
                <View style={styles.profileSection}>
                    {/* 왼쪽: 캐릭터 + 닉네임 (중앙정렬) */}
                    <View style={styles.leftColumn}>
                        <Image
                            source={characterSource}
                            style={styles.character}
                            resizeMode="contain"
                        />
                        <View style={styles.nameRow}>
                            <Text style={styles.nickname}>{currentNickname}</Text>
                            <Pressable
                                style={styles.nicknameEditButton}
                                onPress={() => {
                                    setTempNickname(currentNickname);
                                    setShowNicknameModal(true);
                                }}
                            >
                                <Image
                                    source={require('../../../assets/mypage/nickname-change.png')}
                                    style={styles.nicknameEditIcon}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* 오른쪽: 학습 정보 */}
                    <View style={styles.rightColumn}>
                        {/* 레벨 + 학습유형 (상단 중앙) */}
                        <View style={styles.levelSection}>
                            <Text style={styles.levelText}>
                                Level <Text style={styles.levelValue}>{level}</Text> <Text style={styles.typeText}>{typeLabel || '학습 유형 미지정'}</Text>
                            </Text>
                        </View>

                        {/* 통계 3개 가로 나열 */}
                        <View style={styles.statsRow}>
                            {/* 총 학습 횟수 */}
                            <View style={styles.statItem}>
                                <View style={styles.statIconRow}>
                                    <Image
                                        source={require('../../../assets/mypage/total-study.png')}
                                        style={styles.statIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.statTitle}>총 학습 횟수</Text>
                                </View>
                                <Text style={styles.statValue}>{totalStudyCount}회</Text>
                            </View>

                            {/* 연속 학습일 */}
                            <View style={styles.statItem}>
                                <View style={styles.statIconRow}>
                                    <Image
                                        source={require('../../../assets/mypage/continuous-study.png')}
                                        style={styles.statIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.statTitle}>연속 학습일</Text>
                                </View>
                                <Text style={styles.statValue}>{continuousDays}일</Text>
                            </View>

                            {/* 한달 목표 */}
                            <Pressable
                                style={styles.statItem}
                                onPress={() => setShowMonthlyGoalModal(true)}
                            >
                                <View style={styles.statIconRow}>
                                    <Image
                                        source={require('../../../assets/mypage/monthly-goal.png')}
                                        style={styles.statIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.statTitle}>한달 목표</Text>
                                </View>
                                <Text style={styles.statValue}>{monthlyGoal || 0}회</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* 연결된 계정 섹션 */}
                <View style={styles.accountSection}>
                    <Text style={styles.sectionTitle}>연결된 계정</Text>

                    {/* 카카오 계정 */}
                    <View style={[styles.accountContainer, kakaoConnected && styles.accountContainerConnected]}>
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
                        </View>

                        {kakaoConnected && (
                            <View style={styles.emailBox}>
                                <Text style={styles.emailText}>
                                    이메일: {kakaoEmail}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* 네이버 계정 */}
                    <View style={[styles.accountContainer, naverConnected && styles.accountContainerConnectedNaver]}>
                        <View style={[styles.accountBox, styles.naverBox]}>
                            <View style={styles.accountRow}>
                                <View style={styles.providerInfo}>
                                    <Image
                                        source={require('../../../assets/naver-icon.png')}
                                        style={styles.providerIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={[styles.providerName, styles.naverText]}>네이버 계정</Text>
                                </View>

                                {naverConnected ? (
                                    <Pressable
                                        style={styles.accountAction}
                                        onPress={() => tryDisconnect('naver')}
                                    >
                                        <Text style={[styles.accountActionText, styles.naverText]}>연결해제</Text>
                                        <Image
                                            source={require('../../../assets/shift.png')}
                                            style={styles.shiftIcon}
                                            resizeMode="contain"
                                            tintColor="#FFFFFF"
                                        />
                                    </Pressable>
                                ) : (
                                    <Pressable
                                        style={styles.accountAction}
                                        onPress={handleConnectNaver}
                                    >
                                        <Text style={[styles.accountActionText, styles.naverText]}>연결</Text>
                                        <Image
                                            source={require('../../../assets/shift.png')}
                                            style={styles.shiftIcon}
                                            resizeMode="contain"
                                            tintColor="#FFFFFF"
                                        />
                                    </Pressable>
                                )}
                            </View>
                        </View>

                        {naverConnected && (
                            <View style={styles.emailBox}>
                                <Text style={styles.emailText}>
                                    이메일: {naverEmail}
                                </Text>
                            </View>
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
                        <Text style={styles.modalMessage}>
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

            {/* 닉네임 수정 모달 */}
            {showNicknameModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>닉네임 변경</Text>

                        <View style={styles.nicknameInputWrapper}>
                            <TextInput
                                style={styles.nicknameInput}
                                value={tempNickname}
                                onChangeText={setTempNickname}
                                placeholder="닉네임을 입력하세요"
                                maxLength={10}
                                autoFocus
                            />
                        </View>

                        <View style={styles.modalButtonRow}>
                            <Pressable
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={() => setShowNicknameModal(false)}
                            >
                                <Text style={styles.modalCancelText}>취소</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalPrimaryButton]}
                                onPress={async () => {
                                    await handleNicknameChange(tempNickname);
                                    setShowNicknameModal(false);
                                }}
                            >
                                <Text style={styles.modalPrimaryText}>확인</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}

            {/* 한달 목표 설정 모달 */}
            {showMonthlyGoalModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>한달 목표</Text>

                        <View style={styles.goalPicker}>
                            <Pressable onPress={() => setTempGoal(tempGoal + 1)}>
                                <Image
                                    source={require('../../../assets/shift.png')}
                                    style={styles.goalArrowUp}
                                    resizeMode="contain"
                                />
                            </Pressable>
                            <Text style={styles.goalValue}>{tempGoal} 회</Text>
                            <Pressable onPress={() => setTempGoal(Math.max(1, tempGoal - 1))}>
                                <Image
                                    source={require('../../../assets/shift.png')}
                                    style={styles.goalArrowDown}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        </View>

                        <Pressable
                            style={styles.modalPrimaryButton}
                            onPress={() => {
                                onMonthlyGoalChange?.(tempGoal);
                                setShowMonthlyGoalModal(false);
                            }}
                        >
                            <Text style={styles.modalPrimaryText}>확인</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* 탈퇴하기 모달 */}
            {showWithdrawModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalWithdrawBox}>
                        <Text style={styles.modalWithdrawMessage}>
                            지금까지의 학습 기록과 리그 데이터가 모두 삭제돼요.
                        </Text>
                        <Text style={styles.modalWithdrawStrong}>
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
                                onPress={async () => {
                                    setShowWithdrawModal(false);
                                    await handleWithdraw();
                                }}
                            >
                                <Text style={styles.modalDangerText}>탈퇴</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}

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

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: BG,
    },

    /* 메인 영역 */
    main: {
        flex: 1,
    },
    mainContent: {
        gap: scale(0),
    },

    /* 프로필 섹션 - 2열 구조 */
    profileSection: {
        flexDirection: 'row',
        backgroundColor: '##F6F7FB',
        paddingVertical: scale(40),
        paddingHorizontal: scale(60),
        gap: scale(80),
    },
    leftColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(12),
    },
    character: {
        width: scale(140),
        height: scale(140),
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    nickname: {
        fontSize: fontScale(26),
        fontWeight: '800',
    },
    nicknameEditButton: {
        padding: scale(4),
    },
    nicknameEditIcon: {
        width: scale(24),
        height: scale(24),
    },

    rightColumn: {
        flex: 2,
        gap: scale(24),
        justifyContent: 'center',
    },
    levelSection: {
        alignItems: 'center',
    },
    levelText: {
        fontSize: fontScale(18),
        color: '#374151',
    },
    levelValue: {
        fontSize: fontScale(24),
        fontWeight: '800',
        color: '#111827',
    },
    typeText: {
        fontSize: fontScale(16),
        color: '#6B7280',
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: scale(32),
    },
    statItem: {
        alignItems: 'center',
        gap: scale(8),
    },
    statIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },
    statIcon: {
        width: scale(24),
        height: scale(24),
    },
    statTitle: {
        fontSize: fontScale(13),
        color: '#6B7280',
    },
    statValue: {
        fontSize: fontScale(20),
        fontWeight: '800',
        color: '#111827',
        marginTop: scale(4),
    },

    /* 계정 섹션 */
    accountSection: {
        backgroundColor: '#FFFFFF',
        paddingVertical: scale(24),
        paddingHorizontal: scale(40),
    },
    sectionTitle: {
        fontSize: fontScale(20),
        fontWeight: '600',
        marginBottom: scale(16),
    },

    accountContainer: {
        borderRadius: scale(12),
        marginBottom: scale(12),
        overflow: 'hidden',
    },
    accountContainerConnected: {
        borderWidth: 2,
        borderColor: '#FEE500',
    },
    accountContainerConnectedNaver: {
        borderWidth: 2,
        borderColor: '#03C75A',
    },
    accountBox: {
        paddingVertical: scale(14),
        paddingHorizontal: scale(16),
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
        fontSize: fontScale(16),
        fontWeight: '600',
        color: '#5f5f5f',
    },
    shiftIcon: {
        width: scale(14),
        height: scale(14),
    },
    emailBox: {
        backgroundColor: '#FFFFFF',
        paddingVertical: scale(12),
        paddingHorizontal: scale(16),
    },
    emailText: {
        fontSize: fontScale(13),
        color: '#374151',
    },

    naverText: {
        color: '#FFFFFF',
    },

    withdrawButton: {
        marginTop: scale(16),
    },
    withdrawText: {
        fontSize: fontScale(13),
        color: '#000000',
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
        width: '40%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        paddingVertical: scale(32),
        paddingHorizontal: scale(32),
        alignItems: 'center',
        gap: scale(16),
    },
    modalTitle: {
        fontSize: fontScale(18),
        fontWeight: '800',
        marginBottom: scale(8),
    },
    modalMessage: {
        fontSize: fontScale(14),
        textAlign: 'center',
        color: '#111827',
        lineHeight: fontScale(20),
    },
    modalPrimaryButton: {
        width: '100%',
        borderRadius: scale(8),
        backgroundColor: '#5E82FF',
        paddingVertical: scale(12),
        alignItems: 'center',
    },
    modalPrimaryText: {
        fontSize: fontScale(15),
        fontWeight: '700',
        color: '#FFFFFF',
    },

    /* 닉네임 수정 모달 */
    nicknameInputWrapper: {
        width: '100%',
        marginVertical: scale(16),
    },
    nicknameInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: scale(8),
        paddingVertical: scale(12),
        paddingHorizontal: scale(16),
        fontSize: fontScale(16),
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },

    /* 한달 목표 모달 */
    goalPicker: {
        alignItems: 'center',
        gap: scale(16),
        marginVertical: scale(16),
        flexDirection: 'column',
    },
    goalArrowUp: {
        width: scale(20),
        height: scale(20),
        transform: [{ rotate: '-90deg' }],
    },
    goalArrowDown: {
        width: scale(20),
        height: scale(20),
        transform: [{ rotate: '90deg' }],
    },
    goalValue: {
        fontSize: fontScale(28),
        fontWeight: '800',
        color: '#111827',
    },

    /* 탈퇴 모달 */
    modalWithdrawBox: {
        width: '40%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        paddingVertical: scale(40),
        paddingHorizontal: scale(32),
        alignItems: 'center',
    },
    modalWithdrawMessage: {
        fontSize: fontScale(14),
        textAlign: 'center',
        color: '#111827',
        lineHeight: fontScale(20),
        marginBottom: scale(24),
    },
    modalWithdrawStrong: {
        fontSize: fontScale(20),
        fontWeight: '800',
        color: '#EF4444',
        marginBottom: scale(32),
    },

    modalButtonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: scale(12),
    },
    modalButton: {
        flex: 1,
        borderRadius: scale(8),
        paddingVertical: scale(12),
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
        fontSize: fontScale(15),
        color: '#111827',
    },
    modalDangerText: {
        fontWeight: '700',
        fontSize: fontScale(15),
        color: '#FFFFFF',
    },
});
