import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';

// 학습 유형 텍스트에 따라 캐릭터 이미지를 매핑
const getCharacterSourceByType = (typeLabel: string) => {
  // 아직 유형이 없으면 기본 파란 BAT
  if (!typeLabel) {
    return require('../../../assets/bat-character.png');
  }

  // 분석형 학습자  -> 장독립·숙고형 (초록 BAT)
  if (typeLabel.includes('분석형')) {
    return require('../../../assets/character/bat-green.png');
  }

  // 협력형 학습자  -> 장의존·숙고형 (빨간 BAT)
  if (typeLabel.includes('협력형')) {
    return require('../../../assets/character/bat-red.png');
  }

  // 창의형 학습자 -> 장독립·충동형 (노랑 BAT)
  if (typeLabel.includes('창의형')) {
    return require('../../../assets/character/bat-yellow.png');
  }

  // 사회형 학습자 -> 장의존·충동형 (보라 BAT)
  if (typeLabel.includes('사회형')) {
    return require('../../../assets/character/bat-purple.png');
  }

  // 예외: 위에 안 걸리면 기본 파란 BAT
  return require('../../../assets/bat-character.png');
};

type RewardState = {
  baseXP: number;
  bonusXP: number;
  showBase: boolean;
  showBonus: boolean;
};

type Props = {
  nickname: string;
  typeLabel: string;
  level: number;
  exp: number;
  // 출석 관련
  streak: number;
  hasCheckedInToday: boolean;
  onCheckIn: () => void;
  // 보상 모달 관련
  rewardState: RewardState;
  onCloseBaseReward: () => void;
  onCloseBonusReward: () => void;
  weekAttendance: boolean[]; // 월~일, true이면 출석
  //
  onNavigate: (screen: 'home' | 'league' | 'alarm' | 'mypage') => void;
};

export default function HomeScreen({
  nickname,
  typeLabel,
  level,
  exp,
  streak,
  hasCheckedInToday,
  onCheckIn,
  rewardState,
  onCloseBaseReward,
  onCloseBonusReward,
  weekAttendance,
  onNavigate,
}: Props) {
  const characterSource = getCharacterSourceByType(typeLabel);
  const expProgress = Math.min(exp / 100, 1);
  const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
  const todayIndex = (() => {
    const jsDay = new Date().getDay();
    return (jsDay + 6) % 7; // 월0~일6
  })();
  const hasStreak = streak >= 2; // 2일 이상 연속 출석이면 불 아이콘 색상
  return (
    <View style={styles.root}>
      {/* 좌측 사이드바 */}
      {/* 좌측 사이드바 */}
      <View style={styles.sidebar}>
        <View style={styles.menuGroup}>
          {/* 홈 */}
          <Pressable
            style={styles.menuButton}
            onPress={() => onNavigate('home')}
          >
            <Image
              source={require('../../../assets/homebutton/home.png')}
              style={[styles.menuIcon, styles.menuIconActive]}
              resizeMode="contain"
            />
            <Text style={[styles.menuText, styles.menuTextActive]}>홈</Text>
          </Pressable>
          {/* 자료 입력 */}
          <Pressable style={styles.menuButton} onPress={() => { }}>
            <Image
              source={require('../../../assets/homebutton/data.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>자료 입력</Text>
          </Pressable>
          {/* 복습 */}
          <Pressable style={styles.menuButton} onPress={() => { }}>
            <Image
              source={require('../../../assets/homebutton/review.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>복습</Text>
          </Pressable>
          {/* 리그 */}
          <Pressable
            style={styles.menuButton}
            onPress={() => onNavigate('league')}
          >
            <Image
              source={require('../../../assets/homebutton/league.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>리그</Text>
          </Pressable>
          {/* 마이 */}
          <Pressable
            style={styles.menuButton}
            onPress={() => onNavigate('mypage')}
          >
            <Image
              source={require('../../../assets/homebutton/my.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>마이</Text>
          </Pressable>
          {/* 로그아웃 */}
          <Pressable style={styles.menuButton} onPress={() => { }}>
            <Image
              source={require('../../../assets/homebutton/logout.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>로그아웃</Text>
          </Pressable>
        </View>
      </View>


      {/* 우측 메인 영역 */}
      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        <View style={styles.headerRow}>
          <Text style={styles.welcome}>{nickname}님 환영해요!</Text>

          <Pressable
            style={styles.alarmButton}
            onPress={() => onNavigate('alarm')}
          >
            <Image
              source={require('../../../assets/homebutton/alarm.png')}
              style={styles.alarmIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        <View style={styles.contentRow}>
          {/* 왼쪽 컬럼: bigCard + 성장 카드 */}
          <View style={styles.leftColumn}>
            {/* 상단 큰 카드 */}
            <View style={styles.bigCard}>
              {/* Level + 유형 */}
              <Text style={styles.levelText}>
                <Text style={styles.levelLabel}>Level </Text>
                <Text style={styles.levelValue}>{level} </Text>
                {typeLabel || '학습 유형 미지정'}
              </Text>

              {/* 레벨 바 + 경험치(바 오른쪽 위) */}
              <View style={styles.progressWrapper}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(exp, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.expText}>{exp}/100</Text>
              </View>

              {/* 캐릭터 */}
              <View style={styles.characterWrapper}>
                <Image
                  source={characterSource}
                  style={styles.characterImage}
                />
              </View>

              {/* 오늘의 복습 버튼 */}
              <Pressable
                style={[
                  styles.todayButton,
                  hasCheckedInToday && styles.todayButtonDisabled,
                ]}
                onPress={onCheckIn}
                disabled={hasCheckedInToday}
              >
                {hasCheckedInToday ? (
                  <Text style={styles.todayButtonText}>오늘은 이미 출석했어요</Text>
                ) : (
                  <View style={styles.todayButtonInner}>
                    <Image
                      source={require('../../../assets/homebutton/reft-shift.png')}
                      style={styles.todayButtonIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.todayButtonText}>오늘의 복습</Text>
                  </View>
                )}
              </Pressable>

            </View>

            {/* 아래 성장 카드 */}
            <View style={styles.bottomCard}>
              <Text style={styles.smallTitle}>
                이번 주, 지난 주보다 12% 더 성장했어요!
              </Text>
              <Text style={styles.smallBody}>평균 이해도: 82%</Text>
            </View>
          </View>

          {/* 오른쪽 컬럼: 연속 학습 / 리그 / 목표 카드 */}
          <View style={styles.rightColumn}>
            {/* 연속 학습 카드 */}
            <View style={styles.smallCard}>
              <View style={styles.streakRow}>
                {/* 왼쪽 큰 불 아이콘 */}
                <Image
                  source={require('../../../assets/fire.png')}
                  style={[
                    styles.fireImage,
                    hasStreak && styles.fireImageActive,
                  ]}
                  resizeMode="contain"
                />

                {/* 오른쪽 텍스트 + 요일 */}
                <View style={styles.streakContent}>
                  <Text style={styles.streakTitle}>
                    연속 학습 <Text style={styles.streakStrong}>{streak}</Text>일
                  </Text>

                  <View style={styles.weekRow}>
                    {weekdays.map((label, idx) => {
                      const checked = weekAttendance[idx];
                      const isToday = idx === todayIndex;
                      return (
                        <View key={label} style={styles.weekItem}>
                          <View
                            style={[
                              styles.weekCircle,
                              checked && styles.weekCircleChecked,
                            ]}
                          >
                            <Text
                              style={[
                                styles.weekLabel,
                                checked && styles.weekLabelChecked,
                              ]}
                            >
                              {label}
                            </Text>
                          </View>
                          {isToday && <View style={styles.todayTriangle} />}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* 이하 리그 카드 / 목표 카드 그대로 */}
            {/* 리그 카드 (디자인 개선 버전) */}
            <Pressable
              style={styles.leagueCard}
              onPress={() => onNavigate('league')}
            >

              {/* 제목 */}
              <Text style={styles.leagueTitle}>현재 리그 순위</Text>

              <View style={styles.leagueRow}>
                {/* 트로피 이미지 */}
                <Image
                  source={require('../../../assets/league-trophy/iron.png')}
                  style={styles.leagueTrophy}
                  resizeMode="contain"
                />

                {/* 리그명 + 순위 */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.leagueMainText}>아이언 리그 5위</Text>

                  {/* XP 부족분 계산 */}
                  <Text style={styles.leagueSubText}>
                    10XP만 획득하면 순위 UP!
                  </Text>
                  {/* 1등일 때는 ↓ */}
                  {/* <Text style={styles.leagueSubText}>와 리그 1등이에요!</Text> */}
                </View>

                {/* 오른쪽 > 아이콘 */}
                <Text style={styles.leagueArrow}>{'>'}</Text>
              </View>
            </Pressable>


            <View style={[styles.bottomCard, styles.rightBottomCard]}>
              <Text style={styles.smallTitle}>총 학습 목표 횟수</Text>
              <Text style={styles.smallBody}>이번 달 목표: 20회 / 현재 14회</Text>
              <Text style={styles.linkText}>3회만 더 하면 기록 갱신!</Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* 출석 보상 모달 */}
      {rewardState.showBase && (
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBackdrop} onPress={onCloseBaseReward}>
            <View style={styles.rewardCard}>
              <Text style={styles.rewardTextMain}>축하합니다!</Text>
              <Text style={styles.rewardTextSub}>
                출석 보상으로{' '}
                <Text style={styles.rewardXP}>{rewardState.baseXP}XP</Text>
                를 획득했어요!
              </Text>
              <Image
                source={characterSource}
                style={styles.rewardCharacter}
                resizeMode="contain"
              />
            </View>
          </Pressable>
        </View>
      )}

      {/* 랜덤 추가 보상 모달 (50% 확률) */}
      {rewardState.showBonus && (
        <View style={styles.overlay}>
          <Pressable
            style={styles.overlayBackdrop}
            onPress={onCloseBonusReward}
          >
            <View style={styles.rewardCard}>
              <Text style={styles.rewardTextMain}>축하합니다!</Text>
              <Text style={styles.rewardTextSub}>
                랜덤 추가 리워드로{' '}
                <Text style={styles.rewardXP}>{rewardState.bonusXP}XP</Text>
                를 획득했어요!
              </Text>
              {/* 나중에 선물 박스 이미지로 교체 가능 */}
              <View style={styles.giftBoxPlaceholder} />
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const BG = '#F3F4F6';

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: BG },

  /* 사이드바 */
  sidebar: {
    width: scale(80),
    backgroundColor: '#ffffff',
    paddingTop: scale(32),
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: fontScale(18),
    fontWeight: '800',
    marginBottom: scale(24),
    color: '#4B5563',
  },
  menuGroup: {
    gap: scale(16),
    alignItems: 'center',
  },

  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
  },
  menuIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: '#9CA3AF',      // 기본 회색
  },
  menuText: {
    fontSize: fontScale(12),
    color: '#9CA3AF',
  },
  menuTextActive: {
    color: '#5E82FF',
    fontWeight: '700',
  },
  menuIconActive: {
    tintColor: '#5E82FF',      // 선택된 메뉴 아이콘 파란색
  },
  /* 메인 영역 */
  main: { flex: 1 },
  mainContent: {
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  welcome: {
    fontSize: fontScale(22),
    fontWeight: '800',
    marginBottom: scale(16),
  },

  /* 좌/우 컬럼 레이아웃 */
  contentRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  /* 카드들 */
  bigCard: {
    backgroundColor: '#ffffff',
    borderRadius: scale(24),
    padding: scale(20),
    elevation: 3,
    marginBottom: scale(18),
  },
  smallCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  bottomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },

  rightBottomCard: {
    marginTop: 4,
  },

  smallTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  smallBody: { fontSize: 12, color: '#4B5563' },

  /* 레벨/경험치 */
  levelText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    marginBottom: scale(8),
  },
  levelLabel: { color: '#000000' },
  levelValue: { fontSize: 20, color: '#000000', fontWeight: '800' },

  progressWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#5E82FF',
  },
  expText: {
    position: 'absolute',
    right: 0,
    top: -18,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  /* 캐릭터 + 버튼 */
  characterWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  characterImage: {
    width: scale(200),
    height: scale(200),
  },
  todayButton: {
    borderRadius: scale(999),
    paddingVertical: scale(12),
    backgroundColor: '#5E82FF',
    alignItems: 'center',
  },
  todayButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  todayButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontScale(15),
  },

  /* 링크 텍스트 */
  linkText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },

  /* 보상 오버레이 */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  rewardCard: {
    width: 320,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 6,
  },
  rewardTextMain: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  rewardTextSub: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  rewardXP: {
    color: '#2563EB',
    fontWeight: '800',
  },
  rewardCharacter: {
    width: 120,
    height: 120,
  },
  giftBoxPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#F9A8D4', // 나중에 이미지로 교체
  },  // 연속 학습 카드 레이아웃
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireImage: {
    width: scale(60),
    height: scale(60),
    tintColor: '#E5E7EB',
    marginRight: scale(14),
  },
  fireImageActive: {
    tintColor: '#F973A6', // 활성 핑크 (원하는 색으로 조정 가능)
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  streakStrong: {
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekItem: {
    alignItems: 'center',
  },
  weekCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekCircleChecked: {
    backgroundColor: '#FED7E2', // 연한 핑크 배경
  },
  weekLabel: {
    fontSize: 13,
    color: '#4B5563',
  },
  weekLabelChecked: {
    color: '#EC4899',
    fontWeight: '700',
  },
  todayTriangle: {
    marginTop: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#3B82F6',
  },
  /* 리그 카드 */
  leagueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },

  leagueTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  leagueTrophy: {
    width: scale(40),
    height: scale(40),
    marginRight: 12,
  },

  leagueMainText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },

  leagueSubText: {
    fontSize: 12,
    color: '#4B5563',
  },

  leagueArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  todayButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
  },
  todayButtonIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(16),
  },
  alarmButton: {
    padding: scale(4),
  },
  alarmIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: '#9CA3AF',
  },

});
