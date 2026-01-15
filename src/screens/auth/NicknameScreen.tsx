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
import { scale, fontScale } from '../../lib/layout';

type Props = {
    onConfirm: (nickname: string) => void;
};

export default function NicknameScreen({ onConfirm }: Props) {
    const [nickname, setNickname] = useState('');
    const [errorText, setErrorText] = useState('');

    const trimmed = nickname.trim();
    const isValid = trimmed.length > 0;

    const handleChange = (text: string) => {
        setNickname(text);
    };

    const handleClear = () => {
        setNickname('');
    };

    const handleSubmit = () => {
        if (!isValid) return;
        onConfirm(trimmed);
    };
    const handleChangeNickname = (text: string) => {
        setNickname(text);

        if (text.length === 0) {
            setErrorText('');
            return;
        }

        if (text.length < 2) {
            setErrorText('닉네임이 너무 짧습니다. 최소 2자 이상 입력해 주세요');
            return;
        }

        if (text.length > 10) {
            setErrorText('닉네임이 너무 깁니다. 최대 10자 이내로 입력해 주세요');
            return;
        }

        setErrorText('');
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

                {/* 오른쪽 입력 영역 */}
                <View style={styles.rightBox}>
                    <Text style={styles.title}>닉네임을 입력해주세요!</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            value={nickname}
                            onChangeText={handleChangeNickname}
                            placeholder="닉네임 입력"
                            placeholderTextColor="#9CA3AF"
                            style={styles.input}
                        />

                        {nickname.length > 0 && (
                            <Pressable style={styles.clearBtn} onPress={handleClear}>
                                <Text style={styles.clearText}>✕</Text>
                            </Pressable>
                        )}
                    </View>

                    <Text style={[styles.helperText, !errorText && { opacity: 0 }]}>
                        {errorText || ' '}
                    </Text>

                    <Pressable
                        style={[
                            styles.button,
                            !isValid && styles.buttonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!isValid}
                    >
                        <Text style={styles.buttonText}>확인</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const BG = '#F3F4F6';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
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
        marginBottom: scale(24),
    },
    inputWrapper: {
        marginBottom: scale(4),
        position: 'relative',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
        paddingVertical: scale(10),
        paddingRight: scale(32),
        fontSize: fontScale(18),
        paddingHorizontal: scale(8),
    },
    clearBtn: {
        position: 'absolute',
        right: scale(4),
        top: '50%',
        marginTop: -scale(16),
        paddingHorizontal: scale(4),
        paddingVertical: scale(4),
    },
    clearText: {
        fontSize: fontScale(16),
        color: '#9CA3AF',
    },
    button: {
        marginTop: scale(8),
        height: scale(64),
        borderRadius: scale(999),
        backgroundColor: '#5E82FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: fontScale(35),
        fontWeight: '700',
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
