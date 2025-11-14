import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

type Props = {
  nickname: string;
  typeLabel: string;   // 예: "분석형 학습자"
  onGoHome: () => void;
};

export default function TypeResultScreen({
  nickname,
  typeLabel,
  onGoHome,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{nickname}님의 학습 유형 결과</Text>

      <View style={styles.card}>
        <Text style={styles.type}>{typeLabel}</Text>
        <Text style={styles.desc}>
          이 유형은 정보를 차분히 분석하고{"\n"}
          논리적으로 정리하는 학습 방식에 강점이 있어요.
        </Text>
      </View>

      <Pressable style={styles.button} onPress={onGoHome}>
        <Text style={styles.buttonText}>홈 화면으로 이동</Text>
      </Pressable>
    </View>
  );
}

const BG = '#F3F4F6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  card: {
    width: '90%',
    borderRadius: 20,
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 3,
  },
  type: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
    color: '#5E82FF',
  },
  desc: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    color: '#4B5563',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#5E82FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
