import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
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
  | 'mypage';

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

    </View>
  );
}
