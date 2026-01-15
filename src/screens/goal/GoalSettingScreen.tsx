import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    StyleSheet,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';

type Props = {
    onSubmit: (goal: number) => void;
};

export default function GoalSettingScreen({ onSubmit }: Props) {
    const [goal, setGoal] = useState('');
    const [errorText, setErrorText] = useState('');

    const handleChangeGoal = (text: string) => {
        // 숫자만 허용
        const onlyNumber = text.replace(/[^0-9]/g, '');

        if (text !== onlyNumber) {
            setErrorText('숫자만 입력해 주세요');
        } else {
            setErrorText('');
        }

        setGoal(onlyNumber);
    };

    return (
        <View style={styles.root}>
            <View style={styles.contentRow}>
                {/* 왼쪽 캐릭터 */}
                <Image
                    source={require('../../../assets/bat-character.png')}
                    style={styles.character}
                    resizeMode="contain"
                />

                {/* 오른쪽 콘텐츠 */}
                <View style={styles.rightBox}>
                    <Text style={styles.title}>이번 달 학습 목표를 세워봐요!</Text>

                    <TextInput
                        value={goal}
                        onChangeText={handleChangeGoal}
                        placeholder="학습 목표 횟수 입력"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <Text
                        style={[
                            styles.helperText,
                            !errorText && { opacity: 0 }, // ➕ 에러 없을 때는 안 보이게(공간은 유지)
                        ]}
                    >
                        {errorText || ' '}
                    </Text>


                    <Pressable
                        style={[
                            styles.button,
                            goal.trim() === '' && { backgroundColor: '#D1D5DB' },
                        ]}
                        disabled={goal.trim() === ''}
                        onPress={() => onSubmit(Number(goal))}
                    >
                        <Text style={styles.buttonText}>확인</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        maxWidth: scale(900),
    },
    character: {
        width: scale(260),
        height: scale(260),
        marginRight: scale(80),
    },
    rightBox: {
        width: scale(520),
    },
    title: {
        fontSize: fontScale(28),
        fontWeight: '800',
        color: '#111827',
        marginBottom: scale(24),
    },
    input: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
        paddingVertical: scale(10),
        paddingHorizontal: scale(8),
        fontSize: fontScale(18),
        marginBottom: scale(4),
    },
    button: {
        width: '100%',
        marginTop: scale(8),
        height: scale(64),
        borderRadius: scale(999),
        backgroundColor: '#5E82FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: fontScale(35),
        fontWeight: '700',
        color: '#ffffff',
    },
    helperText: {
        marginTop: scale(2),
        height: fontScale(14),
        fontSize: fontScale(14),
        color: '#EF4444',
        marginBottom: scale(4),
        paddingHorizontal: scale(8),
    },
});