import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, withAlpha, ColorPalette } from '../theme/theme';
import { useThemeColors } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Program, categoryColors, categoryIcons } from '../data/mockData';
import AppText from './AppText';

const AUTO_ADVANCE_MS = 4500;
const SIDE_MARGIN = spacing.lg;

export default function HighlightCarousel({
  programs,
  onPressItem,
}: {
  programs: Program[];
  onPressItem: (program: Program) => void;
}) {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = windowWidth - SIDE_MARGIN * 2;
  const styles = React.useMemo(() => makeStyles(colors, slideWidth), [colors, slideWidth]);

  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [programs.length]);

  useEffect(() => {
    if (programs.length < 2) return;
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % programs.length;
      indexRef.current = next;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * (slideWidth + spacing.sm), animated: true });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [programs.length, slideWidth]);

  const handleMomentumEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (slideWidth + spacing.sm));
    indexRef.current = idx;
    setActiveIndex(idx);
  };

  if (programs.length === 0) return null;

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth + spacing.sm}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE_MARGIN }}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {programs.map((program, idx) => {
          const color = categoryColors[program.category];
          const hasPhoto = !!program.imageUri;
          return (
            <TouchableOpacity
              key={program.id}
              activeOpacity={0.9}
              onPress={() => onPressItem(program)}
              style={[
                styles.slide,
                { backgroundColor: color, marginRight: idx === programs.length - 1 ? 0 : spacing.sm },
              ]}
            >
              {hasPhoto ? (
                <>
                  <Image source={{ uri: program.imageUri }} style={styles.slidePhoto} />
                  <View style={styles.slideScrim} />
                </>
              ) : (
                <Ionicons
                  name={categoryIcons[program.category]}
                  size={110}
                  color="rgba(255,255,255,0.14)"
                  style={styles.slideWatermark}
                />
              )}
              <View style={styles.slideBadge}>
                <AppText style={styles.slideBadgeText}>{t(`category.${program.category}`)}</AppText>
              </View>
              <AppText style={styles.slideTitle} numberOfLines={2}>
                {program.title}
              </AppText>
              <View style={styles.slideMetaRow}>
                <Ionicons name="calendar-outline" size={13} color={withAlpha('#FFFFFF', 0.85)} />
                <AppText style={styles.slideMetaText} numberOfLines={1}>
                  {program.date}
                </AppText>
              </View>
              <View style={styles.slideMetaRow}>
                <Ionicons name="location-outline" size={13} color={withAlpha('#FFFFFF', 0.85)} />
                <AppText style={styles.slideMetaText} numberOfLines={1}>
                  {program.location}
                </AppText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {programs.length > 1 && (
        <View style={styles.dotsRow}>
          {programs.map((program, idx) => (
            <View key={program.id} style={[styles.dot, idx === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ColorPalette, slideWidth: number) =>
  StyleSheet.create({
    slide: {
      width: slideWidth,
      height: 140,
      borderRadius: radius.lg,
      padding: spacing.md,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    slideWatermark: {
      position: 'absolute',
      right: -16,
      top: -16,
    },
    slidePhoto: {
      ...StyleSheet.absoluteFill,
    },
    slideScrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    slideBadge: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      backgroundColor: 'rgba(255,255,255,0.22)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    slideBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.white,
    },
    slideTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.white,
      marginBottom: spacing.xs,
    },
    slideMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
    },
    slideMetaText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginTop: spacing.sm,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 16,
      backgroundColor: colors.primary,
    },
  });
