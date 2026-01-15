import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
} from 'react-native';
import {
    questions,
    applyAnswer,
    RawScore,
    toResult,
    ResultStats,
} from '../../data/learningTypeTest';
import { scale, fontScale } from '../../lib/layout';

type Props = {
    onFinish: (result: ResultStats) => void;
};

const BG = '#F3F4F6';

export default function TypeTestScreen({ onFinish }: Props) {
    const total = questions.length;
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState<RawScore>({ field: 0, tempo: 0 });

    const current = questions[index];

    const handleAnswer = (answer: 'yes' | 'no') => {
        const nextScore = applyAnswer(score, index, answer);

        const isLast = index === total - 1;
        if (isLast) {
            const result = toResult(nextScore);
            onFinish(result);
            return;
        }

        setScore(nextScore);
        setIndex(prev => prev + 1);
    };

    // 이미 답한 개수 (진행바 채우기용)
    const answeredCount = index;

    return (
        <View style={styles.container}>
            {/* 상단 타이틀 + 진행도 */}
            <View style={styles.top}>
                <Text style={styles.title}>학습 유형 검사</Text>

                {/* 20칸 세그먼트 진행 바 */}
                <View style={styles.progressRow}>
                    {Array.from({ length: total }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressSegment,
                                i < answeredCount && styles.progressSegmentActive,
                            ]}
                        />
                    ))}
                </View>

                <Text style={styles.counter}>
                    {answeredCount}/{total}
                </Text>
            </View>

            {/* 가운데 캐릭터 + 질문 카드 */}
            <View style={styles.center}>
                <Image
                    source={require('../../../assets/bat-character.png')}
                    style={styles.character}
                    resizeMode="contain"
                />

                <View style={styles.card}>
                    <Text style={styles.questionIndex}>Q{index + 1}.</Text>
                    <Text style={styles.questionText}>{current.text}</Text>

                    <View style={styles.buttonRow}>
                        <Pressable
                            style={[styles.choiceButton, styles.yesButton]}
                            onPress={() => handleAnswer('yes')}
                        >
                            <Text style={[styles.choiceLabel, styles.choiceLabelYes]}>O</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.choiceButton, styles.noButton]}
                            onPress={() => handleAnswer('no')}
                        >
                            <Text style={[styles.choiceLabel, styles.choiceLabelNo]}>X</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // 전체 화면 배경 + 상단 여백
    container: {
        flex: 1,
        backgroundColor: BG,
        paddingHorizontal: scale(40),
        paddingTop: scale(40),
    },

    // 상단 영역 (제목 + 진행바 + 카운터)
    top: {
        marginBottom: scale(24),
    },
    title: {
        fontSize: fontScale(22),
        fontWeight: '800',
        marginBottom: scale(12),
    },

    // 20칸 세그먼트 진행 바 행
    progressRow: {
        flexDirection: 'row',
        width: '100%',
        gap: scale(4),
    },
    progressSegment: {
        flex: 1,
        height: scale(12),
        borderRadius: scale(4),
        backgroundColor: '#E5E7EB',
    },
    progressSegmentActive: {
        backgroundColor: '#5E82FF',
    },

    // 0/20 카운터
    counter: {
        marginTop: scale(4),
        fontSize: fontScale(12),
        color: '#6B7280',
        textAlign: 'right',
    },

    // 가운데 캐릭터 + 카드 정렬
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // 👇 캐릭터 아래가 카드에 살짝 파묻히도록 음수 마진
    character: {
        width: scale(140),
        height: scale(140),
        marginBottom: -scale(40),
    },

    // 질문 카드
    card: {
        width: scale(320),
        backgroundColor: '#ffffff',
        borderRadius: scale(24),
        paddingVertical: scale(24),
        paddingHorizontal: scale(20),
        alignItems: 'center',
        elevation: 4,
    },

    questionIndex: {
        fontSize: fontScale(14),
        fontWeight: '700',
        color: '#2563EB',
        marginBottom: scale(8),
    },
    questionText: {
        fontSize: fontScale(16),
        textAlign: 'center',
        color: '#111827',
        lineHeight: fontScale(22),
        marginBottom: scale(24),
    },

    buttonRow: {
        flexDirection: 'row',
        gap: scale(16),
    },

    choiceButton: {
        width: scale(96),
        height: scale(96),
        borderRadius: scale(24),
        alignItems: 'center',
        justifyContent: 'center',
    },
    yesButton: {
        backgroundColor: '#BBF7D0',
    },
    noButton: {
        backgroundColor: '#FECACA',
    },

    choiceLabel: {
        fontSize: fontScale(40),
        fontWeight: '800',
    },
    choiceLabelYes: {
        color: '#10B981',
    },
    choiceLabelNo: {
        color: '#F97373',
    },
});
