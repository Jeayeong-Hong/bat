import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { scale, fontScale } from '../../lib/layout';

type Subject = {
    id: string;
    icon: string;
    name: string;
    emoji: string;
};

type Card = {
    id: string;
    title: string;
    subject: string;
    description: string;
    progress: number;
    daysAgo: number;
};

type Props = {
    onBack: () => void;
};

const SUBJECTS: Subject[] = [
    { id: 'all', icon: '📚', name: '전체', emoji: '📚' },
    { id: 'korean', icon: '📖', name: '국어', emoji: '📖' },
    { id: 'english', icon: 'abc', name: '영어', emoji: 'abc' },
    { id: 'math', icon: '📐', name: '수학', emoji: '📐' },
    { id: 'science', icon: '🔬', name: '과학', emoji: '🔬' },
    { id: 'society', icon: '🌍', name: '사회', emoji: '🌍' },
    { id: 'history', icon: '📜', name: '역사', emoji: '📜' },
    { id: 'law', icon: '⚖️', name: '법', emoji: '⚖️' },
];

const MOCK_CARDS: Card[] = [
    {
        id: '1',
        title: '이차방정식',
        subject: '수학',
        description: 'ax²+bx+c=0 형태의 식에서 해를 구하는 방법을 배워요.',
        progress: 100,
        daysAgo: 7,
    },
    {
        id: '2',
        title: '세포 호흡',
        subject: '과학',
        description: '포도당을 분해해 에너지를 얻는 과정을 이해해요.',
        progress: 100,
        daysAgo: 7,
    },
    {
        id: '3',
        title: '비유법',
        subject: '국어',
        description: '어떤 대상을 다른 것에 빗대어 표현하는 방법을 익혀요.',
        progress: 100,
        daysAgo: 7,
    },
    {
        id: '4',
        title: '조동사',
        subject: '영어',
        description: 'can·must 같은 조동사가 문장 의미를 어떻게 바꾸는지 이해해요.',
        progress: 100,
        daysAgo: 7,
    },
    {
        id: '5',
        title: '기후 분류',
        subject: '사회',
        description: '지역별 기후 특징을 기준에 따라 구분해요.',
        progress: 100,
        daysAgo: 7,
    },
    {
        id: '6',
        title: '산화·환원 반응',
        subject: '과학',
        description: '전자의 이동으로 물질의 성질이 변하는 과정을 살펴봐요.',
        progress: 100,
        daysAgo: 7,
    },
];

export default function BrushUPScreen({ onBack }: Props) {
    const [selectedSubject, setSelectedSubject] = React.useState('all');

    const getSubjectIcon = (subjectName: string) => {
        const subject = SUBJECTS.find((s) => s.name === subjectName);
        return subject?.emoji ?? '📚';
    };

    const filteredCards = selectedSubject === 'all'
        ? MOCK_CARDS
        : MOCK_CARDS.filter(card => {
            const subject = SUBJECTS.find(s => s.name === card.subject);
            return subject?.id === selectedSubject;
        });

    return (
        <View style={styles.root}>
            {/* 왼쪽 사이드바 */}
            <View style={styles.sidebar}>
                <Pressable
                    style={[styles.sidebarBtn, styles.sidebarBtnActive]}
                    onPress={() => { }}
                >
                    <Image
                        source={require('../../../assets/homebutton/review.png')}
                        style={styles.sidebarIcon}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>

            {/* 메인 컨텐츠 */}
            <View style={styles.mainContent}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
                        <Image
                            source={require('../../../assets/shift.png')}
                            style={styles.backIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                    <Text style={styles.headerTitle}>복습</Text>
                </View>

                {/* 과목 필터 */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subjectScroll}
                >
                    {SUBJECTS.map((subject) => (
                        <Pressable
                            key={subject.id}
                            style={[
                                styles.subjectChip,
                                selectedSubject === subject.id && styles.subjectChipActive,
                            ]}
                            onPress={() => setSelectedSubject(subject.id)}
                        >
                            <Text style={styles.subjectEmoji}>{subject.emoji}</Text>
                            <Text
                                style={[
                                    styles.subjectText,
                                    selectedSubject === subject.id && styles.subjectTextActive,
                                ]}
                            >
                                {subject.name}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* 검색 바 */}
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <Text style={styles.searchPlaceholder}>학습 내용 검색</Text>
                </View>

                {/* 카드 목록 */}
                <ScrollView contentContainerStyle={styles.cardList}>
                    {filteredCards.map((card) => (
                        <Pressable key={card.id} style={styles.card}>
                            {/* X 버튼 */}
                            <Pressable style={styles.closeBtn} hitSlop={10}>
                                <Text style={styles.closeText}>×</Text>
                            </Pressable>

                            {/* 제목 + 과목 아이콘 */}
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{card.title}</Text>
                                <Text style={styles.cardSubjectIcon}>{getSubjectIcon(card.subject)}</Text>
                            </View>

                            {/* 과목명 */}
                            <Text style={styles.cardSubject}>{card.subject}</Text>

                            {/* 설명 */}
                            <Text style={styles.cardDesc}>{card.description}</Text>

                            {/* 정답률 + 기간 */}
                            <View style={styles.cardFooter}>
                                <Text style={styles.cardProgress}>정답률: {card.progress}%</Text>
                                <Text style={styles.cardDays}>{card.daysAgo}일 전</Text>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F6F7FB',
    },
    sidebar: {
        width: scale(80),
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        paddingTop: scale(20),
        paddingHorizontal: scale(16),
    },
    sidebarBtn: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scale(12),
    },
    sidebarBtnActive: {
        backgroundColor: '#EEF1FF',
    },
    sidebarIcon: {
        width: scale(28),
        height: scale(28),
    },
    mainContent: {
        flex: 1,
        paddingTop: scale(16),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(18),
        paddingBottom: scale(16),
    },
    backBtn: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    backIcon: {
        width: scale(16),
        height: scale(16),
        transform: [{ rotate: '180deg' }],
    },
    headerTitle: {
        fontSize: fontScale(22),
        fontWeight: '900',
        color: '#111827',
    },
    subjectScroll: {
        paddingHorizontal: scale(18),
        paddingBottom: scale(12),
        gap: scale(8),
    },
    subjectChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: scale(10),
        borderRadius: scale(20),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: scale(6),
    },
    subjectChipActive: {
        backgroundColor: '#5E82FF',
        borderColor: '#5E82FF',
    },
    subjectEmoji: {
        fontSize: fontScale(16),
    },
    subjectText: {
        fontSize: fontScale(13),
        fontWeight: '700',
        color: '#111827',
    },
    subjectTextActive: {
        color: '#FFFFFF',
    },
    searchBar: {
        marginHorizontal: scale(18),
        marginBottom: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: scale(12),
        paddingHorizontal: scale(16),
        paddingVertical: scale(14),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: scale(10),
    },
    searchIcon: {
        fontSize: fontScale(18),
    },
    searchPlaceholder: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#9CA3AF',
    },
    cardList: {
        paddingHorizontal: scale(18),
        paddingTop: scale(12),
        paddingBottom: scale(24),
        gap: scale(16),
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        padding: scale(18),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        right: scale(12),
        top: scale(12),
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: fontScale(24),
        fontWeight: '900',
        color: '#9CA3AF',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    cardTitle: {
        fontSize: fontScale(18),
        fontWeight: '900',
        color: '#111827',
        flex: 1,
    },
    cardSubjectIcon: {
        fontSize: fontScale(20),
        marginLeft: scale(8),
    },
    cardSubject: {
        fontSize: fontScale(13),
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: scale(8),
    },
    cardDesc: {
        fontSize: fontScale(13),
        fontWeight: '600',
        color: '#111827',
        lineHeight: fontScale(20),
        marginBottom: scale(12),
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardProgress: {
        fontSize: fontScale(12),
        fontWeight: '700',
        color: '#6B7280',
    },
    cardDays: {
        fontSize: fontScale(12),
        fontWeight: '700',
        color: '#6B7280',
    },
});
