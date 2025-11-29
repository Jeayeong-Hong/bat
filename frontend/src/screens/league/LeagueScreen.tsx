// src/screens/league/LeagueScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Pressable,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';

// 어떤 화면으로 이동할지
type Screen = 'home' | 'league' | 'mypage';

// 리그 티어 타입
export type LeagueTier = 'iron' | 'bronze' | 'silver' | 'gold' | 'dia';

// 리그에 표시할 유저 정보 타입
export type LeagueUser = {
    id: string;         // 유저 고유 ID (백엔드 ID 사용)
    nickname: string;   // 닉네임
    xp: number;         // 누적 XP
    minutesAgo: number; // 마지막 활동 후 지난 시간 (분 단위)
};

type Props = {
    onNavigate: (screen: Screen) => void;

    // 현재 로그인한 사용자의 리그 정보
    currentTier: LeagueTier;
    users: LeagueUser[];     // 순위 순서로 정렬된 배열 (1등 → n등)
    remainingText: string;   // 예: "남은 시간: 3일 19시간 30분"
};

// 리그 이름 레이블
const LEAGUE_LABEL: Record<LeagueTier, string> = {
    iron: '아이언 리그',
    bronze: '브론즈 리그',
    silver: '실버 리그',
    gold: '골드 리그',
    dia: '다이아몬드 리그',
};

// 트로피 순서 (상단에 보여줄 순서)
const TROPHY_ORDER: LeagueTier[] = ['iron', 'bronze', 'silver', 'gold', 'dia'];

/** 상단 트로피 이미지 선택 */
const getTrophySource = (tier: LeagueTier, currentTier: LeagueTier) => {
    const currentIdx = TROPHY_ORDER.indexOf(currentTier);
    const idx = TROPHY_ORDER.indexOf(tier);

    // 현재 리그까지는 실제 트로피
    if (idx <= currentIdx) {
        switch (tier) {
            case 'iron':
                return require('../../../assets/league-trophy/iron.png');
            case 'bronze':
                return require('../../../assets/league-trophy/bronze.png');
            case 'silver':
                return require('../../../assets/league-trophy/silver.png');
            case 'gold':
                return require('../../../assets/league-trophy/gold.png');
            case 'dia':
                return require('../../../assets/league-trophy/dia.png');
        }
    }

    // 나머지는 잠금 트로피
    return require('../../../assets/league-trophy/unlock.png');
};

/** 상위 3명 메달 이미지 선택 */
const getMedalSource = (rank: number) => {
    if (rank === 1) {
        return require('../../../assets/league-medal/1st.png');
    }
    if (rank === 2) {
        return require('../../../assets/league-medal/2st.png');
    }
    if (rank === 3) {
        return require('../../../assets/league-medal/3st.png');
    }
    return null;
};

const BG = '#F6F7FB';

export default function LeagueScreen({
    onNavigate,
    currentTier,
    users,
    remainingText,
}: Props) {
    const total = users.length;
    const promotionBorder = 6;           // 상위 5명 승급 → 6등 앞에 승급존
    const relegationBorder = total - 4;  // 하위 5명 강등 → total-4등 앞에 강등존

    return (
        <View style={styles.root}>
            {/* 좌측 사이드바 */}
            <View style={styles.sidebar}>

                <View style={styles.menuGroup}>
                    {/* 홈 버튼 */}
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
                    {/* 자료입력 버튼 */}
                    <Pressable style={styles.menuButton} onPress={() => { }}>
                        <Image
                            source={require('../../../assets/homebutton/data.png')}
                            style={styles.menuIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.menuText}>자료 입력</Text>
                    </Pressable>
                    {/* 복습 버튼 */}
                    <Pressable style={styles.menuButton} onPress={() => { }}>
                        <Image
                            source={require('../../../assets/homebutton/review.png')}
                            style={styles.menuIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.menuText}>복습</Text>
                    </Pressable>
                    {/* 리그 버튼 */}
                    <Pressable
                        style={styles.menuButton}
                        onPress={() => onNavigate('league')}
                    >
                        <Image
                            source={require('../../../assets/homebutton/league.png')}
                            style={[styles.menuIcon, styles.menuIconActive]}
                            resizeMode="contain"
                        />
                        <Text style={[styles.menuText, styles.menuTextActive]}>
                            리그
                        </Text>
                    </Pressable>
                    {/* 마이페이지 버튼 */}
                    <Pressable
                        style={styles.menuButton}
                        onPress={() => onNavigate('mypage')}
                    >
                        <Image
                            source={require('../../../assets/homebutton/my.png')}
                            style={styles.menuIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.menuText}>마이</Text>
                    </Pressable>
                    {/* 로그아웃 버튼 */}
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

            {/* 우측 리그 메인 영역 */}
            <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
                {/* 상단 트로피 + 리그명 */}
                <View style={styles.leagueHeader}>
                    <View style={styles.trophyRow}>
                        {TROPHY_ORDER.map((tier) => (
                            <Image
                                key={tier}
                                source={getTrophySource(tier, currentTier)}
                                style={styles.trophyIcon}
                                resizeMode="contain"
                            />
                        ))}
                    </View>

                    <Text style={styles.leagueName}>{LEAGUE_LABEL[currentTier]}</Text>
                    <Text style={styles.leagueRemain}>{remainingText}</Text>
                </View>

                {/* 랭킹 리스트 */}
                <View style={styles.listWrapper}>
                    {users.map((user, index) => {
                        const rank = index + 1;
                        const medalSource = getMedalSource(rank);

                        const showPromotionDivider = rank === promotionBorder;
                        const showRelegationDivider = rank === relegationBorder;

                        return (
                            <View key={user.id}>
                                {/* 승급존 구분선 */}
                                {showPromotionDivider && (
                                    <View style={styles.zoneRow}>
                                        <View style={styles.zoneLine} />
                                        <Text style={styles.zoneLabel}>승급존</Text>
                                        <View style={styles.zoneLine} />
                                    </View>
                                )}

                                {/* 강등존 구분선 */}
                                {showRelegationDivider && (
                                    <View style={styles.zoneRow}>
                                        <View style={styles.zoneLine} />
                                        <Text style={styles.zoneLabel}>강등존</Text>
                                        <View style={styles.zoneLine} />
                                    </View>
                                )}

                                {/* 한 줄 랭킹 아이템 */}
                                <View style={styles.row}>
                                    {/* 왼쪽: 순위/메달 */}
                                    <View style={styles.rankCol}>
                                        {medalSource ? (
                                            <Image
                                                source={medalSource}
                                                style={styles.medalIcon}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <Text style={styles.rankText}>{rank}</Text>
                                        )}
                                    </View>

                                    {/* 가운데: 아바타 + 닉네임 */}
                                    <View style={styles.centerCol}>
                                        {/* TODO: 이 부분은 실제 아바타 이미지로 교체 가능 */}
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>B</Text>
                                        </View>
                                        <Text style={styles.nickname}>{user.nickname}</Text>
                                    </View>

                                    {/* 오른쪽: XP + 시간 */}
                                    <View style={styles.rightCol}>
                                        <Text style={styles.xpText}>{user.xp}XP</Text>
                                        <Text style={styles.timeText}>
                                            {user.minutesAgo}분 전
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
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
        backgroundColor: '#FFFFFF',       // 사이드바는 흰색
        paddingTop: scale(32),
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    menuTitle: {
        fontSize: fontScale(18),
        fontWeight: '800',
        marginBottom: scale(24),
        color: '#4B5563',
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
    menuText: {
        fontSize: fontScale(12),
        color: '#9CA3AF',
    },
    menuTextActive: {
        color: '#5E82FF',
        fontWeight: '700',
    },
    menuIconActive: {
        tintColor: '#5E82FF',      // 선택된 메뉴 아이콘 파란색
    },

    /* 오른쪽 메인 영역 */
    main: {
        flex: 1,
        backgroundColor: '#FFFFFF',       // 오른쪽 랭킹 영역도 흰색
    },
    mainContent: {
        paddingHorizontal: 0,
        paddingVertical: 0,               // 여백 없애서 헤더가 전체 폭으로
    },

    /* 상단 리그 헤더 */
    leagueHeader: {
        backgroundColor: '#F6F7FB',       // 트로피 영역만 연보라
        paddingVertical: scale(20),
        paddingHorizontal: scale(40),
        borderBottomWidth: 1,             // 아래쪽 선
        borderBottomColor: '#E5E7EB',
        borderRadius: 0,
        marginBottom: 0,
    },

    trophyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scale(12),
    },
    trophyIcon: {
        width: scale(40),
        height: scale(40),
    },
    leagueName: {
        fontSize: fontScale(20),
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: scale(4),
    },
    leagueRemain: {
        fontSize: fontScale(12),
        color: '#EF476F',
        textAlign: 'center',
    },

    /* 리스트 영역 */
    listWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        paddingVertical: 0,
        marginTop: 0,
    },

    /* 승급/강등 존 구분선 */
    zoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(40),
        marginVertical: scale(4),
    },
    zoneLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    zoneLabel: {
        marginHorizontal: scale(8),
        fontSize: fontScale(12),
        color: '#9CA3AF',
    },

    // 랭킹 한 줄
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(40),
        paddingVertical: scale(12),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },


    rankCol: {
        width: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: fontScale(16),
        fontWeight: '700',
    },
    medalIcon: {
        width: scale(24),
        height: scale(24),
    },

    centerCol: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    avatar: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: '#FDE68A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: fontScale(14),
        fontWeight: '700',
        color: '#92400E',
    },
    nickname: {
        fontSize: fontScale(14),
        fontWeight: '700',
    },

    rightCol: {
        alignItems: 'flex-end',
    },
    xpText: {
        fontSize: fontScale(13),
        fontWeight: '700',
    },
    timeText: {
        fontSize: fontScale(11),
        color: '#6B7280',
    },
});
