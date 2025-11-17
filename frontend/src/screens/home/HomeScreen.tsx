import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

type Props = {
  nickname: string;
  typeLabel: string;
  level: number;
  exp: number;
};

export default function HomeScreen({ nickname, typeLabel, level, exp }: Props) {
  return (
    <View style={styles.root}>
      {/* 좌측 사이드바 */}
      <View style={styles.sidebar}>
        <Text style={styles.menuTitle}>BAT</Text>
        <View style={styles.menuGroup}>
          <Text style={[styles.menuItem, styles.menuItemActive]}>홈</Text>
          <Text style={styles.menuItem}>자료 입력</Text>
          <Text style={styles.menuItem}>복습</Text>
          <Text style={styles.menuItem}>리그</Text>
          <Text style={styles.menuItem}>마이</Text>
          <Text style={styles.menuItem}>로그아웃</Text>
        </View>
      </View>

      {/* 우측 메인 영역 */}
      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        <Text style={styles.welcome}>{nickname}님 환영해요!</Text>

        <View style={styles.contentRow}>
          {/* 🔹 왼쪽 컬럼: bigCard + 성장 카드 */}
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
                  source={require('../../../assets/bat-character.png')}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
              </View>

              {/* 오늘의 복습 버튼 */}
              <View style={styles.todayButton}>
                <Text style={styles.todayButtonText}>⏮ 오늘의 복습</Text>
              </View>
            </View>

            {/* 아래 성장 카드 */}
            <View style={styles.bottomCard}>
              <Text style={styles.smallTitle}>
                이번 주, 지난 주보다 12% 더 성장했어요!
              </Text>
              <Text style={styles.smallBody}>평균 이해도: 82%</Text>
            </View>
          </View>

          {/* 🔹 오른쪽 컬럼: 연속 학습 / 리그 / 목표 카드 */}
          <View style={styles.rightColumn}>
            <View style={styles.smallCard}>
              <Text style={styles.smallTitle}>연속 학습 3일</Text>
              <Text style={styles.smallBody}>이번 주도 꾸준히 이어가볼까요?</Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallTitle}>현재 리그 순위</Text>
              <Text style={styles.smallBody}>아이언 리그 5위 · 10XP만 더!</Text>
            </View>

            <View style={[styles.bottomCard, styles.rightBottomCard]}>
              <Text style={styles.smallTitle}>총 학습 목표 횟수률</Text>
              <Text style={styles.smallBody}>이번 달 목표: 20회 / 현재 14회</Text>
              <Text style={styles.linkText}>3회만 더 하면 기록 갱신!</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const BG = '#F3F4F6';

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: BG },

  /* 사이드바 */
  sidebar: {
    width: 80,
    backgroundColor: '#E5E7EB',
    paddingTop: 32,
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 24,
    color: '#4B5563',
  },
  menuGroup: { gap: 16, alignItems: 'center' },
  menuItem: { fontSize: 12, color: '#9CA3AF' },
  menuItemActive: { color: '#5E82FF', fontWeight: '700' },

  /* 메인 영역 */
  main: { flex: 1 },
  mainContent: { paddingHorizontal: 24, paddingVertical: 24 },
  welcome: { fontSize: 22, fontWeight: '800', marginBottom: 16 },

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
    borderRadius: 24,
    padding: 20,
    elevation: 3,
    marginBottom: 18,
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
    // 오른쪽 아래 카드 여백 조정용 (필요시만 사용)
    marginTop: 4,
  },

  smallTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  smallBody: { fontSize: 12, color: '#4B5563' },

  /* 레벨/경험치 */
  levelText: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
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
    top: -18, // 바보다 약간 위
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
    width: 200,
    height: 200,
  },
  todayButton: {
    borderRadius: 999,
    backgroundColor: '#5E82FF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  todayButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  /* 링크 텍스트 */
  linkText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
});

