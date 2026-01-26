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
import Sidebar from '../../components/Sidebar';
import { confirmLogout } from '../../lib/auth';

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
  // 홈 화면 통계
  weeklyGrowth?: { labels: string[]; data: number[] };
  monthlyStats?: { last_month_name: string; last_month_count: number; this_month_name: string; this_month_count: number; target_count: number; diff: number };
  monthlyGoal?: number | null;
  //
  onNavigate: (screen: 'home' | 'league' | 'alarm' | 'mypage' | 'takePicture' | 'brushup') => void;
  onLogout?: () => void;
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
  weeklyGrowth,
  monthlyStats,
  monthlyGoal,
  onNavigate,
  onLogout,
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
      <Sidebar
        activeScreen="home"
        onNavigate={onNavigate}
        onLogout={() => confirmLogout(onLogout)}
      />

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
                style={styles.todayButton}
                onPress={() => {
                  if (!hasCheckedInToday) {
                    onCheckIn();
                  }
                  onNavigate('brushup');
                }}
              >
                <View style={styles.todayButtonInner}>
                  <Image
                    source={require('../../../assets/homebutton/reft-shift.png')}
                    style={styles.todayButtonIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.todayButtonText}>오늘의 복습</Text>
                </View>
              </Pressable>

            </View>

            {/* 아래 성장 카드 */}
            <View style={styles.bottomCard}>
              {/* 요약 메시지 */}
              {monthlyStats && monthlyStats.diff !== undefined && (
                <Text style={styles.smallTitle}>
                  {monthlyStats.diff >= 0
                    ? `이번 달은 지난달보다 ${monthlyStats.diff}회 더 공부하셨네요! 멋져요! 🔥`
                    : `학습량이 지난달보다 줄어들었어요. 조금만 더 힘내볼까요? ✊`}
                </Text>
              )}

              {/* 막대 그래프 */}
              <View style={styles.lineGraphContainer}>
                {weeklyGrowth && weeklyGrowth.labels && weeklyGrowth.data ? (
                  <View style={styles.barChartContainer}>
                    {weeklyGrowth.labels.map((label, idx) => {
                      const value = weeklyGrowth.data[idx] || 0;
                      const maxValue = Math.max(...weeklyGrowth.data, 1);
                      const heightPercent = (value / maxValue) * 100;

                      return (
                        <View key={idx} style={styles.barItem}>
                          <View style={styles.barWrapper}>
                            <View
                              style={[
                                styles.bar,
                                { height: `${heightPercent}%` }
                              ]}
                            />
                          </View>
                          <Text style={styles.barLabel}>{label}</Text>
                          <Text style={styles.barValue}>{Math.round(value)}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.graphPlaceholder}>
                    학습 기록이 없습니다{'\n'}학습을 시작해보세요!
                  </Text>
                )}
              </View>

              {/* 월간 비교 통계 */}
              {monthlyStats && (
                <View style={styles.comparisonBox}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{monthlyStats.last_month_name || '전월'}</Text>
                    <Text style={styles.statValue}>{monthlyStats.last_month_count}회</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{monthlyStats.this_month_name || '당월'}</Text>
                    <Text style={styles.statValue}>{monthlyStats.this_month_count}회</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>변화</Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: monthlyStats.diff >= 0 ? '#D63031' : '#00B894' }
                      ]}
                    >
                      {monthlyStats.diff >= 0 ? '+' : ''}{monthlyStats.diff}회
                    </Text>
                  </View>
                </View>
              )}
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
                <Image
                  source={require('../../../assets/shift.png')}
                  style={styles.leagueArrowImage}
                  resizeMode="contain"
                />
              </View>
            </Pressable>


            <View style={[styles.bottomCard, styles.rightBottomCard, styles.goalCard]}>
              <Text style={styles.goalCardTitle}>이번 달 목표까지 얼마 안 남았어요!</Text>

              {/* 이번 달 목표 */}
              <View style={styles.goalInlineRow}>
                <Text style={styles.goalItemLabel}>이번 달 목표</Text>
                <View style={styles.goalProgressBarContainer}>
                  <View style={[styles.goalProgressBar, { width: '100%', backgroundColor: '#5E82FF' }]} />
                  <Text style={styles.goalValueOverlay}>{monthlyGoal ?? 20}회</Text>
                </View>
              </View>

              {/* 현재 달 학습 */}
              <View style={styles.goalInlineRow}>
                <Text style={styles.goalItemLabel}>{monthlyStats?.this_month_name || new Date().getMonth() + 1}월 총 학습</Text>
                {(monthlyStats?.this_month_count ?? 0) === 0 ? (
                  <View style={[styles.goalProgressBarContainer, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.goalValueOverlay, { position: 'static', color: '#92A6FF' }]}>0회</Text>
                  </View>
                ) : (
                  <View style={styles.goalProgressBarContainer}>
                    <View
                      style={[
                        styles.goalProgressBar,
                        {
                          width: `${Math.min(
                            ((monthlyStats?.this_month_count ?? 0) / (monthlyGoal ?? 20)) * 100,
                            100
                          )}%`,
                          backgroundColor: '#92A6FF',
                        },
                      ]}
                    />
                    <Text style={styles.goalValueOverlay}>{monthlyStats?.this_month_count ?? 0}회</Text>
                  </View>
                )}
              </View>

              <Text style={styles.goalHighlight}>
                {Math.max((monthlyGoal ?? 20) - (monthlyStats?.this_month_count ?? 0), 0)}회만 더 하면 목표달성!
              </Text>
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

  /* 메인 영역 */
  main: { flex: 1 },
  mainContent: {
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  welcome: {
    fontSize: fontScale(22),
    fontWeight: '800',
    marginTop: scale(8),
    marginBottom: scale(16),
  },

  /* 좌/우 컬럼 레이아웃 */
  contentRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    gap: 8,
  },
  /* 카드들 */
  bigCard: {
    backgroundColor: '#ffffff',
    borderRadius: scale(24),
    padding: scale(18),
    elevation: 3,
    marginBottom: scale(14),
  },
  smallCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 14,
    elevation: 2,
    marginBottom: scale(12),
  },
  bottomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 14,
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
    width: scale(140),
    height: scale(140),
  },
  todayButton: {
    borderRadius: scale(16),
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
    fontSize: fontScale(16),
    fontWeight: '700',
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
    marginBottom: scale(12),
  },

  leagueTitle: {
    fontSize: fontScale(20),
    fontWeight: '700',
    marginBottom: 10,
  },

  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  leagueTrophy: {
    width: scale(62),
    height: scale(62),
    marginRight: 14,
  },

  leagueMainText: {
    fontSize: fontScale(15),
    fontWeight: '800',
    marginBottom: 6,
  },

  leagueSubText: {
    fontSize: fontScale(12),
    fontWeight: '600',
    color: '#4B5563',
  },

  leagueArrowImage: {
    width: scale(20),
    height: scale(20),
    tintColor: '#9CA3AF',
    marginLeft: 8,
  },
  todayButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
  },
  todayButtonIcon: {
    width: scale(20),
    height: scale(20),
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

  /* 목표 카드 관련 */
  goalCard: {
    gap: 12,
  },
  lineGraphContainer: {
    minHeight: scale(120),
    marginVertical: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    height: scale(100),
    paddingHorizontal: scale(8),
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    gap: scale(4),
  },
  barWrapper: {
    width: '80%',
    height: scale(80),
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    backgroundColor: '#5E82FF',
    borderRadius: scale(4),
    minHeight: 2,
  },
  barLabel: {
    fontSize: fontScale(10),
    color: '#6B7280',
    marginTop: scale(2),
  },
  barValue: {
    fontSize: fontScale(11),
    fontWeight: '700',
    color: '#111827',
  },
  graphPlaceholder: {
    fontSize: fontScale(13),
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: scale(20),
  },
  comparisonBox: {
    marginTop: scale(16),
    paddingTop: scale(16),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: fontScale(11),
    color: '#9CA3AF',
    marginBottom: scale(4),
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: fontScale(16),
    fontWeight: '800',
    color: '#5E82FF',
  },
  divider: {
    width: 1,
    height: scale(40),
    backgroundColor: '#E5E7EB',
  },
  graphLegend: {
    gap: scale(4),
  },
  graphLegendText: {
    fontSize: fontScale(11),
    fontWeight: '600',
    color: '#4B5563',
  },
  goalCardTitle: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#1F2937',
    marginTop: scale(8),
    marginBottom: scale(20),
  },
  goalInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(18),
  },
  goalItemLabel: {
    fontSize: fontScale(13),
    fontWeight: '600',
    color: '#4B5563',
    minWidth: scale(75),
  },
  goalProgressBarContainer: {
    flex: 1,
    height: scale(32),
    backgroundColor: '#E5E7EB',
    borderRadius: scale(8),
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
  },
  goalProgressBar: {
    height: '100%',
    borderRadius: scale(8),
  },
  goalValueOverlay: {
    position: 'absolute',
    right: scale(10),
    fontSize: fontScale(14),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  goalItemValue: {
    fontSize: fontScale(14),
    fontWeight: '800',
    color: '#5E82FF',
    minWidth: scale(45),
    textAlign: 'right',
  },
  goalHighlight: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#5E82FF',
    marginBottom: scale(8),
    textAlign: 'left',
  },
});
