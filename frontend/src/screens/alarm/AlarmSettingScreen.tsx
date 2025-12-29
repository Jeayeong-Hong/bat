// src/screens/alarm/AlarmSettingScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Switch,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';

type Time = {
    ampm: '오전' | '오후';
    hour: number;   // 1 ~ 12
    minute: number; // 0, 5, 10 ... 55
};

type ActivePicker = null | 'review' | 'dndStart' | 'dndEnd';

type Props = {
    // App.tsx에서 step을 'alarm'으로 되돌리기 위해 사용
    onNavigate: (screen: 'alarm') => void;
};

const BG = '#FFFFFF';

export default function AlarmSettingScreen({ onNavigate }: Props) {
    // 토글 상태
    const [reviewEnabled, setReviewEnabled] = useState(true);
    const [leagueEnabled, setLeagueEnabled] = useState(true);
    const [dndEnabled, setDndEnabled] = useState(true);

    // 시간 상태
    const [reviewTime, setReviewTime] = useState<Time>({
        ampm: '오후',
        hour: 7,
        minute: 30,
    });
    const [dndStart, setDndStart] = useState<Time>({
        ampm: '오후',
        hour: 10,
        minute: 30,
    });
    const [dndEnd, setDndEnd] = useState<Time>({
        ampm: '오전',
        hour: 7,
        minute: 30,
    });

    // 모달에서 임시로 조작할 시간
    const [picker, setPicker] = useState<ActivePicker>(null);
    const [tempTime, setTempTime] = useState<Time>(reviewTime);

    const formatTime = (t: Time) => {
        const mm = t.minute.toString().padStart(2, '0');
        const suffix = t.ampm === '오전' ? 'AM' : 'PM';
        return `${t.hour}:${mm} ${suffix}`;
    };

    const dndLabel = `${formatTime(dndStart)} ~ ${formatTime(dndEnd)}`;

    const openPicker = (target: ActivePicker) => {
        setPicker(target);

        if (target === 'review') setTempTime(reviewTime);
        if (target === 'dndStart') setTempTime(dndStart);
        if (target === 'dndEnd') setTempTime(dndEnd);
    };

    const confirmPicker = () => {
        if (picker === 'review') setReviewTime(tempTime);
        if (picker === 'dndStart') setDndStart(tempTime);
        if (picker === 'dndEnd') setDndEnd(tempTime);
        setPicker(null);
    };

    const change = (field: keyof Time, diff: number) => {
        setTempTime((prev) => {
            if (field === 'ampm') {
                return { ...prev, ampm: prev.ampm === '오전' ? '오후' : '오전' };
            }
            if (field === 'hour') {
                let h = prev.hour + diff;
                if (h < 1) h = 12;
                if (h > 12) h = 1;
                return { ...prev, hour: h };
            }
            if (field === 'minute') {
                // 5분 단위로 증감
                let m = prev.minute + diff;
                if (m < 0) m = 55;
                if (m > 55) m = 0;
                return { ...prev, minute: m };
            }
            return prev;
        });
    };

    return (
        <View style={styles.root}>
            {/* 상단바 */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => onNavigate('alarm')}
                >
                    <Text style={styles.backIcon}>{'<'}</Text>
                </Pressable>
                <Text style={styles.headerTitle}>알림설정</Text>
                {/* 오른쪽 비우기(중앙 정렬 맞추기용) */}
                <View style={{ width: scale(24) }} />
            </View>

            {/* 내용 영역 */}
            <View style={styles.content}>
                {/* 복습 알림 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>복습 알림</Text>

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>복습 알림 설정</Text>
                            <Text style={styles.subLabel}>
                                하루 한 번 복습 알림을 보내드려요
                            </Text>
                        </View>
                        <Switch
                            value={reviewEnabled}
                            onValueChange={setReviewEnabled}
                            trackColor={{ false: '#D1D5DB', true: '#5E82FF' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>복습 알림 시간</Text>
                        <Pressable
                            style={styles.timeChip}
                            onPress={() => openPicker('review')}
                            disabled={!reviewEnabled}
                        >
                            <Text style={styles.timeText}>{formatTime(reviewTime)}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* 리그 알림 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>리그 알림</Text>

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>리그 알림 설정</Text>
                            <Text style={styles.subLabel}>
                                순위 변동이 있을 때 알려드려요
                            </Text>
                        </View>
                        <Switch
                            value={leagueEnabled}
                            onValueChange={setLeagueEnabled}
                            trackColor={{ false: '#D1D5DB', true: '#5E82FF' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* 방해 금지 시간 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>방해 금지 시간</Text>

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>방해 금지 시간 설정</Text>
                            <Text style={styles.subLabel}>
                                설정한 시간에는 알림을 보내지 않아요
                            </Text>
                        </View>
                        <Switch
                            value={dndEnabled}
                            onValueChange={setDndEnabled}
                            trackColor={{ false: '#D1D5DB', true: '#5E82FF' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>방해 금지 시간</Text>
                        <Pressable
                            style={styles.timeChip}
                            onPress={() => openPicker('dndStart')}
                            disabled={!dndEnabled}
                        >
                            <Text style={styles.timeText}>{dndLabel}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* 시간 선택 모달 */}
            {picker && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {picker === 'review' && '복습 알림 시간'}
                                {picker === 'dndStart' && '방해 금지 시작 시간'}
                                {picker === 'dndEnd' && '방해 금지 종료 시간'}
                            </Text>
                            <Pressable onPress={() => setPicker(null)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </Pressable>
                        </View>

                        <View style={styles.timePickerRow}>
                            {/* 오전/오후 */}
                            <View style={styles.timeColumn}>
                                <Pressable onPress={() => change('ampm', 1)}>
                                    <Text style={styles.arrow}>▲</Text>
                                </Pressable>
                                <Text style={styles.timeValue}>{tempTime.ampm}</Text>
                                <Pressable onPress={() => change('ampm', -1)}>
                                    <Text style={styles.arrow}>▼</Text>
                                </Pressable>
                            </View>

                            {/* 시 */}
                            <View style={styles.timeColumn}>
                                <Pressable onPress={() => change('hour', 1)}>
                                    <Text style={styles.arrow}>▲</Text>
                                </Pressable>
                                <Text style={styles.timeValue}>{tempTime.hour}</Text>
                                <Pressable onPress={() => change('hour', -1)}>
                                    <Text style={styles.arrow}>▼</Text>
                                </Pressable>
                            </View>

                            {/* 분 */}
                            <View style={styles.timeColumn}>
                                <Pressable onPress={() => change('minute', 5)}>
                                    <Text style={styles.arrow}>▲</Text>
                                </Pressable>
                                <Text style={styles.timeValue}>
                                    {tempTime.minute.toString().padStart(2, '0')}
                                </Text>
                                <Pressable onPress={() => change('minute', -5)}>
                                    <Text style={styles.arrow}>▼</Text>
                                </Pressable>
                            </View>
                        </View>

                        <Pressable style={styles.modalConfirm} onPress={confirmPicker}>
                            <Text style={styles.modalConfirmText}>확인</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(32),
        paddingTop: scale(20),
        paddingBottom: scale(16),
    },
    backButton: {
        paddingRight: scale(16),
        paddingVertical: scale(4),
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

    content: {
        paddingHorizontal: scale(32),
        paddingTop: scale(16),
    },
    section: {
        marginBottom: scale(32),
    },
    sectionTitle: {
        fontSize: fontScale(18),
        fontWeight: '800',
        marginBottom: scale(12),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scale(12),
    },
    label: {
        fontSize: fontScale(14),
        fontWeight: '600',
    },
    subLabel: {
        fontSize: fontScale(12),
        color: '#6B7280',
        marginTop: scale(4),
    },
    timeChip: {
        paddingHorizontal: scale(16),
        paddingVertical: scale(8),
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#F3F4F6',
    },
    timeText: {
        fontSize: fontScale(13),
        fontWeight: '600',
    },

    modalOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '70%',
        backgroundColor: '#FFFFFF',
        borderRadius: scale(24),
        paddingVertical: scale(24),
        paddingHorizontal: scale(24),
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scale(16),
    },
    modalTitle: {
        fontSize: fontScale(16),
        fontWeight: '700',
    },
    modalClose: {
        fontSize: fontScale(18),
    },
    timePickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: scale(24),
    },
    timeColumn: {
        alignItems: 'center',
        paddingHorizontal: scale(8),
    },
    arrow: {
        fontSize: fontScale(16),
        marginVertical: scale(4),
    },
    timeValue: {
        fontSize: fontScale(16),
        fontWeight: '700',
        paddingHorizontal: scale(12),
        paddingVertical: scale(8),
        borderRadius: scale(16),
        backgroundColor: '#F3F4FF',
        minWidth: scale(64),
        textAlign: 'center',
    },
    modalConfirm: {
        backgroundColor: '#5E82FF',
        borderRadius: 999,
        paddingVertical: scale(14),
        alignItems: 'center',
    },
    modalConfirmText: {
        fontSize: fontScale(15),
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
