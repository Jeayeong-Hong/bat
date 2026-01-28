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
    Modal,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';
import { saveTest } from '../../api/ocr';

type Round = 1 | 2 | 3;
type SubStep = 1 | 2 | 3;
type Step = '1-1' | '1-2' | '1-3' | '2-1' | '2-2' | '2-3' | '3-1' | '3-2' | '3-3';
type GradeState = 'idle' | 'correct' | 'wrong';

const ROUND_CONFIGS = {
    1: { start: 0, end: 5, total: 5 },
    2: { start: 5, end: 12, total: 12 },
    3: { start: 12, end: 20, total: 20 },
};

const getCurrentRound = (step: Step): Round => {
    return parseInt(step.split('-')[0]) as Round;
};

const getCurrentSubStep = (step: Step): SubStep => {
    return parseInt(step.split('-')[1]) as SubStep;
};

export type BlankItem = {
    id: number;
    word: string;
    meaningLong?: string;
};

export type ScaffoldingPayload = {
    title: string;
    extractedText: string;
    blanks: BlankItem[];
};

type Props = {
    onBack: () => void;
    sources: ImageSourcePropType[];
    selectedIndex: number;

    payload: ScaffoldingPayload | null;
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    onSave?: (answers: string[]) => Promise<void>;
};

const BG = '#F6F7FB';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';

const HIGHLIGHT_BG = '#C7CFFF';
const CORRECT_BG = '#C5FFBA';
const WRONG_BG = '#FF9CAD';

export default function ScaffoldingScreen({
    onBack,
    payload,
    loading,
    error,
    onRetry,
    onSave,
}: Props) {
    /** 로딩/에러 */
    if (loading) {
        return (
            <View style={[styles.root, styles.center]}>
                <Text style={styles.loadingText}>OCR 결과를 불러오는 중입니다…</Text>
            </View>
        );
    }
    if (error || !payload) {
        return (
            <View style={[styles.root, styles.center, { paddingHorizontal: scale(18) }]}>
                <Text style={styles.errorTitle}>데이터를 불러오지 못했습니다.</Text>
                {!!error && <Text style={styles.errorDesc}>{error}</Text>}

                <Pressable style={styles.retryBtn} onPress={onRetry}>
                    <Text style={styles.retryBtnText}>다시 시도</Text>
                </Pressable>

                <Pressable style={styles.backOnlyBtn} onPress={onBack}>
                    <Text style={styles.backOnlyBtnText}>뒤로가기</Text>
                </Pressable>
            </View>
        );
    }

    const [step, setStep] = useState<Step>('1-1');
    const [cumulativeCorrect, setCumulativeCorrect] = useState<Set<number>>(new Set());

    const title = payload.title ?? '';
    const extractedText = payload.extractedText ?? '';
    const blankDefs = payload.blanks ?? [];

    /** 뜻(지금은 meaningLong만) 모달 */
    const [selectedWord, setSelectedWord] = useState<BlankItem | null>(null);

    /** 키워드 목록 */
    const keywordList = useMemo(() => blankDefs.map((b) => b.word), [blankDefs]);
    const baseInfoByWord = useMemo(() => {
        const m = new Map<string, BlankItem>();
        blankDefs.forEach((b) => {
            if (!m.has(b.word)) m.set(b.word, b);
        });
        return m;
    }, [blankDefs]);

    /** ✅ 핵심: 중복 단어도 등장마다 instanceId를 부여해서 “각 칸이 독립 입력” 되게 함 */
    const tokens = useMemo(() => {
        const raw = tokenizeWithKeywords(extractedText, keywordList);
        let seq = 1;
        return raw.map((t) => (t.type === 'keyword' ? { ...t, instanceId: seq++ } : t));
    }, [extractedText, keywordList]);

    const keywordInstances = useMemo(() => {
        return tokens
            .filter((t): t is KeywordTokenWithId => t.type === 'keyword')
            .map((t) => ({
                instanceId: t.instanceId,
                word: t.value,
                base: baseInfoByWord.get(t.value) ?? null,
            }));
    }, [tokens, baseInfoByWord]);

    const currentRoundKeywords = useMemo(() => {
        const round = getCurrentRound(step);
        const config = ROUND_CONFIGS[round];
        return keywordInstances.slice(config.start, config.end);
    }, [step, keywordInstances]);

    /** 입력/채점 상태: instanceId 기준 */
    const inputRefs = useRef<Record<number, TextInput | null>>({});
    const [activeBlankId, setActiveBlankId] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [graded, setGraded] = useState<Record<number, GradeState>>({});

    const round = getCurrentRound(step);
    const subStep = getCurrentSubStep(step);
    const totalBars = ROUND_CONFIGS[round].total;
    const correctCount = cumulativeCorrect.size;

    const barStates: GradeState[] = useMemo(() => {
        const arr: GradeState[] = Array.from({ length: totalBars }, () => 'idle');
        if (subStep !== 3) return arr;
        keywordInstances.slice(0, totalBars).forEach((ins, idx) => {
            arr[idx] = cumulativeCorrect.has(ins.instanceId) ? 'correct' : 'wrong';
        });
        return arr;
    }, [keywordInstances, cumulativeCorrect, subStep, totalBars]);

    const roundLabel = `Round ${round} - ${subStep === 1 ? '단어 확인' : subStep === 2 ? '빈칸 학습' : '학습 채점'}`;

    const onReselectWords = () => {
        Alert.alert('단어 재선정', '추후 백엔드/AI 단어 재선정 API로 교체할 예정입니다.');
    };
    const onStartLearning = () => {
        setSelectedWord(null);
        setStep(`${round}-2` as Step);
    };
    const onLongPressBlank = () => {
        Alert.alert('힌트', '추후 기능입니다. (롱프레스 로직만 구현됨)');
    };
    const onPressBlank = (instanceId: number) => {
        setActiveBlankId(instanceId);
        requestAnimationFrame(() => inputRefs.current[instanceId]?.focus());
    };
    const onGrade = () => {
        const newCorrect = new Set(cumulativeCorrect);
        const next: Record<number, GradeState> = {};

        currentRoundKeywords.forEach((ins) => {
            const user = (answers[ins.instanceId] ?? '').trim();
            if (normalize(user) === normalize(ins.word)) {
                newCorrect.add(ins.instanceId);
            }
            next[ins.instanceId] = newCorrect.has(ins.instanceId) ? 'correct' : 'wrong';
        });

        setCumulativeCorrect(newCorrect);
        setGraded(next);
        setStep(`${round}-3` as Step);
    };

    /** 왼쪽 설명 카드(상/하 색 분리) */
    const HelpChip = () => {
        if (subStep === 2) {
            return (
                <>
                    <View style={styles.helpBox}>
                        <View style={[styles.helpHeader, { backgroundColor: HIGHLIGHT_BG }]}>
                            <Text style={styles.helpTitle}>빈칸 터치하기</Text>
                        </View>
                        <View style={styles.helpBody}>
                            <Text style={styles.helpDesc}>빈칸의 정답을</Text>
                            <Text style={[styles.helpDesc, styles.helpDescBottom]}>입력할 수 있어요!</Text>
                        </View>
                    </View>
                    <View style={styles.helpBox}>
                        <View style={[styles.helpHeader, { backgroundColor: HIGHLIGHT_BG }]}>
                            <Text style={styles.helpTitle}>빈칸 꾹 누르기</Text>
                        </View>
                        <View style={styles.helpBody}>
                            <Text style={styles.helpDesc}>H1을 누르면 첫글자,</Text>
                            <Text style={[styles.helpDesc, styles.helpDescBottom]}>H2를 누르면 마지막글자,</Text>
                            <Text style={[styles.helpDesc, styles.helpDescBottom]}>H3을 누르면 전체 단어의</Text>
                            <Text style={[styles.helpDesc, styles.helpDescBottom]}>초성이 제공돼요!</Text>
                        </View>
                    </View>
                </>
            );
        }

        const titleText = subStep === 1 ? '단어 터치하기' : '결과 확인';
        const descTop = subStep === 1 ? '단어를 터치하면' : '단어를 터치하면';
        const descBottom = subStep === 1 ? '의미를 확인할 수 있어요!' : '의미를 다시 확인할 수 있어요.';

        return (
            <View style={styles.helpBox}>
                <View style={styles.helpHeader}>
                    <Text style={styles.helpTitle}>{titleText}</Text>
                </View>
                <View style={styles.helpBody}>
                    <Text style={styles.helpDesc}>{descTop}</Text>
                    <Text style={[styles.helpDesc, styles.helpDescBottom]}>{descBottom}</Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
            {/* 상단(카드 아님) */}
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
                    {Array.from({ length: totalBars }).map((_, i) => {
                        const s = barStates[i] ?? 'idle';
                        const bg = s === 'correct' ? CORRECT_BG : s === 'wrong' ? WRONG_BG : '#E5E7EB';
                        return <View key={i} style={[styles.bar, { backgroundColor: bg }]} />;
                    })}
                </View>
            </View>

            <View style={styles.content}>
                {/* 왼쪽 카드 */}
                <View style={styles.leftCard}>
                    <HelpChip />

                    {subStep === 1 && (
                        <View style={styles.buttonGroup}>
                            <Pressable style={styles.imgBtnWrap} onPress={onReselectWords}>
                                <Image
                                    source={require('../../../assets/study/re-selection-button.png')}
                                    style={styles.reselectImg}
                                    resizeMode="contain"
                                />
                            </Pressable>
                            <Pressable style={styles.imgBtnWrap} onPress={onStartLearning}>
                                <Image
                                    source={require('../../../assets/study/start-study-button.png')}
                                    style={styles.startImg}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        </View>
                    )}

                    {subStep === 2 && (
                        <View style={styles.buttonGroup}>
                            <Pressable style={styles.imgBtnWrap} onPress={onGrade}>
                                <Image
                                    source={require('../../../assets/study/grade-button.png')}
                                    style={styles.startImg}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        </View>
                    )}

                    {subStep === 3 && round < 3 && (
                        <Pressable
                            style={styles.primaryRectBtn}
                            onPress={() => {
                                setStep(`${round + 1}-1` as Step);
                            }}
                        >
                            <Text style={styles.primaryRectBtnText}>Round {round + 1}</Text>
                        </Pressable>
                    )}

                    {step === '3-3' && (
                        <Pressable
                            style={styles.primaryRectBtn}
                            onPress={async () => {
                                if (onSave) {
                                    try {
                                        const answerList = keywordInstances.slice(0, 20).map((ins) =>
                                            answers[ins.instanceId] ?? ''
                                        );
                                        await onSave(answerList);
                                        Alert.alert('학습 완료!', '축하합니다! 리워드를 획득했습니다.', [
                                            { text: '확인', onPress: onBack }
                                        ]);
                                    } catch (e: any) {
                                        Alert.alert('저장 실패', e?.message ?? '알 수 없는 오류가 발생했습니다.');
                                    }
                                } else {
                                    Alert.alert('학습 완료!', '축하합니다!', [
                                        { text: '확인', onPress: onBack }
                                    ]);
                                }
                            }}
                        >
                            <Text style={styles.primaryRectBtnText}>학습 완료</Text>
                        </Pressable>
                    )}
                </View>

                {/* 오른쪽 카드(글만) */}
                <View style={styles.rightCard}>
                    <ScrollView contentContainerStyle={styles.textContainer}>
                        <View style={styles.flow}>
                            {tokens.map((t, idx) => {
                                if (t.type === 'newline') return <View key={idx} style={styles.newline} />;
                                if (t.type === 'space') return <Text key={idx}>{t.value}</Text>;
                                if (t.type === 'text') return <Text key={idx} style={styles.bodyText}>{t.value}</Text>;

                                const base = baseInfoByWord.get(t.value) ?? null;
                                const instanceId = t.instanceId;
                                const grade = graded[instanceId] ?? 'idle';
                                const userValue = answers[instanceId] ?? '';

                                if (subStep === 1) {
                                    return (
                                        <Pressable
                                            key={idx}
                                            onPress={() => base && setSelectedWord(base)}
                                            style={[styles.wordPill, { backgroundColor: HIGHLIGHT_BG }]}
                                        >
                                            <Text style={styles.wordText}>{t.value}</Text>
                                        </Pressable>
                                    );
                                }

                                if (subStep === 2) {
                                    const isActive = activeBlankId === instanceId;
                                    return (
                                        <Pressable
                                            key={idx}
                                            onPress={() => onPressBlank(instanceId)}
                                            onLongPress={onLongPressBlank}
                                            delayLongPress={450}
                                            style={[styles.wordPill, { backgroundColor: HIGHLIGHT_BG }, isActive && styles.blankBoxActive]}
                                        >
                                            <View style={{ position: 'relative' }}>
                                                <Text style={[styles.wordText, { opacity: 0 }]}>{t.value}</Text>
                                                <TextInput
                                                    ref={(r) => { if (r) inputRefs.current[instanceId] = r; }}
                                                    value={userValue}
                                                    onChangeText={(v) => setAnswers((prev) => ({ ...prev, [instanceId]: v }))}
                                                    style={[styles.blankInput, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
                                                    blurOnSubmit
                                                    onBlur={() => setActiveBlankId((prev) => (prev === instanceId ? null : prev))}
                                                />
                                            </View>
                                        </Pressable>
                                    );
                                }

                                const bg =
                                    grade === 'correct' ? CORRECT_BG : grade === 'wrong' ? WRONG_BG : HIGHLIGHT_BG;

                                return (
                                    <Pressable
                                        key={idx}
                                        onPress={() => base && setSelectedWord(base)}
                                        style={[styles.wordPill, { backgroundColor: bg }]}
                                    >
                                        <Text style={styles.wordText}>{t.value}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* 뜻 모달 */}
            <Modal visible={!!selectedWord} transparent animationType="fade" onRequestClose={() => setSelectedWord(null)}>
                <Pressable style={styles.modalOverlay} onPress={() => setSelectedWord(null)}>
                    <Pressable style={styles.modalCard} onPress={() => { }}>
                        <Pressable style={styles.modalClose} onPress={() => setSelectedWord(null)} hitSlop={10}>
                            <Text style={styles.modalCloseText}>×</Text>
                        </Pressable>

                        <Text style={styles.modalWord}>{selectedWord?.word ?? ''}</Text>
                        <Text style={styles.modalLong}>{selectedWord?.meaningLong ?? '추후 AI 의미 API로 교체 예정입니다.'}</Text>
                    </Pressable>
                </Pressable>
            </Modal>
        </KeyboardAvoidingView>
    );
}

/** Tokenize */
type Token =
    | { type: 'text'; value: string }
    | { type: 'space'; value: string }
    | { type: 'newline'; value: '\n' }
    | { type: 'keyword'; value: string; occ: number };

type KeywordTokenWithId = { type: 'keyword'; value: string; occ: number; instanceId: number };

function tokenizeWithKeywords(text: string, keywords: string[]): Token[] {
    const sorted = [...keywords].filter(Boolean).sort((a, b) => b.length - a.length);
    const out: Token[] = [];
    const occMap = new Map<string, number>();
    let i = 0;

    while (i < text.length) {
        const ch = text[i];

        if (ch === '\n') {
            out.push({ type: 'newline', value: '\n' });
            i += 1;
            continue;
        }

        if (ch === ' ' || ch === '\t') {
            let j = i;
            while (j < text.length && (text[j] === ' ' || text[j] === '\t')) j++;
            out.push({ type: 'space', value: text.slice(i, j) });
            i = j;
            continue;
        }

        let matched: string | null = null;
        for (const kw of sorted) {
            if (kw && text.startsWith(kw, i)) {
                matched = kw;
                break;
            }
        }

        if (matched) {
            const prev = occMap.get(matched) ?? 0;
            const nextOcc = prev + 1;
            occMap.set(matched, nextOcc);
            out.push({ type: 'keyword', value: matched, occ: nextOcc });
            i += matched.length;
            continue;
        }

        let j = i + 1;
        while (j < text.length) {
            if (text[j] === '\n' || text[j] === ' ' || text[j] === '\t') break;

            let willBreak = false;
            for (const kw of sorted) {
                if (kw && text.startsWith(kw, j)) {
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

function normalize(s: string) {
    return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Styles */
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
        paddingHorizontal: scale(18),
        paddingTop: scale(16),
        paddingBottom: scale(16),
        gap: scale(12),
    },
    center: { justifyContent: 'center', alignItems: 'center' },

    loadingText: { color: MUTED, fontSize: fontScale(12), fontWeight: '700' },

    errorTitle: { color: '#111827', fontSize: fontScale(16), fontWeight: '900', marginBottom: scale(8) },
    errorDesc: { color: MUTED, fontSize: fontScale(12), fontWeight: '700', textAlign: 'center', marginBottom: scale(16) },
    retryBtn: {
        width: '100%',
        maxWidth: scale(320),
        height: scale(48),
        borderRadius: scale(14),
        backgroundColor: '#5E82FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scale(10),
    },
    retryBtnText: { color: '#FFFFFF', fontSize: fontScale(12), fontWeight: '900' },
    backOnlyBtn: {
        width: '100%',
        maxWidth: scale(320),
        height: scale(48),
        borderRadius: scale(14),
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backOnlyBtnText: { color: '#111827', fontSize: fontScale(12), fontWeight: '900' },

    header: { backgroundColor: 'transparent' },
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
    backIcon: { width: scale(16), height: scale(16), transform: [{ rotate: '180deg' }] },

    headerTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: scale(10), paddingLeft: scale(44) },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: scale(8), flex: 1 },
    headerTitle: { fontSize: fontScale(16), fontWeight: '900', color: '#111827' },
    headerSubtitle: { fontSize: fontScale(12), fontWeight: '800', color: '#111827', opacity: 0.75 },
    scoreText: { fontSize: fontScale(16), fontWeight: '900', color: '#9CA3AF', paddingTop: scale(2) },

    barsRow: { marginTop: scale(8), flexDirection: 'row', gap: scale(4) },
    bar: { flex: 1, height: scale(10), borderRadius: scale(3) },

    content: { flex: 1, flexDirection: 'row', gap: scale(12) },

    leftCard: {
        width: scale(170),
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: scale(16),
        paddingHorizontal: scale(12),
        paddingVertical: scale(12),
        gap: scale(12),
        justifyContent: 'flex-start',
    },

    buttonGroup: {
        marginTop: 'auto',
        gap: scale(12),
    },

    helpBox: {
        borderRadius: scale(14),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D6DBFF',
        overflow: 'hidden',
    },
    helpHeader: {
        backgroundColor: '#EEF1FF',
        paddingHorizontal: scale(12),
        paddingVertical: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpBody: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: scale(12),
        paddingVertical: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#D6DBFF',
    },
    helpTitle: { fontSize: fontScale(13), fontWeight: '900', color: '#111827', textAlign: 'center' },
    helpDesc: { fontSize: fontScale(11), fontWeight: '700', color: MUTED, lineHeight: fontScale(16), textAlign: 'center' },
    helpDescBottom: { marginTop: scale(2) },

    imgBtnWrap: { width: '100%', alignItems: 'center' },
    reselectImg: { width: '100%', height: scale(70) },
    startImg: { width: '100%', height: scale(110) },

    primaryRectBtn: {
        width: '100%',
        height: scale(52),
        borderRadius: scale(14),
        backgroundColor: '#5E82FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryRectBtnText: { color: '#FFFFFF', fontSize: fontScale(12), fontWeight: '900' },

    rightCard: { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: scale(16), overflow: 'hidden' },
    textContainer: { paddingHorizontal: scale(14), paddingVertical: scale(14) },
    flow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
    newline: { width: '100%', height: fontScale(14) },
    bodyText: { fontSize: fontScale(14), lineHeight: fontScale(22), fontWeight: '600', color: '#111827' },

    wordPill: { paddingHorizontal: 0, paddingVertical: 0, borderRadius: scale(4), marginVertical: 0 },
    wordText: { fontSize: fontScale(13), lineHeight: fontScale(20), fontWeight: '600', color: '#111827' },

    blankBox: { paddingHorizontal: 0, paddingVertical: 0, borderRadius: scale(4), marginVertical: 0, justifyContent: 'center' },
    blankBoxActive: { borderWidth: 2, borderColor: '#5E82FF' },
    blankInput: { padding: 0, margin: 0, fontSize: fontScale(13), fontWeight: '600', color: '#111827', lineHeight: fontScale(20) },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: scale(18) },
    modalCard: { width: '100%', maxWidth: scale(430), backgroundColor: '#FFFFFF', borderRadius: scale(16), paddingHorizontal: scale(18), paddingTop: scale(18), paddingBottom: scale(16) },
    modalClose: { position: 'absolute', right: scale(12), top: scale(10), width: scale(32), height: scale(32), borderRadius: scale(16), alignItems: 'center', justifyContent: 'center' },
    modalCloseText: { fontSize: fontScale(22), fontWeight: '900', color: '#9CA3AF' },
    modalWord: { fontSize: fontScale(20), fontWeight: '900', color: '#111827', marginBottom: scale(8) },
    modalLong: { fontSize: fontScale(12), fontWeight: '700', color: '#111827', lineHeight: fontScale(18) },
});
