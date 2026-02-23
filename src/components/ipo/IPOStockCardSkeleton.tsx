import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Skeleton } from '../ui/Skeleton'
import { growwColors } from '../../design-system/tokens/colors'

/**
 * Skeleton placeholder that mirrors the IPOStockCard layout:
 *   176×160px card
 *   - dot  top-right  (12×12)
 *   - logo top-left   (38×38, borderRadius 12)
 *   - name line       (top ~58, ~110px wide, h 16)
 *   - price line      (top ~89, ~80px wide, h 15)
 *   - GMP line        (top ~109, ~100px wide, h 13)
 */
export const IPOStockCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Status dot — top-right */}
      <Skeleton width={10} height={10} borderRadius={5} style={styles.dot} />

      {/* Company logo — top-left */}
      <Skeleton width={38} height={38} borderRadius={12} style={styles.logo} />

      {/* Name line */}
      <Skeleton width={110} height={14} borderRadius={4} style={styles.name} />

      {/* Price line */}
      <Skeleton width={80} height={13} borderRadius={4} style={styles.price} />

      {/* GMP line */}
      <Skeleton width={100} height={12} borderRadius={4} style={styles.gmp} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 176,
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: growwColors.border,
    backgroundColor: growwColors.surface,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  logo: {
    position: 'absolute',
    top: 13,
    left: 14,
  },
  name: {
    position: 'absolute',
    top: 63,
    left: 14,
  },
  price: {
    position: 'absolute',
    top: 89,
    left: 14,
  },
  gmp: {
    position: 'absolute',
    top: 113,
    left: 14,
  },
})
