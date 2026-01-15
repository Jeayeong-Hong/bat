import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, ImageSourcePropType } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { scale, fontScale } from '../../lib/layout';

type Props = {
    onBack: () => void;
    onDone: (sources: ImageSourcePropType[]) => void;
};

type TimerSec = 0 | 3 | 5 | 10;
type Facing = 'back' | 'front';
type Flash = 'off' | 'on' | 'auto';

const BG = '#0B0F1A';

export default function TakePicture({ onBack, onDone }: Props) {
    const cameraRef = useRef<CameraView | null>(null);

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);

    const [facing, setFacing] = useState<Facing>('back');
    const [flash, setFlash] = useState<Flash>('off');
    const [timer, setTimer] = useState<TimerSec>(0);

    const [countdown, setCountdown] = useState<number>(0);
    const [isCounting, setIsCounting] = useState(false);

    const [shots, setShots] = useState<ImageSourcePropType[]>([]);

    useEffect(() => {
        (async () => {
            const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasMediaPermission(media.status === 'granted');

            if (!cameraPermission?.granted) {
                await requestCameraPermission();
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canShoot = useMemo(() => {
        return cameraPermission?.granted === true && !isCounting;
    }, [cameraPermission?.granted, isCounting]);

    const toggleTimer = () => {
        setTimer((prev) => {
            if (prev === 0) return 3;
            if (prev === 3) return 5;
            if (prev === 5) return 10;
            return 0;
        });
    };

    const toggleFlash = () => {
        setFlash((prev) => (prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'));
    };

    const toggleFacing = () => {
        setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
    };

    const handlePickFromGallery = async () => {
        if (hasMediaPermission !== true) return;

        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsMultipleSelection: true,
            selectionLimit: 10,
        });

        if (res.canceled) return;

        const sources = res.assets.map((a) => ({ uri: a.uri } as ImageSourcePropType));
        setShots((prev) => [...prev, ...sources]);
    };

    const shootNow = async () => {
        try {
            if (!cameraRef.current) return;

            const cam: any = cameraRef.current;
            const photo = await cam.takePictureAsync({
                quality: 1,
                skipProcessing: Platform.OS === 'android' ? false : false,
            });

            if (photo?.uri) {
                setShots((prev) => [{ uri: photo.uri } as ImageSourcePropType, ...prev]);
            }
        } catch (e) {
            console.log('촬영 실패:', e);
        }
    };

    const handleShutter = async () => {
        if (!canShoot) return;

        if (timer === 0) {
            await shootNow();
            return;
        }

        setIsCounting(true);
        setCountdown(timer);

        let t = timer;
        const id = setInterval(async () => {
            t -= 1;
            setCountdown(t);

            if (t <= 0) {
                clearInterval(id);
                setIsCounting(false);
                setCountdown(0);
                await shootNow();
            }
        }, 1000);
    };

    const handleDone = () => {
        if (shots.length === 0) return;
        onDone(shots);
    };

    if (cameraPermission?.granted === false) {
        return (
            <View style={[styles.root, styles.center]}>
                <Text style={{ color: '#fff', marginBottom: scale(12) }}>
                    카메라 권한이 필요합니다.
                </Text>

                <Pressable style={styles.primaryBtn} onPress={requestCameraPermission}>
                    <Text style={styles.primaryBtnText}>권한 요청</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.primaryBtn,
                        { marginTop: scale(10), backgroundColor: '#22C55E' },
                    ]}
                    onPress={() => {
                        onDone([
                            require('../../../assets/dummy/text1.jpg'),
                            require('../../../assets/dummy/text2.jpg'),
                            require('../../../assets/dummy/text3.jpg'),
                            require('../../../assets/dummy/text4.jpg'),
                        ]);
                    }}
                >
                    <Text style={styles.primaryBtnText}>(임시) SelectPicture 테스트</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.primaryBtn,
                        { marginTop: scale(10), backgroundColor: 'rgba(255,255,255,0.15)' },
                    ]}
                    onPress={onBack}
                >
                    <Text style={styles.primaryBtnText}>뒤로가기</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <View style={styles.cameraWrap}>
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    facing={facing}
                    flash={flash}
                    ratio="16:9"
                />

                <View style={styles.topBar}>
                    <Pressable style={styles.backChip} onPress={onBack}>
                        <Image
                            source={require('../../../assets/shift.png')}
                            style={styles.backIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                    <Text style={styles.topTitle}>자료 입력</Text>
                    <View style={{ width: scale(28) }} />
                </View>

                {isCounting && countdown > 0 && (
                    <View style={styles.countOverlay}>
                        <Text style={styles.countText}>{countdown}</Text>
                    </View>
                )}

                <View style={styles.rightButtons}>
                    <Pressable style={styles.iconBtn} onPress={toggleTimer}>
                        <Text style={styles.iconText}>⏱</Text>
                        <Text style={styles.iconSub}>{timer === 0 ? 'OFF' : `${timer}s`}</Text>
                    </Pressable>

                    <Pressable style={styles.iconBtn} onPress={toggleFlash}>
                        <Text style={styles.iconText}>⚡</Text>
                        <Text style={styles.iconSub}>{flash.toUpperCase()}</Text>
                    </Pressable>

                    <Pressable style={styles.iconBtn} onPress={toggleFacing}>
                        <Text style={styles.iconText}>🔄</Text>
                    </Pressable>

                    <Pressable style={[styles.shutterOuter, !canShoot && { opacity: 0.5 }]} onPress={handleShutter}>
                        <View style={styles.shutterInner} />
                    </Pressable>

                    <Pressable style={styles.iconBtn} onPress={handlePickFromGallery}>
                        <Text style={styles.iconText}>🖼</Text>
                    </Pressable>

                    <Pressable style={styles.iconBtn} onPress={() => { }}>
                        <Text style={styles.iconText}>📁</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.doneBtn, shots.length === 0 && { opacity: 0.5 }]}
                        onPress={handleDone}
                        disabled={shots.length === 0}
                    >
                        <Text style={styles.doneText}>촬영 완료</Text>
                    </Pressable>
                </View>

                {shots.length > 0 && (
                    <View style={styles.bottomThumbs}>
                        {shots.slice(0, 5).map((src, idx) => (
                            <Image key={String(idx)} source={src} style={styles.thumb} />
                        ))}
                        {shots.length > 5 && <Text style={styles.moreText}>+{shots.length - 5}</Text>}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    cameraWrap: { flex: 1 },

    center: { justifyContent: 'center', alignItems: 'center' },
    primaryBtn: {
        paddingHorizontal: scale(14),
        paddingVertical: scale(10),
        borderRadius: scale(14),
        backgroundColor: '#5E82FF',
    },
    primaryBtnText: { color: '#fff', fontSize: fontScale(13), fontWeight: '800' },

    topBar: {
        position: 'absolute',
        top: scale(18),
        left: scale(16),
        right: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 5,
    },
    topTitle: { color: '#fff', fontSize: fontScale(16), fontWeight: '800' },
    backChip: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        width: scale(18),
        height: scale(18),
        transform: [{ rotate: '180deg' }],
    },

    rightButtons: {
        position: 'absolute',
        right: scale(14),
        top: scale(80),
        bottom: scale(90),
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(14),
        zIndex: 5,
    },
    iconBtn: { width: scale(44), alignItems: 'center', gap: scale(2) },
    iconText: { color: '#fff', fontSize: fontScale(18) },
    iconSub: { color: '#fff', fontSize: fontScale(10), opacity: 0.85 },

    shutterOuter: {
        width: scale(58),
        height: scale(58),
        borderRadius: scale(29),
        borderWidth: 3,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: scale(6),
    },
    shutterInner: { width: scale(44), height: scale(44), borderRadius: scale(22), backgroundColor: '#fff' },

    doneBtn: {
        marginTop: scale(10),
        paddingHorizontal: scale(10),
        paddingVertical: scale(8),
        borderRadius: scale(14),
        backgroundColor: '#5E82FF',
    },
    doneText: { color: '#fff', fontSize: fontScale(11), fontWeight: '800' },

    bottomThumbs: {
        position: 'absolute',
        left: scale(16),
        bottom: scale(18),
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        zIndex: 5,
    },
    thumb: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(10),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    moreText: { color: '#fff', fontSize: fontScale(12), fontWeight: '800', marginLeft: scale(4) },

    countOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 6,
    },
    countText: { color: '#fff', fontSize: fontScale(72), fontWeight: '900' },
});
