import React, { useState, useEffect } from 'react';
import { View, ImageSourcePropType } from 'react-native';
import Splash from './src/components/Splash';
import LoginScreen from './src/screens/auth/LoginScreen';
import NicknameScreen from './src/screens/auth/NicknameScreen';
import GoalSettingScreen from './src/screens/goal/GoalSettingScreen';
import TypeIntroScreen from './src/screens/diagnosis/TypeIntroScreen';
import TypeTestScreen from './src/screens/diagnosis/TypeTestScreen';
import TypeResultScreen from './src/screens/diagnosis/TypeResultScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import { ResultStats, typeProfiles } from './src/data/learningTypeTest';
import LeagueScreen, { LeagueTier, LeagueUser, } from './src/screens/league/LeagueScreen';
import AlarmScreen from './src/screens/alarm/AlarmScreen';
import AlarmSettingScreen from './src/screens/alarm/AlarmSettingScreen';
import MyPageScreen from './src/screens/mypage/MyPageScreen';
import TakePicture from './src/screens/input_data/TakePicture';
import SelectPicture from './src/screens/input_data/SelectPicture';
import TalkingStudyScreen from './src/screens/study/TalkingStudyScreen';
import ScaffoldingScreen from './src/screens/study/ScaffoldingScreen';
import { runOcr } from './src/api/ocr';

type SocialProvider = 'kakao' | 'naver';
type Step =
  | 'splash'
  | 'login'
  | 'nickname'
  | 'goal'
  | 'typeIntro'
  | 'typeTest'
  | 'result'
  | 'home'
  | 'league'
  | 'alarm'
  | 'alarmSetting'
  | 'mypage'
  | 'takePicture'
  | 'selectPicture'
  | 'talkingStudy'
  | 'scaffolding';

export default function App() {
  const [step, setStep] = useState<Step>('splash');
  const [nickname, setNickname] = useState('');
  const [typeResult, setTypeResult] = useState<ResultStats | null>(null);
  const [typeLabel, setTypeLabel] = useState(''); // 홈 화면용
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);                 // 연속 학습 일수
  const [lastAttendanceDate, setLastAttendanceDate] = useState<string | null>(null);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [rewardState, setRewardState] = useState({
    baseXP: 0,
    bonusXP: 0,
    showBase: false,
    showBonus: false,
  });
  useEffect(() => {
    if (step === 'home') {
      handleDailyCheckIn();   // 홈 들어오자마자 자동 출석
    }
  }, [step]);

  // 소셜 로그인 처리 함수 (백엔드 연동 자리)
  const handleSocialLogin = async (provider: SocialProvider) => {
    // TODO: 여기서 백엔드 로그인 API 호출 예정
    // 예시:
    // const res = await fetch('https://api.bat-app.com/auth/social', { ... });
    // const data = await res.json();
    // accessToken, refreshToken, isNewUser, nickname 등을 받아서 분기

    // 지금은 기존처럼 "신규 유저 플로우"만 유지
    setStep('nickname');
  };

  const getTodayKey = () => new Date().toISOString().slice(0, 10);

  const hasCheckedInToday = lastAttendanceDate === getTodayKey();

  const handleDailyCheckIn = () => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    if (lastAttendanceDate === todayKey) return; // 이미 출석

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    // 연속 출석 계산
    setStreak((prev) => (lastAttendanceDate === yesterdayKey ? prev + 1 : 1));
    setLastAttendanceDate(todayKey);

    // 주간 출석 배열 업데이트
    const todayIdx = getWeekdayIndex(today);
    setWeekAttendance((prev) => {
      const next = [...prev];
      next[todayIdx] = true;
      return next;
    });

    // XP 보상 로직은 그대로
    const baseXP = 10;
    const bonusXP = Math.random() < 0.5 ? 10 : 0;
    setExp((prev) => prev + baseXP + bonusXP);

    setRewardState({
      baseXP,
      bonusXP,
      showBase: true,
      showBonus: false,
    });
  };
  const handleCloseBaseReward = () => {
    setRewardState((prev) => ({
      ...prev,
      showBase: false,
      showBonus: prev.bonusXP > 0, // 보너스 있으면 다음 모달로
    }));
  };
  const handleCloseBonusReward = () => {
    setRewardState((prev) => ({
      ...prev,
      showBonus: false,
    }));
  };
  const [weekAttendance, setWeekAttendance] = useState<boolean[]>( //이번 주 요일 별 출석
    [false, false, false, false, false, false, false],
  );
  const [currentLeagueTier] = useState<LeagueTier>('iron');  // 우선 아이언으로 시작
  /* 백엔드 연결
  const [leagueUsers] = useState<LeagueUser[]>([]);
  const [leagueRemainingText] = useState<string>('');
  */
  const [leagueUsers] = useState<LeagueUser[]>([
    {
      id: 'u1',
      nickname: '데일리기록러',
      xp: 1200,
      minutesAgo: 51,
    },
    {
      id: 'u2',
      nickname: '공부하는곰돌이',
      xp: 900,
      minutesAgo: 51,
    },
  ]);

  const [leagueRemainingText] = useState<string>(
    '남은 시간: 3일 19시간 30분',
  );        // 예: "남은 시간: 3일 19시간 30분"
  const getWeekdayIndex = (date: Date) => {
    const jsDay = date.getDay(); // 0(일)~6(토)
    return (jsDay + 6) % 7;      // 월0, 화1, ... 일6
  };
  //촬영 결과 임시로 App으로 이동
  const [capturedSources, setCapturedSources] = useState<ImageSourcePropType[]>([]);
  type ScaffoldingPayload = {
    title: string;
    extractedText: string;
    blanks: Array<{ id: number; word: string; meaningLong?: string }>;
  };

  const [scaffoldingPayload, setScaffoldingPayload] = useState<ScaffoldingPayload | null>(null);
  const [scaffoldingLoading, setScaffoldingLoading] = useState(false);
  const [scaffoldingError, setScaffoldingError] = useState<string | null>(null);

  function buildBlankWordsFromText(text: string, limit = 8) {
    // 1) 공백/문장부호 기준 분리
    const raw = text
      .replace(/[0-9]/g, ' ')
      .replace(/[.,!?()\[\]{}"“”‘’]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ');

    // 2) 너무 짧은 토큰 제거 + 중복 제거
    const uniq: string[] = [];
    for (const w of raw) {
      const clean = w.trim();
      if (clean.length < 2) continue;
      if (!uniq.includes(clean)) uniq.push(clean);
      if (uniq.length >= limit) break;
    }
    return uniq;
  }

  return (
    <View style={{ flex: 1 }}>
      {step === 'splash' && (
        <Splash duration={1500} onDone={() => setStep('login')} />
      )}

      {step === 'login' && (
        <LoginScreen onSocialLogin={handleSocialLogin} />
      )}


      {step === 'nickname' && (
        <NicknameScreen
          onConfirm={(name) => {
            setNickname(name);
            setStep('goal');
          }}
        />
      )}

      {step === 'goal' && (
        <GoalSettingScreen
          onSubmit={(goal) => {
            setMonthlyGoal(goal);
            setStep('typeIntro');
          }}
        />
      )}

      {step === 'typeIntro' && (
        <TypeIntroScreen
          nickname={nickname}
          onStartTest={() => setStep('typeTest')}
        />
      )}

      {step === 'typeTest' && (
        <TypeTestScreen
          onFinish={(result) => {
            setTypeResult(result);
            // typeKey 로 프로필 찾아서 title 사용
            const profile = typeProfiles[result.typeKey];
            setTypeLabel(profile.title);
            setStep('result');
          }}
        />
      )}

      {step === 'result' && typeResult && (
        <TypeResultScreen
          nickname={nickname}
          result={typeResult}
          onGoHome={() => setStep('home')}
        />
      )}

      {step === 'home' && (
        <HomeScreen
          nickname={nickname}
          typeLabel={typeLabel}
          level={level}
          exp={exp}
          streak={streak}
          hasCheckedInToday={hasCheckedInToday}
          onCheckIn={handleDailyCheckIn}
          rewardState={rewardState}
          onCloseBaseReward={handleCloseBaseReward}
          onCloseBonusReward={handleCloseBonusReward}
          weekAttendance={weekAttendance}
          onNavigate={(screen) => setStep(screen)}
        />
      )}

      {step === 'league' && (
        <LeagueScreen
          onNavigate={(screen) => setStep(screen)}
          currentTier={currentLeagueTier}
          users={leagueUsers}
          remainingText={leagueRemainingText}
        />
      )}
      {step === 'alarm' && (
        <AlarmScreen
          onNavigate={(screen) => setStep(screen)}
        />
      )}
      {step === 'alarmSetting' && (
        <AlarmSettingScreen
          onNavigate={(screen) => setStep(screen as Step)}
        />
      )}
      {step === 'mypage' && (
        <MyPageScreen
          nickname={nickname}
          typeLabel={typeLabel}
          level={level}
          totalStudyCount={105}   // 우선 더미 값
          continuousDays={100}    // 우선 더미 값
          onNavigate={(screen) => setStep(screen)}
        />
      )}

      {/* 자료입력: 촬영 화면 */}
      {step === 'takePicture' && (
        <TakePicture
          onBack={() => setStep('home')}
          onDone={(sources) => {
            setCapturedSources(sources);
            setStep('selectPicture');
          }}
        />
      )}


      {/* 자료입력: 선택/미리보기(크롭 UI) 화면 */}
      {step === 'selectPicture' && (
        <SelectPicture
          sources={capturedSources}
          onBack={() => setStep('takePicture')}
          onStartLearning={async (finalSources) => {
            setCapturedSources(finalSources);

            // 1) OCR 요청 (ocr_app.py는 file 1개만 받으므로 우선 첫 이미지 사용) :contentReference[oaicite:6]{index=6}
            const first = finalSources[0] as any;
            const uri = first?.uri as string | undefined;

            if (!uri) {
              setScaffoldingError('이미지 URI를 찾을 수 없습니다.');
              setScaffoldingPayload(null);
              setStep('talkingStudy');
              return;
            }

            setScaffoldingLoading(true);
            setScaffoldingError(null);

            try {
              const extractedText = await runOcr(uri);

              // 2) 임시 blank_words 생성 (추후 백엔드 AI 선정으로 교체)
              const words = buildBlankWordsFromText(extractedText, 8);

              setScaffoldingPayload({
                title: '대표 결정 방식', // 지금 백엔드에 subject_name 연동 전이므로 임시
                extractedText,
                blanks: words.map((w, i) => ({ id: i + 1, word: w })),
              });
            } catch (e: any) {
              setScaffoldingPayload(null);
              setScaffoldingError(e?.message ?? 'OCR 호출에 실패했습니다.');
            } finally {
              setScaffoldingLoading(false);
            }

            // 3) 기존 흐름 유지
            setStep('talkingStudy');
          }}

        />
      )}
      {step === 'talkingStudy' && (
        <TalkingStudyScreen
          onBack={() => setStep('selectPicture')}
          onSkip={() => setStep('scaffolding')}
          onDone={() => setStep('scaffolding')}
        />
      )}

      {step === 'scaffolding' && (
        <ScaffoldingScreen
          onBack={() => setStep('talkingStudy')}
          sources={capturedSources}
          selectedIndex={selectedSourceIndex}
          payload={scaffoldingPayload}
          loading={scaffoldingLoading}
          error={scaffoldingError}
          onRetry={async () => {
            const first = capturedSources[0] as any;
            const uri = first?.uri as string | undefined;
            if (!uri) return;

            setScaffoldingLoading(true);
            setScaffoldingError(null);
            try {
              const extractedText = await runOcr(uri);
              const words = buildBlankWordsFromText(extractedText, 8);
              setScaffoldingPayload({
                title: '대표 결정 방식',
                extractedText,
                blanks: words.map((w, i) => ({ id: i + 1, word: w })),
              });
            } catch (e: any) {
              setScaffoldingPayload(null);
              setScaffoldingError(e?.message ?? '재시도에 실패했습니다.');
            } finally {
              setScaffoldingLoading(false);
            }
          }}
        />

      )}


    </View>
  );
}
