// src/data/learningTypeTest.ts

// 축: 장독립/장의존 + 숙고/충동
export type AxisScore = {
    field?: 1 | -1; // +1: 장독립, -1: 장의존
    tempo?: 1 | -1; // +1: 숙고, -1: 충동
};

export type Question = {
    id: number;
    text: string;
    yes: AxisScore; // O 눌렀을 때 반영
    no: AxisScore;  // X 눌렀을 때 반영
};

// 여기만 수정하면 질문/점수가 바뀜
export const questions: Question[] = [
    {
        id: 1,
        text: '학원보다는 혼자서 공부하는 게 더 편해요.',
        yes: { field: 1 },
        no: { field: -1 },
    },
    {
        id: 2,
        text: '설명을 듣기보다는 직접 문제를 풀어보면서 이해하는 편이에요.',
        yes: { field: 1 },
        no: { field: -1 },
    },
    {
        id: 3,
        text: '처음 보는 문제라도 일단 풀어보고 나중에 다시 정리하는 편이에요.',
        yes: { tempo: -1 },
        no: { tempo: 1 },
    },
    {
        id: 4,
        text: '여러 사람이랑 같이 공부하면 오히려 더 집중이 잘 돼요.',
        yes: { field: -1 },
        no: { field: 1 },
    },
    {
        id: 5,
        text: '정답을 내기 전에, 왜 이런 답이 나오는지부터 생각해보는 편이에요.',
        yes: { tempo: 1 },
        no: { tempo: -1 },
    },
    {
        id: 6,
        text: '혼자 계획 세우고 스스로 체크하면서 공부하는 게 익숙해요.',
        yes: { field: 1 },
        no: { field: -1 },
    },
    {
        id: 7,
        text: '시간이 조금 걸리더라도 실수를 줄이는 게 더 중요해요.',
        yes: { tempo: 1 },
        no: { tempo: -1 },
    },
    {
        id: 8,
        text: '친구나 선생님이 옆에서 도와주면 공부가 훨씬 잘 돼요.',
        yes: { field: -1 },
        no: { field: 1 },
    },
    {
        id: 9,
        text: '모르는 문제가 나오면, 일단 찍더라도 답을 먼저 고르는 편이에요.',
        yes: { tempo: -1 },
        no: { tempo: 1 },
    },
    {
        id: 10,
        text: '여러 자료를 비교하면서, 스스로 정리하는 걸 좋아해요.',
        yes: { field: 1 },
        no: { field: -1 },
    },
    {
        id: 11,
        text: '한 번에 많은 양을 빠르게 보고 넘어가는 편이에요.',
        yes: { tempo: -1 },
        no: { tempo: 1 },
    },
    {
        id: 12,
        text: '혼자 있는 조용한 공간에서 공부할 때 실력이 더 잘 나오는 것 같아요.',
        yes: { field: 1 },
        no: { field: -1 },
    },
    {
        id: 13,
        text: '틀려도 괜찮으니, 일단 시도해보는 게 더 중요하다고 생각해요.',
        yes: { tempo: -1 },
        no: { tempo: 1 },
    },
    {
        id: 14,
        text: '다른 사람과 의견을 나누면서 이해가 더 잘 되는 편이에요.',
        yes: { field: -1 },
        no: { field: 1 },
    },
    {
        id: 15,
        text: '답을 내기 전에, 문제를 여러 각도에서 천천히 살펴봐요.',
        yes: { tempo: 1 },
        no: { tempo: -1 },
    },
    {
        id: 16,
        text: '누가 시키지 않아도 스스로 계획을 세우고 실천하는 편이에요.',
        yes: { field: 1 },
        no: { field: -1 },
    },
    {
        id: 17,
        text: '시험에서는 속도보다 정확도가 더 중요하다고 느껴요.',
        yes: { tempo: 1 },
        no: { tempo: -1 },
    },
    {
        id: 18,
        text: '스터디나 그룹 활동이 있을 때 더 동기부여가 돼요.',
        yes: { field: -1 },
        no: { field: 1 },
    },
    {
        id: 19,
        text: '생각이 다 정리되지 않아도, 우선 답부터 쓰고 보는 편이에요.',
        yes: { tempo: -1 },
        no: { tempo: 1 },
    },
    {
        id: 20,
        text: '혼자서 공부 루틴을 점검하고 수정하는 걸 자주 해요.',
        yes: { field: 1 },
        no: { field: -1 },
    },
];

export type RawScore = {
    field: number; // +면 장독립 쪽, -면 장의존 쪽
    tempo: number; // +면 숙고, -면 충동
};

export type LearnerTypeKey = 'FI_R' | 'FD_R' | 'FI_I' | 'FD_I';

export type ResultStats = {
    fieldIndependent: number;
    fieldDependent: number;
    reflective: number;
    impulsive: number;
    typeKey: LearnerTypeKey;
};

const maxField = questions.reduce((sum, q) => {
    const yes = Math.abs(q.yes.field ?? 0);
    const no = Math.abs(q.no.field ?? 0);
    return sum + Math.max(yes, no);
}, 0);

const maxTempo = questions.reduce((sum, q) => {
    const yes = Math.abs(q.yes.tempo ?? 0);
    const no = Math.abs(q.no.tempo ?? 0);
    return sum + Math.max(yes, no);
}, 0);

export function applyAnswer(
    prev: RawScore,
    questionIndex: number,
    answer: 'yes' | 'no',
): RawScore {
    const q = questions[questionIndex];
    const delta = answer === 'yes' ? q.yes : q.no;
    return {
        field: prev.field + (delta.field ?? 0),
        tempo: prev.tempo + (delta.tempo ?? 0),
    };
}

function scoreToPercent(score: number, max: number): number {
    if (max === 0) return 50;
    const clamped = Math.max(-max, Math.min(max, score));
    return Math.round(((clamped + max) / (2 * max)) * 100); // -max~+max → 0~100
}

export function toResult(raw: RawScore): ResultStats {
    const fieldIndependent = scoreToPercent(raw.field, maxField);
    const reflective = scoreToPercent(raw.tempo, maxTempo);
    const fieldDependent = 100 - fieldIndependent;
    const impulsive = 100 - reflective;

    const fieldType = fieldIndependent >= 50 ? 'FI' : 'FD';
    const tempoType = reflective >= 50 ? 'R' : 'I';
    const typeKey = `${fieldType}_${tempoType}` as LearnerTypeKey;

    return {
        fieldIndependent,
        fieldDependent,
        reflective,
        impulsive,
        typeKey,
    };
}

// --------- 결과 화면에서 쓸 프로필 정보 ---------

export type TypeProfile = {
    key: LearnerTypeKey;
    label: string;      // 예: "장독립·숙고형"
    title: string;      // 예: "분석형 학습자"
    tags: string[];     // 예: ["논리적", "자기주도", "탐구형"]
    summary: string;
};


export const typeProfiles: Record<LearnerTypeKey, TypeProfile> = {
    FI_R: {
        key: 'FI_R',
        label: '장독립·숙고형',
        title: '분석형 학습자',
        tags: ['논리적', '자기주도', '탐구형'],
        summary:
            '논리적으로 구조를 이해하고, 근거를 따져보며 깊이 있게 공부하는 스타일이에요.',
    },
    FD_R: {
        key: 'FD_R',
        label: '장의존·숙고형',
        title: '협력형 학습자',
        tags: ['협력적', '성실한', '계획형'],
        summary:
            '사람과 함께 공부할 때 더 안정감을 느끼고, 차분하게 과정을 따라가는 스타일이에요.',
    },
    FI_I: {
        key: 'FI_I',
        label: '장독립·충동형',
        title: '창의형 학습자',
        tags: ['아이디어', '실험적', '도전적'],
        summary:
            '새로운 시도와 실험을 좋아하고, 스스로 다양한 방법을 만들어 보는 스타일이에요.',
    },
    FD_I: {
        key: 'FD_I',
        label: '장의존·충동형',
        title: '사회형 학습자',
        tags: ['사교적', '에너지', '참여형'],
        summary:
            '사람들과 어울리며 공부할 때 동기부여가 잘 되고, 활동적인 학습에서 힘을 발휘해요.',
    },
};
