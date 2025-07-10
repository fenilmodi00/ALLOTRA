import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function SwipeableRow({ children, onDelete, onEdit }: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const theme = useAppTheme();

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-80, -60, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        {onEdit && (
          <Animated.View style={{ transform: [{ scale }], opacity }}>
            <RectButton
              style={[styles.action, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                swipeableRef.current?.close();
                onEdit();
              }}
            >
              <MaterialCommunityIcons name="pencil" size={24} color="white" />
            </RectButton>
          </Animated.View>
        )}
        {onDelete && (
          <Animated.View style={{ transform: [{ scale }], opacity }}>
            <RectButton
              style={[styles.action, { backgroundColor: theme.colors.error }]}
              onPress={() => {
                swipeableRef.current?.close();
                onDelete();
              }}
            >
              <MaterialCommunityIcons name="trash-can" size={24} color="white" />
            </RectButton>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    width: 64,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 