// src/api/ocr.ts
export type OcrResponse =
    | { status: 'success'; text: string }
    | { status: 'error'; message: string };

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export async function runOcr(fileUri: string) {
    const form = new FormData();
    form.append('file', {
        uri: fileUri,
        name: 'image.jpg',
        type: 'image/jpeg',
    } as any);

    const res = await fetch(`${API_BASE}/ocr`, {
        method: 'POST',
        body: form,
        // Content-Type 수동 지정하지 마세요 (boundary 자동)
    });

    if (!res.ok) throw new Error(`OCR HTTP ${res.status}`);
    const data = (await res.json()) as OcrResponse;

    if (data.status === 'error') throw new Error(data.message);
    return data.text;
}

// ocr_app.py의 /save-test 스펙에 맞춤 (지금은 선택적으로만 사용)
export type SaveTestRequest = {
    subject_name: string;
    original: string;
    quiz: string;
    answers: string[];
};

export async function saveTest(payload: SaveTestRequest) {
    const res = await fetch(`${API_BASE}/save-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // 쿠키 기반이면 web에선 credentials 필요하지만, 현재 user_email은 Optional이라 우선 없이 진행 가능
    });

    if (!res.ok) throw new Error(`SAVE HTTP ${res.status}`);
    return res.json();
}
