// src/screens/alarm/AlarmScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';

type Screen = 'home' | 'league' | 'alarm' | 'alarmSetting';

type Props = {
    onNavigate: (screen: Screen) => void;
    onLogout?: () => void;
};

/** 알림 타입 */
type AlarmType = 'review' | 'league';

/** 알림 한 건 */
type AlarmItem = {
    id: string;
    type: AlarmType;
    title: string;
    description: string;
    timeLabel: string; // "7:30 PM" 같은 표시용
    read: boolean;
};

/** 날짜별로 묶은 알림 리스트 */
type AlarmSection = {
    dateLabel: string; // "2025. 11. 17"
    items: AlarmItem[];
};

// 우선 더미 데이터로 UI만 구성
const initialAlarms: AlarmSection[] = [
    {
        dateLabel: '2025. 11. 17',
        items: [
            {
                id: 'a1',
                type: 'review',
                title: "📚 '비유법'을 복습할 시간이예요!",
                description: '오늘의 복습으로 최대 20XP를 획득해보세요',
                timeLabel: '7:30 PM',
                read: false,
            },
            {
                id: 'a2',
                type: 'league',
                title: '😭 아이언 리그 1위를 뺏겼어요!',
                description: '학습하셔서 1위를 탈환하세요',
                timeLabel: '3:43 PM',
                read: false,
            },
        ],
    },
    {
        dateLabel: '2025. 11. 16',
        items: [
            {
                id: 'a3',
                type: 'review',
                title: "🌍 '시장 경제'를 복습할 시간이예요!",
                description: '오늘의 복습으로 최대 20XP를 획득해보세요',
                timeLabel: '7:30 PM',
                read: true,
            },
            {
                id: 'a4',
                type: 'league',
                title: '😭 아이언 리그 1위를 뺏겼어요!',
                description: '학습하셔서 1위를 탈환하세요',
                timeLabel: '4:20 PM',
                read: true,
            },
        ],
    },
];

const BG = '#F6F7FB';

export default function AlarmScreen({ onNavigate, onLogout }: Props) {
    // 나중에는 백엔드에서 받아오면 됨. 지금은 더미로 상태만 연결.
    const [sections] = useState<AlarmSection[]>(initialAlarms);

    return (
        <View style={styles.root}>
            {/* 상단바 */}
            <View style={styles.header}>
                {/* 왼쪽: < 버튼 (홈으로) */}
                <Pressable
                    style={styles.backButton}
                    onPress={() => onNavigate('home')}
                >
                    <Text style={styles.backIcon}>{'<'}</Text>
                </Pressable>

                {/* 가운데: 타이틀 */}
                <Text style={styles.headerTitle}>알림함</Text>

                {/* 오른쪽: 알림 설정 버튼 */}
                <Pressable
                    style={styles.settingButton}
                    onPress={() => onNavigate('alarmSetting')}  // ✅ 여기만 수정
                >
                    <Image
                        source={require('../../../assets/alarm/alarm-setting.png')}
                        style={styles.settingIcon}
                        resizeMode="contain"
                    />
                </Pressable>

            </View>

            {/* 알림 리스트 */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {sections.map((section) => (
                    <View key={section.dateLabel} style={styles.section}>
                        {/* 날짜 라벨 */}
                        <Text style={styles.sectionDate}>{section.dateLabel}</Text>

                        {/* 카드들 */}
                        {section.items.map((alarm) => (
                            <Pressable
                                key={alarm.id}
                                style={[
                                    styles.card,
                                    alarm.read && styles.cardRead, // 읽은 알림은 흐리게
                                ]}
                                onPress={() => {
                                    // TODO: 알림 눌렀을 때 이동/상세 처리
                                    console.log('알림 클릭:', alarm.id);
                                }}
                            >
                                <View style={styles.cardLeft}>
                                    <Text
                                        style={[
                                            styles.cardTitle,
                                            alarm.read && styles.cardTitleRead,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {alarm.title}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.cardDesc,
                                            alarm.read && styles.cardDescRead,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {alarm.description}
                                    </Text>
                                </View>

                                <View style={styles.cardRight}>
                                    <Text style={styles.cardTime}>{alarm.timeLabel}</Text>
                                    <Image
                                        source={require('../../../assets/shift.png')}
                                        style={styles.cardArrowImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            </Pressable>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },

    /* 상단바 */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(32),
        paddingTop: scale(20),
        paddingBottom: scale(16),
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        paddingVertical: scale(4),
        paddingRight: scale(16),
        paddingLeft: 0,
    },
    backIcon: {
        fontSize: fontScale(22),
        fontWeight: '700',
    },
    headerTitle: {
        flex: 1,
        fontSize: fontScale(20),
        fontWeight: '800',
    },
    settingButton: {
        paddingHorizontal: scale(4),
        paddingVertical: scale(4),
    },
    settingIcon: {
        width: scale(24),
        height: scale(24),
    },

    /* 리스트 */
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scale(32),
        paddingBottom: scale(24),
    },

    section: {
        marginTop: scale(16),
    },
    sectionDate: {
        fontSize: fontScale(12),
        color: '#9CA3AF',
        marginBottom: scale(8),
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: scale(20),
        paddingVertical: scale(18),
        paddingHorizontal: scale(20),
        marginBottom: scale(8),
        elevation: 2,
    },
    cardRead: {
        backgroundColor: '#EEF0F4',
    },
    cardLeft: {
        flex: 1,
    },
    cardTitle: {
        fontSize: fontScale(16),
        fontWeight: '800',
        marginBottom: scale(4),
    },
    cardTitleRead: {
        color: '#9CA3AF',
    },
    cardDesc: {
        fontSize: fontScale(13),
        color: '#6B7280',
    },
    cardDescRead: {
        color: '#9CA3AF',
    },

    cardRight: {
        marginLeft: scale(12),
        alignItems: 'flex-end',
    },
    cardTime: {
        fontSize: fontScale(12),
        color: '#6B7280',
        marginBottom: scale(8),
    },
    cardArrowImage: {
        width: scale(18),
        height: scale(18),
        tintColor: '#9CA3AF',
    },
});
