import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

type Props = {
  onFinishTest: () => void;
};

export default function DiagnosisScreen({ onFinishTest }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>학습 유형 진단 테스트</Text>
      <Text style={styles.desc}>
        아직 임시 화면입니다.{"\n"}
        여기에서 여러 문항을 풀고, 결과를 계산하게 됩니다.
      </Text>

      <Pressable style={styles.button} onPress={onFinishTest}>
        <Text style={styles.buttonText}>테스트 완료 (임시로 넘기기)</Text>
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
    fontSize: 24,
    fontWeight: '800',
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    color: '#4B5563',
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#5E82FF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
