import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    ImageSourcePropType,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';

type Props = {
    onBack: () => void;
    sources: ImageSourcePropType[];
    selectedIndex: number;
};

type Step = '1-1' | '1-2' | '1-3';

type BlankItem = {
    id: number;
    word: string; // 정답 단어
    meaning?: string; // 단어 뜻(나중에 AI)
};

type GradeState = 'idle' | 'correct' | 'wrong';

const BG = '#F6F7FB';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';

const HIGHLIGHT_BG = '#C7CFFF'; // 1-1/1-2 기본 비계 배경
const CORRECT_BG = '#C5FFBA'; // 1-3 정답
const WRONG_BG = '#FF9CAD'; // 1-3 오답

export default function ScaffoldingScreen({ onBack }: Props) {
    /** ---------------------------
     *  더미 데이터 (나중에 AI/OCR로 교체)
     * --------------------------- */
    const title = '대표 결정 방식';

    const extractedText = useMemo(() => {
        return (
            '대표를 결정하는 방식은 크게 다수 대표제와 비례 대표제로 구분된다.\n\n' +
            '다수 대표제는 단순 다수 대표제와 절대다수 대표제로 나뉜다. 단순 다수 대표제는 여러 후보 중에서 다수 득표자를 당선자로 결정하는 방식으로, 주로 소선거구제와 결합한다. 대표 결정 방식의 대표성과 효율성 사이의 관계를 살펴보면 대표성은 비례 대표제에서 유리하고 효율성은 다수 대표제에서 유리한 측면이 있다.\n\n' +
            '비례 대표제는 정당 득표에 따른 의석 배분으로 대표성이 높지만, 정당 체계가 분열될 경우 정부의 안정성이 낮아질 수 있다.'
        );
    }, []);

    // 1단계에서 “비계 단어(빈칸 후보)” 더미
    const blanks: BlankItem[] = useMemo(
        () => [
            { id: 1, word: '다수 대표제', meaning: '여러 후보 중 최다 득표자를 선출하는 방식(예시)' },
            { id: 2, word: '비례 대표제', meaning: '정당 득표율에 따라 의석을 배분하는 방식(예시)' },
            { id: 3, word: '단순 다수 대표제', meaning: '가장 많은 표를 얻은 후보가 당선(예시)' },
            { id: 4, word: '소선거구제', meaning: '한 선거구에서 1인을 선출(예시)' },
            { id: 5, word: '대표성', meaning: '유권자 의사가 의석에 반영되는 정도(예시)' },
            { id: 6, word: '효율성', meaning: '정부 구성/운영의 안정성과 신속성(예시)' },
        ],
        [],
    );

    /** ---------------------------
     *  상태: 1-1 / 1-2 / 1-3
     * --------------------------- */
    const [step, setStep] = useState<Step>('1-1');

    /** 단어 뜻 표시(왼쪽 카드에) */
    const [selectedWord, setSelectedWord] = useState<BlankItem | null>(null);

    /** 1-2 입력용 */
    const inputRefs = useRef<Record<number, TextInput | null>>({});
    const [activeBlankId, setActiveBlankId] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    /** 1-3 채점 결과 */
    const [graded, setGraded] = useState<Record<number, GradeState>>({});

    /** ---------------------------
     *  상단 진행/점수 (디자인: 0/20 + 20바)
     *  - 지금은 “항상 20칸” 고정
     *  - 실제로는 AI가 만든 빈칸 개수(<=20)와 매핑하면 됩니다.
     * --------------------------- */
    const totalBars = 20;

    const correctCount = useMemo(() => {
        return Object.values(graded).filter((g) => g === 'correct').length;
    }, [graded]);

    const barStates: GradeState[] = useMemo(() => {
        // 20칸 고정. 앞에서부터 빈칸 개수만큼만 결과 반영.
        const arr: GradeState[] = Array.from({ length: totalBars }, () => 'idle');

        const ids = blanks.map((b) => b.id);
        ids.forEach((id, idx) => {
            if (idx >= totalBars) return;
            arr[idx] = graded[id] ?? (step === '1-3' ? 'wrong' : 'idle'); // 1-3에서 채점이 안 된 건 없도록 하지만, 안전 처리
            if (step !== '1-3') arr[idx] = 'idle';
        });

        return arr;
    }, [blanks, graded, step]);

    /** ---------------------------
     *  텍스트를 “단어/공백/줄바꿈” 토큰으로 쪼개서 렌더
     *  - 1-1: 단어는 그대로, 해당 단어 자리 뒤 배경(#C7CFFF)
     *  - 1-2: 해당 단어를 “빈 직사각형 칸”으로 표시 + 터치 시 입력
     *  - 1-3: 정답/오답 배경으로 표시 + 단어 뜻 터치 가능
     * --------------------------- */
    const keywordMap = useMemo(() => {
        // 긴 단어 먼저 매칭되도록 정렬
        const sorted = [...blanks].sort((a, b) => b.word.length - a.word.length);
        return sorted;
    }, [blanks]);

    const tokens = useMemo(() => tokenizeWithKeywords(extractedText, keywordMap.map((k) => k.word)), [
        extractedText,
        keywordMap,
    ]);

    /** ---------------------------
     *  액션
     * --------------------------- */
    const onReselectWords = () => {
        // 지금은 더미. 나중에 "AI 단어 재선정" API 호출로 교체
        Alert.alert('단어 재선정', '나중에 AI 재선정 API 연결 예정입니다.');
    };

    const onStartLearning = () => {
        setSelectedWord(null);
        setStep('1-2');
    };

    const onLongPressBlank = (blankId: number) => {
        // 힌트: 추후 구현 (요청대로 “꾹누름 로직만”)
        Alert.alert('힌트', '추후 힌트 기능을 연결할 예정입니다.');
    };

    const onPressBlank = (blankId: number) => {
        setActiveBlankId(blankId);
        requestAnimationFrame(() => {
            inputRefs.current[blankId]?.focus();
        });
    };

    const onGrade = () => {
        // 채점하기 → 1-3
        const next: Record<number, GradeState> = {};

        blanks.forEach((b) => {
            const user = (answers[b.id] ?? '').trim();
            const isCorrect = normalize(user) === normalize(b.word);
            next[b.id] = isCorrect ? 'correct' : 'wrong';
        });

        setGraded(next);
        setStep('1-3');
    };

    /** ---------------------------
     *  렌더: 왼쪽 카드(설명/버튼)
     * --------------------------- */
    const leftCard = (
        <View style={styles.leftCard}>
            <Text style={styles.leftTitle}>가이드</Text>

            {step === '1-1' && (
                <>
                    <GuideRow title="단어 터치하기" desc="단어의 의미를 확인할 수 있어요." />
                    <GuideRow title="단어 재선정" desc="빈칸 단어를 다시 추천받아요." />
                    <View style={styles.leftBtnGroup}>
                        <Pressable style={styles.leftSecondaryBtn} onPress={onReselectWords}>
                            <Text style={styles.leftSecondaryText}>단어 재선정</Text>
                        </Pressable>
                        <Pressable style={styles.leftPrimaryBtn} onPress={onStartLearning}>
                            <Text style={styles.leftPrimaryText}>학습 시작</Text>
                        </Pressable>
                    </View>
                </>
            )}

            {step === '1-2' && (
                <>
                    <GuideRow title="빈칸 터치하기" desc="키보드로 답을 입력해요." />
                    <GuideRow title="빈칸 꾹누르기" desc="힌트를 볼 수 있어요(추후)." />
                    <View style={styles.leftBtnGroup}>
                        <Pressable style={styles.leftPrimaryBtn} onPress={onGrade}>
                            <Text style={styles.leftPrimaryText}>채점하기</Text>
                        </Pressable>
                    </View>
                </>
            )}

            {step === '1-3' && (
                <>
                    <GuideRow title="단어 터치하기" desc="뜻을 다시 확인할 수 있어요." />
                    <GuideRow title="정답/오답" desc="배경 색으로 결과를 확인해요." />
                    <View style={styles.leftBtnGroup}>
                        <Pressable
                            style={styles.leftPrimaryBtn}
                            onPress={() => {
                                // 다음 라운드로 가는 로직은 2단계 만들 때 연결
                                Alert.alert('Round 2', '2단계는 다음 작업에서 연결하겠습니다.');
                            }}
                        >
                            <Text style={styles.leftPrimaryText}>Round 2</Text>
                        </Pressable>
                    </View>
                </>
            )}

            {/* 단어 뜻 표시 영역 (왼쪽 카드 하단) */}
            <View style={styles.meaningBox}>
                <Text style={styles.meaningTitle}>단어 의미</Text>
                {selectedWord ? (
                    <>
                        <Text style={styles.meaningWord}>{selectedWord.word}</Text>
                        <Text style={styles.meaningText}>{selectedWord.meaning ?? '의미 데이터를 불러오는 중...'}</Text>
                    </>
                ) : (
                    <Text style={styles.meaningPlaceholder}>단어를 터치하면 의미가 표시됩니다.</Text>
                )}
            </View>
        </View>
    );

    /** ---------------------------
     *  렌더: 오른쪽 카드(글만)
     * --------------------------- */
    const rightCard = (
        <View style={styles.rightCard}>
            <ScrollView contentContainerStyle={styles.textContainer}>
                <View style={styles.flow}>
                    {tokens.map((t, idx) => {
                        if (t.type === 'newline') return <View key={idx} style={styles.newline} />;

                        if (t.type === 'space') return <Text key={idx}>{t.value}</Text>;

                        if (t.type === 'text') {
                            return (
                                <Text key={idx} style={styles.bodyText}>
                                    {t.value}
                                </Text>
                            );
                        }

                        // keyword
                        const item = blanks.find((b) => b.word === t.value);
                        if (!item) {
                            return (
                                <Text key={idx} style={styles.bodyText}>
                                    {t.value}
                                </Text>
                            );
                        }

                        const grade = graded[item.id] ?? 'idle';
                        const userValue = answers[item.id] ?? '';

                        // 1-1: 단어는 그대로 + 배경만 깔기
                        if (step === '1-1') {
                            return (
                                <Pressable
                                    key={idx}
                                    onPress={() => setSelectedWord(item)}
                                    style={[styles.wordPill, { backgroundColor: HIGHLIGHT_BG }]}
                                >
                                    <Text style={styles.wordText}>{item.word}</Text>
                                </Pressable>
                            );
                        }

                        // 1-2: 빈칸(직사각형) + 터치하면 입력
                        if (step === '1-2') {
                            const isActive = activeBlankId === item.id;
                            return (
                                <Pressable
                                    key={idx}
                                    onPress={() => onPressBlank(item.id)}
                                    onLongPress={() => onLongPressBlank(item.id)}
                                    delayLongPress={450}
                                    style={[
                                        styles.blankBox,
                                        { backgroundColor: HIGHLIGHT_BG },
                                        isActive && styles.blankBoxActive,
                                    ]}
                                >
                                    {/* 화면에는 텍스트가 안 보이게(디자인처럼 “빈 칸”) */}
                                    <TextInput
                                        ref={(r) => {
                                            inputRefs.current[item.id] = r;
                                        }}
                                        value={userValue}
                                        onChangeText={(v) => setAnswers((prev) => ({ ...prev, [item.id]: v }))}
                                        placeholder=""
                                        style={styles.blankInput}
                                        blurOnSubmit
                                        onBlur={() => setActiveBlankId((prev) => (prev === item.id ? null : prev))}
                                    />
                                </Pressable>
                            );
                        }

                        // 1-3: 채점 결과 표시 (초록/빨강) + 단어 뜻 확인 가능
                        const bg =
                            grade === 'correct' ? CORRECT_BG : grade === 'wrong' ? WRONG_BG : HIGHLIGHT_BG;

                        return (
                            <Pressable
                                key={idx}
                                onPress={() => setSelectedWord(item)}
                                style={[styles.wordPill, { backgroundColor: bg }]}
                            >
                                {/* 1-3에서는 “정답 단어”를 그대로 보여주는 형태(예시 이미지 기반) */}
                                <Text style={styles.wordText}>{item.word}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );

    /** ---------------------------
     *  최상단 헤더 (제목 / 라운드 / 점수 / 20바)
     * --------------------------- */
    const roundLabel =
        step === '1-1' ? 'Round 1 - 단어 확인' : step === '1-2' ? 'Round 1 - 빈칸 학습' : 'Round 1 - 학습 채점';

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
            {/* 헤더 */}
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
                    <Image source={require('../../../assets/shift.png')} style={styles.backIcon} resizeMode="contain" />
                </Pressable>

                <View style={styles.headerTopRow}>
                    <View style={styles.titleRow}>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <Text style={styles.headerSubtitle}>{roundLabel}</Text>
                    </View>

                    <Text style={styles.scoreText}>
                        {correctCount}/{totalBars}
                    </Text>
                </View>


                <View style={styles.barsRow}>
                    {barStates.map((s, i) => {
                        const bg =
                            s === 'correct' ? CORRECT_BG : s === 'wrong' ? WRONG_BG : '#E5E7EB';
                        return <View key={i} style={[styles.bar, { backgroundColor: bg }]} />;
                    })}
                </View>
            </View>

            {/* 본문: 왼쪽 카드 + 오른쪽 카드 */}
            <View style={styles.content}>
                {leftCard}
                {rightCard}
            </View>
        </KeyboardAvoidingView>
    );
}

/** ---------------------------
 *  Helpers
 * --------------------------- */

function normalize(s: string) {
    return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

type Token =
    | { type: 'text'; value: string }
    | { type: 'space'; value: string }
    | { type: 'newline'; value: '\n' }
    | { type: 'keyword'; value: string };

function tokenizeWithKeywords(text: string, keywords: string[]): Token[] {
    // 긴 키워드 먼저 매칭
    const sorted = [...keywords].sort((a, b) => b.length - a.length);

    const out: Token[] = [];
    let i = 0;

    while (i < text.length) {
        const ch = text[i];

        if (ch === '\n') {
            out.push({ type: 'newline', value: '\n' });
            i += 1;
            continue;
        }

        // 공백/탭
        if (ch === ' ' || ch === '\t') {
            let j = i;
            while (j < text.length && (text[j] === ' ' || text[j] === '\t')) j++;
            out.push({ type: 'space', value: text.slice(i, j) });
            i = j;
            continue;
        }

        // 키워드 매칭
        let matched: string | null = null;
        for (const kw of sorted) {
            if (text.startsWith(kw, i)) {
                matched = kw;
                break;
            }
        }
        if (matched) {
            out.push({ type: 'keyword', value: matched });
            i += matched.length;
            continue;
        }

        // 일반 텍스트: 다음 공백/줄바꿈/키워드 시작 전까지
        let j = i + 1;
        while (j < text.length) {
            if (text[j] === '\n' || text[j] === ' ' || text[j] === '\t') break;

            // 다음 위치에서 키워드가 시작되면 끊기
            let willBreak = false;
            for (const kw of sorted) {
                if (text.startsWith(kw, j)) {
                    willBreak = true;
                    break;
                }
            }
            if (willBreak) break;

            j++;
        }
        out.push({ type: 'text', value: text.slice(i, j) });
        i = j;
    }

    return out;
}

function GuideRow({ title, desc }: { title: string; desc: string }) {
    return (
        <View style={styles.guideRow}>
            <Text style={styles.guideTitle}>{title}</Text>
            <Text style={styles.guideDesc}>{desc}</Text>
        </View>
    );
}

/** ---------------------------
 *  Styles
 * --------------------------- */

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
        paddingHorizontal: scale(18),
        paddingTop: scale(16),
        paddingBottom: scale(16),
        gap: scale(12),
    },

    /** Header */
    header: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
        borderRadius: 0,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },

    backBtn: {
        position: 'absolute',
        left: scale(0),
        top: scale(0),
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },

    backIcon: {
        width: scale(16),
        height: scale(16),
        transform: [{ rotate: '180deg' }],
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: scale(10),
        paddingLeft: scale(44),
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8), // 제목과 Round 사이 간격
        flex: 1,
    },

    headerTitle: {
        fontSize: fontScale(16),
        fontWeight: '900',
        color: '#111827',
    },
    headerSubtitle: {
        marginTop: scale(4),
        fontSize: fontScale(12),
        fontWeight: '800',
        color: '#111827',
        opacity: 0.75,
    },
    scoreText: {
        fontSize: fontScale(12),
        fontWeight: '900',
        color: '#111827',
        paddingTop: scale(2),
    },
    barsRow: {
        marginTop: scale(10),
        flexDirection: 'row',
        gap: scale(4),
    },
    bar: {
        flex: 1,
        height: scale(10),
        borderRadius: scale(3),
    },

    /** Content */
    content: {
        flex: 1,
        flexDirection: 'row',
        gap: scale(12),
    },

    /** Left Card */
    leftCard: {
        width: scale(160),
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: scale(16),
        paddingHorizontal: scale(12),
        paddingVertical: scale(12),
    },
    leftTitle: {
        fontSize: fontScale(13),
        fontWeight: '900',
        color: '#111827',
        marginBottom: scale(10),
    },
    guideRow: {
        marginBottom: scale(10),
        paddingBottom: scale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    guideTitle: {
        fontSize: fontScale(12),
        fontWeight: '900',
        color: '#111827',
    },
    guideDesc: {
        marginTop: scale(4),
        fontSize: fontScale(10),
        fontWeight: '700',
        color: MUTED,
        lineHeight: fontScale(14),
    },
    leftBtnGroup: {
        marginTop: scale(10),
        gap: scale(8),
    },
    leftSecondaryBtn: {
        height: scale(40),
        borderRadius: scale(12),
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftSecondaryText: {
        fontSize: fontScale(11),
        fontWeight: '900',
        color: '#3B82F6',
    },
    leftPrimaryBtn: {
        height: scale(44),
        borderRadius: scale(12),
        backgroundColor: '#5E82FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftPrimaryText: {
        fontSize: fontScale(11),
        fontWeight: '900',
        color: '#FFFFFF',
    },

    meaningBox: {
        marginTop: scale(12),
        paddingTop: scale(12),
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    meaningTitle: {
        fontSize: fontScale(11),
        fontWeight: '900',
        color: '#111827',
        marginBottom: scale(6),
    },
    meaningWord: {
        fontSize: fontScale(12),
        fontWeight: '900',
        color: '#111827',
        marginBottom: scale(6),
    },
    meaningText: {
        fontSize: fontScale(10),
        fontWeight: '700',
        color: MUTED,
        lineHeight: fontScale(14),
    },
    meaningPlaceholder: {
        fontSize: fontScale(10),
        fontWeight: '700',
        color: MUTED,
        lineHeight: fontScale(14),
    },

    /** Right Card (Text only) */
    rightCard: {
        flex: 1,
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: scale(16),
        overflow: 'hidden',
    },
    textContainer: {
        paddingHorizontal: scale(14),
        paddingVertical: scale(14),
    },

    // “글만” 영역: inline처럼 보이도록 flexWrap 사용
    flow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    newline: {
        width: '100%',
        height: fontScale(14),
    },

    bodyText: {
        fontSize: fontScale(13),
        lineHeight: fontScale(20),
        fontWeight: '600',
        color: '#111827',
    },

    /** 1-1 / 1-3 단어 표시 (배경 직사각형) */
    wordPill: {
        paddingHorizontal: scale(6),
        paddingVertical: scale(2),
        borderRadius: scale(6),
        marginVertical: scale(1),
    },
    wordText: {
        fontSize: fontScale(13),
        lineHeight: fontScale(20),
        fontWeight: '900',
        color: '#111827',
    },

    /** 1-2 빈칸: 밑줄 없이 빈 직사각형 칸 */
    blankBox: {
        minWidth: scale(70),
        height: scale(24),
        borderRadius: scale(6),
        marginVertical: scale(2),
        justifyContent: 'center',
        paddingHorizontal: scale(6),
    },
    blankBoxActive: {
        borderWidth: 2,
        borderColor: '#5E82FF',
    },
    blankInput: {
        padding: 0,
        margin: 0,
        fontSize: fontScale(13),
        fontWeight: '800',
        color: '#111827',
    },
});
