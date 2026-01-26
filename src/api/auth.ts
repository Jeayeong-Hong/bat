// API Base URL - 실제 백엔드 서버 주소로 변경 필요
const API_BASE_URL = 'http://127.0.0.1:8000';

export interface LoginResponse {
    status: 'success' | 'nickname_required';
    token?: string;
    email: string;
    nickname?: string;
    social_id?: string;
    message: string;
}

export interface SetNicknameResponse {
    status: 'success';
    token: string;
    email: string;
    nickname: string;
    message: string;
}

/**
 * 백엔드 OAuth 엔드포인트에 인가 코드 전송
 */
export async function loginWithOAuth(
    provider: 'kakao' | 'naver',
    code: string
): Promise<LoginResponse> {
    const endpoint = `${API_BASE_URL}/auth/${provider}/mobile`;

    const formData = new FormData();
    formData.append('code', code);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '로그인 실패');
    }

    return await response.json();
}

/**
 * 닉네임 설정
 */
export async function setNickname(
    email: string,
    nickname: string
): Promise<SetNicknameResponse> {
    const endpoint = `${API_BASE_URL}/auth/set-nickname-mobile`;

    const formData = new FormData();
    formData.append('email', email);
    formData.append('nickname', nickname);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '닉네임 설정 실패');
    }

    return await response.json();
}

/**
 * 토큰 검증
 */
export async function verifyToken(token: string): Promise<{
    status: string;
    email: string;
    social_id: string;
}> {
    const endpoint = `${API_BASE_URL}/auth/verify-token`;

    const formData = new FormData();
    formData.append('token', token);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '토큰 검증 실패');
    }

    return await response.json();
}

/**
 * OAuth URL 생성
 */
export function getOAuthUrl(provider: 'kakao' | 'naver'): string {
    // 카카오/네이버 API 키
    const KAKAO_REST_API_KEY = '5202f1b3b542b79fdf499d766362bef6';
    const NAVER_CLIENT_ID = 'DRk2JpSbhKJO6ImkKIE9';

    // 백엔드 리다이렉트 URI 사용 (웹/모바일 모두)
    const REDIRECT_URI = `${API_BASE_URL}/auth/${provider}/mobile`;

    if (provider === 'kakao') {
        return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    } else {
        return `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    }
}

/**
 * 사용자 정보 조회 (계정 연결 상태 포함)
 */
export async function getUserInfo(token: string): Promise<{
    status: string;
    email: string;
    nickname: string;
    kakao_connected: boolean;
    naver_connected: boolean;
    kakao_email: string | null;
    naver_email: string | null;
}> {
    const endpoint = `${API_BASE_URL}/auth/user-info?token=${encodeURIComponent(token)}`;

    const response = await fetch(endpoint, {
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '사용자 정보 조회 실패');
    }

    return await response.json();
}

/**
 * 소셜 계정 연동
 */
export async function connectAccount(
    token: string,
    provider: 'kakao' | 'naver',
    code: string
): Promise<{
    status: string;
    message: string;
    connected_email: string;
}> {
    const endpoint = `${API_BASE_URL}/auth/connect-account`;

    const formData = new FormData();
    formData.append('token', token);
    formData.append('provider', provider);
    formData.append('code', code);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '계정 연동 실패');
    }

    return await response.json();
}

/**
 * 소셜 계정 연동 해제
 */
export async function disconnectAccount(
    token: string,
    provider: 'kakao' | 'naver'
): Promise<{
    status: string;
    message: string;
}> {
    const endpoint = `${API_BASE_URL}/auth/disconnect-account`;

    const formData = new FormData();
    formData.append('token', token);
    formData.append('provider', provider);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '연동 해제 실패');
    }

    return await response.json();
}

/**
 * 회원 탈퇴
 */
export async function withdrawAccount(token: string): Promise<{
    status: string;
    message: string;
}> {
    const endpoint = `${API_BASE_URL}/auth/withdraw`;

    const formData = new FormData();
    formData.append('token', token);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '회원 탈퇴 실패');
    }

    return await response.json();
}

/**
 * 로그아웃
 */
export async function logout(): Promise<{
    status: string;
    message: string;
}> {
    const endpoint = `${API_BASE_URL}/auth/logout`;

    const response = await fetch(endpoint, {
        method: 'POST',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '로그아웃 실패');
    }

    return await response.json();
}

/**
 * 닉네임 변경
 */
export async function updateNickname(
    token: string,
    nickname: string
): Promise<{
    status: string;
    message: string;
}> {
    const endpoint = `${API_BASE_URL}/auth/update-nickname`;

    const formData = new FormData();
    formData.append('token', token);
    formData.append('nickname', nickname);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '닉네임 변경 실패');
    }

    return await response.json();
}
