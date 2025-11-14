import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

type Props = {
  nickname: string;
  typeLabel: string;
};

export default function HomeScreen({ nickname, typeLabel }: Props) {
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

        <View style={styles.topRow}>
          {/* 왼쪽 큰 카드 */}
          <View style={styles.bigCard}>
            <Text style={styles.levelText}>
              {typeLabel || '학습 유형 미지정'}
            </Text>

            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarFill} />
            </View>

            <View style={styles.characterWrapper}>
              <Image
                source={require('../../../assets/bat-character.png')}
                style={styles.characterImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.todayButton}>
              <Text style={styles.todayButtonText}>⏮ 오늘의 복습</Text>
            </View>
          </View>

          {/* 오른쪽 상단 두 카드 (간단 버전) */}
          <View style={styles.rightColumn}>
            <View style={styles.smallCard}>
              <Text style={styles.smallTitle}>연속 학습 3일</Text>
              <Text style={styles.smallBody}>이번 주도 꾸준히 이어가볼까요?</Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallTitle}>현재 리그 순위</Text>
              <Text style={styles.smallBody}>아이언 리그 5위 · 10XP만 더!</Text>
            </View>
          </View>
        </View>

        {/* 하단 카드 두 개 (간단 버전) */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomCard}>
            <Text style={styles.smallTitle}>
              이번 주, 지난 주보다 12% 더 성장했어요!
            </Text>
            <Text style={styles.smallBody}>평균 이해도: 82%</Text>
          </View>

          <View style={styles.bottomCard}>
            <Text style={styles.smallTitle}>총 학습 목표 횟수률</Text>
            <Text style={styles.smallBody}>이번 달 목표: 20회 / 현재 14회</Text>
            <Text style={styles.linkText}>3회만 더 하면 기록 갱신!</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const BG = '#F3F4F6';

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: BG },
  sidebar: {
    width: 80,
    backgroundColor: '#E5E7EB',
    paddingTop: 32,
    alignItems: 'center',
  },
  menuTitle: { fontSize: 18, fontWeight: '800', marginBottom: 24, color: '#4B5563' },
  menuGroup: { gap: 16, alignItems: 'center' },
  menuItem: { fontSize: 12, color: '#9CA3AF' },
  menuItemActive: { color: '#5E82FF', fontWeight: '700' },

  main: { flex: 1 },
  mainContent: { paddingHorizontal: 24, paddingVertical: 24 },
  welcome: { fontSize: 22, fontWeight: '800', marginBottom: 16 },

  topRow: { flexDirection: 'row', gap: 16 },
  bigCard: {
    flex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    elevation: 3,
  },
  rightColumn: { flex: 1, gap: 12 },
  smallCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  smallTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  smallBody: { fontSize: 12, color: '#4B5563' },

  levelText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  levelLabel: { color: '#6B7280' },
  levelValue: { color: '#5E82FF', fontWeight: '800' },

  progressBarBackground: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  progressBarFill: {
    width: '80%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#5E82FF',
  },

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

  bottomRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  bottomCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  linkText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
});
