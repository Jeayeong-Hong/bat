import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    Image,
} from 'react-native';

type Props = {
    onConfirm: (nickname: string) => void;
};

export default function NicknameScreen({ onConfirm }: Props) {
    const [nickname, setNickname] = useState('');

    const handleClear = () => setNickname('');
    const handleConfirm = () => {
        if (nickname.trim().length === 0) return;
        onConfirm(nickname.trim());
    };

    const disabled = nickname.trim().length === 0;

    return (
        <View style={styles.container}>
            {/* 왼쪽 캐릭터 영역 - 나중에 이미지 들어갈 자리 */}
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
                    {nickname.length > 0 && (
                        <Pressable style={styles.clearButton} onPress={handleClear}>
                            <Text style={styles.clearText}>✕</Text>
                        </Pressable>
                    )}
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
    },
    left: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    right: {
        flex: 1,
        justifyContent: 'center',
        gap: 24,
    },
    characterCircle: {
        width: 200,
        height: 200,
        borderRadius: 999,
        backgroundColor: '#5E82FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterText: {
        fontSize: 72,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    inputWrapper: {
        marginTop: 8,
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#9CA3AF',
        borderRadius: 4,
        paddingVertical: 10,
        paddingRight: 30,  
        paddingLeft: 8,
        fontSize: 16,
    },

    clearButton: {
        position: 'absolute',
        right: 4,
        top: 6,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    clearText: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    submitButton: {
        height: 48,
        borderRadius: 999,
        backgroundColor: '#4B5563',
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
        color: '#9CA3AF',
    },
    characterImage: {
        width: 268.41,
        height: 218.3,
    },

});
