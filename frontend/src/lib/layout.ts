// src/lib/layout.ts
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const guidelineBaseWidth = 1024;

export const scale = (size: number) => (width / guidelineBaseWidth) * size;

// 폰트는 너무 커지지 않게 살짝만 반영
export const fontScale = (size: number) => {
    const factor = 0.25; // 0~1 사이에서 조절
    const scaled = scale(size);
    return size + (scaled - size) * factor;
};
