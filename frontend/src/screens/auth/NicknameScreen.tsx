import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    Image,
    Platform,
} from 'react-native';

type Props = {
    onConfirm: (nickname: string) => void;
};

export default function NicknameScreen({ onConfirm }: Props) {
    const [nickname, setNickname] = useState('');

    const trimmed = nickname.trim();
    const length = trimmed.length;

    // TODO: 실제 닉네임 중복 체크 API 연동 후 값 갱신
    const isDuplicate = false;

    const isTooShort = length === 1;
    const isTooLong = length >= 11;
    const hasValue = length > 0;

    let helperText = '';
    let helperColor = '#9CA3AF'; // 기본 연한 회색

    if (!hasValue) {
        helperText = '';
    } else if (isDuplicate) {
        helperText =
            '이미 사용 중인 닉네임입니다. 다른 닉네임으로 시도해 주세요.';
        helperColor = '#EF4444';
    } else if (isTooShort) {
        helperText =
            '닉네임이 너무 짧습니다. 최소 2자 이상 입력해주세요.';
        helperColor = '#EF4444';
    } else if (isTooLong) {
        helperText =
            '닉네임이 너무 깁니다. 최대 10자 이내로 입력해주세요.';
        helperColor = '#EF4444';
    } else {
        helperText = '사용할 수 있는 닉네임이에요.';
        helperColor = '#9CA3AF';
    }

    const isValid = hasValue && !isDuplicate && !isTooShort && !isTooLong;
    const disabled = !isValid;

    const handleClear = () => setNickname('');

    const handleConfirm = () => {
        if (!isValid) return;
        onConfirm(trimmed);
    };

    return (
        <View style={styles.container}>
            {/* 왼쪽 캐릭터 영역 */}
            <View style={styles.left}>
                <Image
                    source={require('../../../assets/bat-character.png')}
                    style={styles.characterImage}
                    resizeMode="contain"
                />
            </View>

            {/* 오른쪽 입력 영역 */}
            <View style={styles.right}>
                <Text style={styles.title}>닉네임을 입력해주세요!</Text>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="닉네임 입력"
                        placeholderTextColor="#9CA3AF"
                        value={nickname}
                        onChangeText={setNickname}
                    />
                    {hasValue && (
                        <Pressable style={styles.clearButton} onPress={handleClear}>
                            <Text style={styles.clearText}>✕</Text>
                        </Pressable>
                    )}
                </View>

                <View style={styles.helperWrapper}>
                    <Text style={[styles.helperText, { color: helperColor }]}>
                        {helperText || ' '}
                    </Text>
                </View>

                <Pressable
                    style={[styles.submitButton, disabled && styles.submitDisabled]}
                    onPress={handleConfirm}
                    disabled={disabled}
                >
                    <Text style={[styles.submitText, disabled && styles.submitTextDisabled]}>
                        확인
                    </Text>
                </Pressable>

            </View>
        </View>
    );
}

const BG = '#F3F4F6';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
        flexDirection: 'row',
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    left: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    right: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 24,
    },
    inputWrapper: {
        position: 'relative',
        marginTop: 8,
        marginBottom: 4,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
        paddingVertical: 8,
        paddingRight: 32, 
        paddingLeft: 4,
        fontSize: 18,
    },
    clearButton: {
        position: 'absolute',
        right: 4,
        top: '50%',
        marginTop: -10,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    clearText: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    helperWrapper: {
        minHeight: 18,
        marginTop: 6,
        marginBottom: 24,   
    },

    // 밑줄 아래 작은 안내 문구
    helperText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: '#9CA3AF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitDisabled: {
        backgroundColor: '#D1D5DB',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    submitTextDisabled: {
        color: '#F9FAFB',
    },
    characterImage: {
        width: 268.41,
        height: 218.3,
    },
});
