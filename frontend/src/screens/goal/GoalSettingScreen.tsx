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

    return (
        <View style={styles.root}>
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
                    onChangeText={setGoal}
                    placeholder="학습 목표 횟수 입력"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    style={styles.input}
                />

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
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: scale(80),
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
        marginBottom: scale(32),
    },
    input: {
        width: '100%',
        height: scale(56),
        borderBottomWidth: 2,
        borderBottomColor: '#D1D5DB',
        fontSize: fontScale(18),
        marginBottom: scale(32),
    },
    button: {
        width: '100%',
        height: scale(56),
        borderRadius: 999,
        backgroundColor: '#5E82FF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    buttonText: {
        fontSize: fontScale(35),
        fontWeight: '700',
        color: '#ffffff',
    },
});