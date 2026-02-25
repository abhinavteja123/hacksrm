import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1A2332' : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 96 : 76,
          paddingBottom: Platform.OS === 'ios' ? 32 : 18,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              props.onPress?.(e);
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={22}
                color={color}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.primary[500] }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.captureWrapper}>
              <LinearGradient
                colors={focused ? ['#3B82F6', '#8B5CF6'] : (isDark ? ['#334155', '#334155'] : ['#E2E8F0', '#E2E8F0'])}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.captureIconContainer}
              >
                <Ionicons
                  name="camera"
                  size={26}
                  color={focused ? '#FFFFFF' : color}
                />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? 'images' : 'images-outline'}
                size={22}
                color={color}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.primary[500] }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? 'scan-circle' : 'scan-circle-outline'}
                size={22}
                color={color}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.primary[500] }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.primary[500] }]} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  captureWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  captureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
