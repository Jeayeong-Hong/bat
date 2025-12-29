import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    ImageSourcePropType,
    PanResponder,
    PanResponderInstance,
} from 'react-native';
import { scale, fontScale } from '../../lib/layout';

type Props = {
    sources: ImageSourcePropType[];
    onBack: () => void;
    onStartLearning: (finalSources: ImageSourcePropType[]) => void;
};

const BG = '#F6F7FB';
const MASK_COLOR = 'rgba(0,0,0,0.35)';
const MIN_BOX = 80;

type CropRect = { x: number; y: number; w: number; h: number };
type DisplayRect = { dx: number; dy: number; dw: number; dh: number };

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

function getDisplayRect(cw: number, ch: number, iw: number, ih: number): DisplayRect {
    if (cw <= 0 || ch <= 0) return { dx: 0, dy: 0, dw: 0, dh: 0 };
    if (iw <= 0 || ih <= 0) return { dx: 0, dy: 0, dw: cw, dh: ch };

    const s = Math.min(cw / iw, ch / ih);
    const dw = iw * s;
    const dh = ih * s;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    return { dx, dy, dw, dh };
}

export default function SelectPicture({ sources, onBack, onStartLearning }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedSource = useMemo(() => {
        if (!sources || sources.length === 0) return null;
        return sources[Math.min(selectedIndex, sources.length - 1)];
    }, [sources, selectedIndex]);

    const recent4 = useMemo(() => (sources || []).slice(0, 4), [sources]);

    const [containerW, setContainerW] = useState(0);
    const [containerH, setContainerH] = useState(0);

    const [imageW, setImageW] = useState(0);
    const [imageH, setImageH] = useState(0);

    const displayRect = useMemo(() => {
        return getDisplayRect(containerW, containerH, imageW, imageH);
    }, [containerW, containerH, imageW, imageH]);

    const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

    const cropRef = useRef<CropRect>(crop);
    const displayRef = useRef<DisplayRect>(displayRect);
    const containerRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const imageRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

    useEffect(() => {
        cropRef.current = crop;
    }, [crop]);

    useEffect(() => {
        displayRef.current = displayRect;
    }, [displayRect]);

    useEffect(() => {
        containerRef.current = { w: containerW, h: containerH };
    }, [containerW, containerH]);

    useEffect(() => {
        imageRef.current = { w: imageW, h: imageH };
    }, [imageW, imageH]);

    useEffect(() => {
        if (!selectedSource) return;

        const anySrc: any = selectedSource;
        const uri = typeof anySrc?.uri === 'string' ? (anySrc.uri as string) : null;

        if (uri) {
            Image.getSize(
                uri,
                (w, h) => {
                    setImageW(w);
                    setImageH(h);
                },
                () => {
                    setImageW(0);
                    setImageH(0);
                }
            );
            return;
        }

        const anyImage: any = Image as any;
        if (typeof anyImage.resolveAssetSource === 'function') {
            const resolved = anyImage.resolveAssetSource(selectedSource);
            if (resolved?.width && resolved?.height) {
                setImageW(resolved.width);
                setImageH(resolved.height);
            }
        }
    }, [selectedSource]);

    useEffect(() => {
        if (displayRect.dw <= 0 || displayRect.dh <= 0) return;

        const w = displayRect.dw * 0.62;
        const h = displayRect.dh * 0.56;
        const x = displayRect.dx + (displayRect.dw - w) / 2;
        const y = displayRect.dy + (displayRect.dh - h) / 2;

        setCrop({ x, y, w, h });
    }, [displayRect.dx, displayRect.dy, displayRect.dw, displayRect.dh, selectedIndex]);

    const getPixelCrop = () => {
        const d = displayRef.current;
        const c = cropRef.current;
        const iw = imageRef.current.w;
        const ih = imageRef.current.h;

        if (d.dw <= 0 || d.dh <= 0 || iw <= 0 || ih <= 0) {
            return null;
        }

        const rx = (c.x - d.dx) / d.dw;
        const ry = (c.y - d.dy) / d.dh;
        const rw = c.w / d.dw;
        const rh = c.h / d.dh;

        const px = Math.round(rx * iw);
        const py = Math.round(ry * ih);
        const pw = Math.round(rw * iw);
        const ph = Math.round(rh * ih);

        return { px, py, pw, ph, imageW: iw, imageH: ih };
    };

    const handleStart = () => {
        if (!selectedSource) return;

        const pixelCrop = getPixelCrop();
        console.log('SelectedSource:', selectedSource);
        console.log('CropPixelRect:', pixelCrop);

        // 여기에서 AI/백엔드로 보낼 데이터:
        // 1) selectedSource(원본 이미지)
        // 2) pixelCrop(px, py, pw, ph)
        // 또는 프론트에서 crop 이미지 생성 후 그 결과 이미지만 전송

        onStartLearning(sources);
    };

    const handleRotateLeft = () => {
        // 다음 단계: rotation state를 만들고 프리뷰만 회전시키거나,
        // 학습 시작 시 rotation 값을 함께 전달하는 방식으로 연결
    };

    const handleRotateRight = () => {
        // 다음 단계: rotation state를 만들고 프리뷰만 회전시키거나,
        // 학습 시작 시 rotation 값을 함께 전달하는 방식으로 연결
    };

    const createMoveResponder = (): PanResponderInstance => {
        let start: CropRect = { x: 0, y: 0, w: 0, h: 0 };

        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                start = { ...cropRef.current };
            },
            onPanResponderMove: (_, g) => {
                const d = displayRef.current;

                const minX = d.dx;
                const minY = d.dy;
                const maxX = d.dx + d.dw - start.w;
                const maxY = d.dy + d.dh - start.h;

                const nx = clamp(start.x + g.dx, minX, maxX);
                const ny = clamp(start.y + g.dy, minY, maxY);

                setCrop((prev) => ({ ...prev, x: nx, y: ny }));
            },
        });
    };

    const createResizeResponder = (corner: 'tl' | 'tr' | 'bl' | 'br'): PanResponderInstance => {
        let start: CropRect = { x: 0, y: 0, w: 0, h: 0 };

        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                start = { ...cropRef.current };
            },
            onPanResponderMove: (_, g) => {
                const d = displayRef.current;

                const minW = MIN_BOX;
                const minH = MIN_BOX;

                if (corner === 'br') {
                    const maxW = d.dx + d.dw - start.x;
                    const maxH = d.dy + d.dh - start.y;

                    const nw = clamp(start.w + g.dx, minW, maxW);
                    const nh = clamp(start.h + g.dy, minH, maxH);

                    setCrop((prev) => ({ ...prev, w: nw, h: nh }));
                    return;
                }

                if (corner === 'tr') {
                    const maxW = d.dx + d.dw - start.x;
                    const minY = d.dy;
                    const maxH = start.y + start.h - minY;

                    const nw = clamp(start.w + g.dx, minW, maxW);
                    const nh = clamp(start.h - g.dy, minH, maxH);
                    const ny = clamp(start.y + g.dy, minY, start.y + start.h - minH);

                    setCrop(() => ({ x: start.x, y: ny, w: nw, h: nh }));
                    return;
                }

                if (corner === 'bl') {
                    const minX = d.dx;
                    const maxW = start.x + start.w - minX;
                    const maxH = d.dy + d.dh - start.y;

                    const nw = clamp(start.w - g.dx, minW, maxW);
                    const nh = clamp(start.h + g.dy, minH, maxH);
                    const nx = clamp(start.x + g.dx, minX, start.x + start.w - minW);

                    setCrop(() => ({ x: nx, y: start.y, w: nw, h: nh }));
                    return;
                }

                const minX = d.dx;
                const minY = d.dy;
                const maxW = start.x + start.w - minX;
                const maxH = start.y + start.h - minY;

                const nw = clamp(start.w - g.dx, minW, maxW);
                const nh = clamp(start.h - g.dy, minH, maxH);
                const nx = clamp(start.x + g.dx, minX, start.x + start.w - minW);
                const ny = clamp(start.y + g.dy, minY, start.y + start.h - minH);

                setCrop(() => ({ x: nx, y: ny, w: nw, h: nh }));
            },
        });
    };

    const moveResponder = useRef<PanResponderInstance>(createMoveResponder()).current;
    const tlResponder = useRef<PanResponderInstance>(createResizeResponder('tl')).current;
    const trResponder = useRef<PanResponderInstance>(createResizeResponder('tr')).current;
    const blResponder = useRef<PanResponderInstance>(createResizeResponder('bl')).current;
    const brResponder = useRef<PanResponderInstance>(createResizeResponder('br')).current;

    const overlayStyles = useMemo(() => {
        const cw = containerRef.current.w;
        const ch = containerRef.current.h;
        const c = cropRef.current;

        const topH = clamp(c.y, 0, ch);
        const bottomTop = clamp(c.y + c.h, 0, ch);
        const bottomH = clamp(ch - bottomTop, 0, ch);

        const leftW = clamp(c.x, 0, cw);
        const rightLeft = clamp(c.x + c.w, 0, cw);
        const rightW = clamp(cw - rightLeft, 0, cw);

        return {
            top: { height: topH },
            bottom: { top: bottomTop, height: bottomH },
            left: { top: c.y, height: c.h, width: leftW },
            right: { left: rightLeft, top: c.y, height: c.h, width: rightW },
            frame: { left: c.x, top: c.y, width: c.w, height: c.h },
        };
    }, [crop, containerW, containerH]);

    return (
        <View style={styles.root}>
            <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
                <Image
                    source={require('../../../assets/shift.png')}
                    style={styles.backIcon}
                    resizeMode="contain"
                />
            </Pressable>

            <View style={styles.centerWrap}>
                <Text style={styles.guide}>원하는 개념 한 가지만 포함되도록 잘라주세요.</Text>

                <View style={styles.previewWrap}>
                    {selectedSource ? (
                        <View
                            style={styles.previewInner}
                            onLayout={(e) => {
                                const { width, height } = e.nativeEvent.layout;
                                setContainerW(width);
                                setContainerH(height);
                            }}
                        >
                            <Image source={selectedSource} style={styles.previewImage} resizeMode="contain" />

                            <View style={styles.cropArea} pointerEvents="box-none">
                                <View style={[styles.maskTop, overlayStyles.top]} />
                                <View style={[styles.maskBottom, overlayStyles.bottom]} />
                                <View style={[styles.maskLeft, overlayStyles.left]} />
                                <View style={[styles.maskRight, overlayStyles.right]} />

                                <View style={[styles.cropFrame, overlayStyles.frame]} {...moveResponder.panHandlers}>
                                    <View style={styles.cropCornerTL} />
                                    <View style={styles.cropCornerTR} />
                                    <View style={styles.cropCornerBL} />
                                    <View style={styles.cropCornerBR} />

                                    <View style={[styles.handle, styles.handleTL]} {...tlResponder.panHandlers}>
                                        <View style={styles.handleDot} />
                                    </View>
                                    <View style={[styles.handle, styles.handleTR]} {...trResponder.panHandlers}>
                                        <View style={styles.handleDot} />
                                    </View>
                                    <View style={[styles.handle, styles.handleBL]} {...blResponder.panHandlers}>
                                        <View style={styles.handleDot} />
                                    </View>
                                    <View style={[styles.handle, styles.handleBR]} {...brResponder.panHandlers}>
                                        <View style={styles.handleDot} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>선택된 이미지가 없습니다.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.rotateRow}>
                    <Pressable style={styles.rotateBtn} onPress={handleRotateLeft} hitSlop={10}>
                        <Image
                            source={require('../../../assets/turn-icon.png')}
                            style={styles.rotateIcon}
                            resizeMode="contain"
                        />
                    </Pressable>

                    <Pressable style={styles.rotateBtn} onPress={handleRotateRight} hitSlop={10}>
                        <Image
                            source={require('../../../assets/turn-icon.png')}
                            style={[styles.rotateIcon, styles.rotateRight]}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>

                <View style={styles.recentWrap}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recentRow}
                    >
                        {recent4.map((src, idx) => {
                            const active = idx === selectedIndex;
                            return (
                                <Pressable
                                    key={String(idx)}
                                    onPress={() => setSelectedIndex(idx)}
                                    style={[styles.thumbBtn, active && styles.thumbBtnActive]}
                                >
                                    <Image source={src} style={styles.thumb} />
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>

            <Pressable
                style={[styles.fab, (!sources || sources.length === 0) && { opacity: 0.5 }]}
                onPress={handleStart}
                disabled={!sources || sources.length === 0}
            >
                <View style={styles.fabCircle}>
                    <View style={styles.checkWrap}>
                        <View style={styles.checkShort} />
                        <View style={styles.checkLong} />
                    </View>
                </View>
                <Text style={styles.fabText}>학습 시작</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },

    backBtn: {
        position: 'absolute',
        left: scale(18),
        top: scale(22),
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    backIcon: {
        width: scale(20),
        height: scale(20),
        transform: [{ rotate: '180deg' }],
    },

    centerWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(16),
    },

    guide: {
        textAlign: 'center',
        fontSize: fontScale(20),
        fontWeight: '900',
        color: '#111827',
        marginBottom: scale(18),
    },

    previewWrap: {
        width: '100%',
        maxWidth: scale(520),
        height: scale(360),
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewInner: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },

    empty: {
        width: '100%',
        height: '100%',
        borderRadius: scale(16),
        backgroundColor: 'rgba(0,0,0,0.04)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: fontScale(13),
        fontWeight: '700',
    },

    cropArea: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },

    maskTop: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        backgroundColor: MASK_COLOR,
    },
    maskBottom: {
        position: 'absolute',
        left: 0,
        width: '100%',
        backgroundColor: MASK_COLOR,
    },
    maskLeft: {
        position: 'absolute',
        left: 0,
        backgroundColor: MASK_COLOR,
    },
    maskRight: {
        position: 'absolute',
        backgroundColor: MASK_COLOR,
    },

    cropFrame: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.9)',
    },

    cropCornerTL: {
        position: 'absolute',
        left: 6,
        top: 6,
        width: 18,
        height: 18,
        borderLeftWidth: 2,
        borderTopWidth: 2,
        borderColor: '#FFFFFF',
    },
    cropCornerTR: {
        position: 'absolute',
        right: 6,
        top: 6,
        width: 18,
        height: 18,
        borderRightWidth: 2,
        borderTopWidth: 2,
        borderColor: '#FFFFFF',
    },
    cropCornerBL: {
        position: 'absolute',
        left: 6,
        bottom: 6,
        width: 18,
        height: 18,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#FFFFFF',
    },
    cropCornerBR: {
        position: 'absolute',
        right: 6,
        bottom: 6,
        width: 18,
        height: 18,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#FFFFFF',
    },

    handle: {
        position: 'absolute',
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    handleDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.95)',
    },
    handleTL: { left: -17, top: -17 },
    handleTR: { right: -17, top: -17 },
    handleBL: { left: -17, bottom: -17 },
    handleBR: { right: -17, bottom: -17 },

    rotateRow: {
        width: '100%',
        maxWidth: scale(520),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(14),
        marginBottom: scale(6),
        paddingHorizontal: scale(48),
    },
    rotateBtn: {
        width: scale(48),
        height: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    rotateIcon: {
        width: scale(28),
        height: scale(28),
    },
    rotateRight: {
        transform: [{ scaleX: -1 }],
    },

    recentWrap: {
        marginTop: scale(10),
        height: scale(78),
        alignItems: 'center',
        justifyContent: 'center',
    },
    recentRow: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(12),
        paddingHorizontal: scale(8),
    },
    thumbBtn: {
        borderRadius: scale(12),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbBtnActive: {
        borderColor: '#5E82FF',
    },
    thumb: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(10),
    },

    fab: {
        position: 'absolute',
        right: scale(24),
        bottom: scale(24),
        width: scale(120),
        height: scale(120),
        borderRadius: scale(24),
        backgroundColor: '#5E82FF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    fabCircle: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(32),
        borderWidth: 4,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scale(10),
    },

    checkWrap: {
        width: scale(34),
        height: scale(24),
        position: 'relative',
        transform: [{ rotate: '-45deg' }],
    },
    checkShort: {
        position: 'absolute',
        left: scale(6),
        top: scale(8),
        width: scale(4),
        height: scale(10),
        borderRadius: scale(2),
        backgroundColor: '#FFFFFF',
    },
    checkLong: {
        position: 'absolute',
        left: scale(10),
        top: scale(14),
        width: scale(22),
        height: scale(4),
        borderRadius: scale(2),
        backgroundColor: '#FFFFFF',
    },

    fabText: {
        color: '#FFFFFF',
        fontSize: fontScale(14),
        fontWeight: '900',
    },
});