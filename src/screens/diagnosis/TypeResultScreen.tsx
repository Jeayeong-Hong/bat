import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import {
  ResultStats,
  typeProfiles,
} from '../../data/learningTypeTest';
import { scale, fontScale } from '../../lib/layout';

type Props = {
  nickname: string;
  result: ResultStats;
  onGoHome: () => void;
};

const BG = '#F3F4F6';

export default function TypeResultScreen({
  nickname,
  result,
  onGoHome,
}: Props) {
  const profile = typeProfiles[result.typeKey];

  // ✅ 유형별 캐릭터 이미지 선택
  const getCharacterSource = () => {
    const label = profile.label; // 예: "장독립-숙고형"

    if (label.includes('장독립') && label.includes('숙고')) {
      return require('../../../assets/character/bat-green.png');
    }
    if (label.includes('장의존') && label.includes('숙고')) {
      return require('../../../assets/character/bat-red.png');
    }
    if (label.includes('장독립') && label.includes('충동')) {
      return require('../../../assets/character/bat-yellow.png');
    }
    if (label.includes('장의존') && label.includes('충동')) {
      return require('../../../assets/character/bat-purple.png');
    }

    // 혹시 대비용 기본 파란 박쥐
    return require('../../../assets/bat-character.png');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>학습유형검사 결과가 나왔어요!</Text>

        {/* 🔼 상단 카드: 유형 + 퍼센트 */}
        <View style={styles.topCard}>
          {/* 왼쪽: 텍스트 + 바들 */}
          <View style={styles.topLeft}>
            <Text style={styles.subtitle}>{nickname}님의 유형은…</Text>
            <Text style={styles.typeText}>
              {profile.title}{' '}
              <Text style={styles.typeLabel}>({profile.label})</Text>
            </Text>

            <View style={styles.tagRow}>
              {profile.tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* 퍼센트 바 2줄 */}
            <View style={styles.barGroup}>
              <Text style={styles.barTitle}>장독립 / 장의존</Text>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>장독립</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${result.fieldIndependent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>
                  {result.fieldIndependent}%
                </Text>
              </View>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>장의존</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFillSecondary,
                      { width: `${result.fieldDependent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>
                  {result.fieldDependent}%
                </Text>
              </View>

              <Text style={[styles.barTitle, { marginTop: scale(12) }]}>
                숙고 / 충동
              </Text>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>숙고</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${result.reflective}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>
                  {result.reflective}%
                </Text>
              </View>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>충동</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFillSecondary,
                      { width: `${result.impulsive}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>
                  {result.impulsive}%
                </Text>
              </View>
            </View>
          </View>

          {/* 오른쪽: 캐릭터 */}
          <Image
            source={getCharacterSource()}
            style={styles.character}
            resizeMode="contain"
          />
        </View>

        {/* 📄 설명 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>어떤 학습자일까요?</Text>
          <Text style={styles.sectionBody}>{profile.summary}</Text>
        </View>

        {/* 필요하면 아래에 “이렇게 학습하면 더 좋아요” 섹션 추가 가능 */}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtonWrap}>
        <Pressable style={styles.button} onPress={onGoHome}>
          <Text style={styles.buttonText}>이제 진짜 학습 시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* 전체 레이아웃 */
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: scale(40),
    paddingTop: scale(40),
    paddingBottom: scale(32),
    gap: scale(24),
  },

  /* 화면 타이틀 */
  title: {
    fontSize: fontScale(22),
    fontWeight: '800',
  },

  /* 상단 결과 카드 */
  topCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: scale(24),
    paddingVertical: scale(24),
    paddingHorizontal: scale(24),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topLeft: {
    flex: 1,
    marginRight: scale(24),
  },

  /* 유형 텍스트 */
  subtitle: {
    fontSize: fontScale(14),
    color: '#6B7280',
    marginBottom: scale(4),
  },
  typeText: {
    fontSize: fontScale(18),
    fontWeight: '800',
    marginBottom: scale(8),
    color: '#111827',
  },
  typeLabel: {
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#4B5563',
  },

  /* 태그 라인 */
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: scale(16),
  },
  tag: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(999),
    backgroundColor: '#EEF2FF',
  },
  tagText: {
    fontSize: fontScale(11),
    color: '#4F46E5',
    fontWeight: '600',
  },

  /* 퍼센트 바 그룹 */
  barGroup: {
    gap: scale(6),
  },
  barTitle: {
    fontSize: fontScale(13),
    fontWeight: '700',
    marginBottom: scale(4),
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  barLabel: {
    width: scale(52),
    fontSize: fontScale(12),
    color: '#4B5563',
  },
  barBackground: {
    flex: 1,
    height: scale(8),
    borderRadius: scale(999),
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginHorizontal: scale(8),
  },
  barFill: {
    height: '100%',
    borderRadius: scale(999),
    backgroundColor: '#5E82FF',
  },
  barFillSecondary: {
    height: '100%',
    borderRadius: scale(999),
    backgroundColor: '#9CA3AF',
  },
  barValue: {
    width: scale(40),
    textAlign: 'right',
    fontSize: fontScale(11),
    color: '#4B5563',
  },

  /* 결과 캐릭터 */
  character: {
    width: scale(140),
    height: scale(140),
  },

  /* 설명 섹션 */
  section: {
    backgroundColor: '#ffffff',
    borderRadius: scale(16),
    paddingVertical: scale(16),
    paddingHorizontal: scale(18),
  },
  sectionTitle: {
    fontSize: fontScale(15),
    fontWeight: '700',
    marginBottom: scale(8),
  },
  sectionBody: {
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
    color: '#4B5563',
  },

  /* 하단 버튼 */
  bottomButtonWrap: {
    paddingHorizontal: scale(40),
    paddingBottom: scale(24),
  },
  button: {
    backgroundColor: '#5E82FF',
    borderRadius: scale(999),
    paddingVertical: scale(16),
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: fontScale(15),
  },
});
