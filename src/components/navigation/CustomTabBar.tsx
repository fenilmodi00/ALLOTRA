import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import tw from 'twrnc';

import HomeIcon from '../../assets/icons/home.svg';
import LikesIcon from '../../assets/icons/likes.svg';
import SearchIcon from '../../assets/icons/search.svg';
import ProfileIcon from '../../assets/icons/profile.svg';

const icons: { [key: string]: React.FC<any> } = {
  Home: HomeIcon,
  Likes: LikesIcon,
  Search: SearchIcon,
  Profile: ProfileIcon,
};

const labels: { [key: string]: string } = {
  Home: 'Home',
  Likes: 'Likes',
  Search: 'Search',
  Profile: 'Profile',
};

const activeColors: { [key: string]: { bg: string; border: string; text: string } } = {
  Home: { bg: '#DFD7F3', border: '#5B37B7', text: '#5B37B7' },
  Likes: { bg: '#F6D6EE', border: '#C9379D', text: '#C9379D' },
  Search: { bg: '#FBEFD3', border: '#E6A919', text: '#E6A919' },
  Profile: { bg: '#D1EBEF', border: '#1194AA', text: '#1194AA' },
};
const inactiveColor = '#44475C';
const tabBarBackgroundColor = '#FFFFFF';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={tw`absolute bottom-0 left-0 right-0 bg-[${tabBarBackgroundColor}] pb-5 px-5 border-t border-t-gray-200`}>
      <View style={tw`flex-row justify-around items-center bg-[${tabBarBackgroundColor}] h-[70px] rounded-full shadow-lg elevation-5`}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = labels[route.name] ?? options.title ?? route.name;

          const isFocused = state.index === index;
          const Icon = icons[route.name];

          // Return null if the icon for the route is not defined
          if (!Icon) {
            return null;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const activeColorSet = activeColors[route.name];

          const activeStyle = isFocused && activeColorSet ? {
            backgroundColor: activeColorSet.bg,
            borderColor: activeColorSet.border,
            borderWidth: 2,
          } : {};
          
          const iconColor = isFocused && activeColorSet ? activeColorSet.text : inactiveColor;
          const textColor = isFocused && activeColorSet ? { color: activeColorSet.text } : { color: inactiveColor };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              testID={`tab-${route.name}`}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                tw`flex-row items-center justify-center gap-2 rounded-full px-4 py-2.5 min-h-[50px] min-w-[50px]`,
                activeStyle
              ]}
            >
              <Icon width={24} height={24} fill={iconColor} />
              {isFocused && <Text style={[tw`text-sm font-bold ml-1`, textColor]}>{label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
} 