import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ChatsScreen from '../screens/ChatsScreen';
import FeedScreen from '../screens/FeedScreen';
import HubScreen from '../screens/HubScreen';
import ReelsScreen from '../screens/ReelsScreen';
import { useM7Theme } from '../theme/M7ThemeProvider';

const Tab = createBottomTabNavigator();
const ChatsStack = createNativeStackNavigator();

function ChatsStackNavigator() {
  const { theme } = useM7Theme();

  return (
    <ChatsStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <ChatsStack.Screen name="ChatsList" component={ChatsScreen} />
      <ChatsStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ChatsStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const { theme } = useM7Theme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.electricGreen,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.deepNeonPurple,
          },
        ],
        tabBarLabelStyle: {
          ...styles.tabLabel,
          fontFamily: theme.fonts.bodyMedium,
        },
      }}
    >
      <Tab.Screen name="Chats" component={ChatsStackNavigator} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Reels" component={ReelsScreen} />
      <Tab.Screen name="HubM7" component={HubScreen} options={{ tabBarLabel: 'Hub M7' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabLabel: {},
});
