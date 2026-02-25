import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppStore } from '@/stores/media-store';
import { MediaListCard } from '@/components/MediaCard';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useThemeColors();
  const { records, stats, publicKey, loadRecords, refreshStats } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
      refreshStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadRecords(), refreshStats()]);
    setRefreshing(false);
  };

  const recent = records.slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome to</Text>
            <Text style={[styles.appName, { color: colors.text }]}>ProofSnap</Text>
          </View>
          <View style={[styles.keyPill, { backgroundColor: isDark ? Colors.dark.elevated : Colors.light.elevated }]}>
            <Ionicons name="key" size={14} color={Colors.primary[500]} />
            <Text style={[styles.keyPillText, { color: Colors.primary[500] }]}>Keys Active</Text>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statsRow}>
          <LinearGradient
            colors={isDark ? ['#1E3A8A', '#1E40AF'] : ['#3B82F6', '#2563EB']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
            <Ionicons name="camera" size={36} color="rgba(255,255,255,0.12)" style={styles.statBgIcon} />
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#064E3B', '#065F46'] : ['#10B981', '#059669']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statNumber}>{stats.verified}</Text>
            <Text style={styles.statLabel}>Verified</Text>
            <Ionicons name="shield-checkmark" size={36} color="rgba(255,255,255,0.12)" style={styles.statBgIcon} />
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#4C1D95', '#5B21B6'] : ['#8B5CF6', '#7C3AED']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statNumber}>{stats.onChain}</Text>
            <Text style={styles.statLabel}>On-Chain</Text>
            <Ionicons name="link" size={36} color="rgba(255,255,255,0.12)" style={styles.statBgIcon} />
          </LinearGradient>
        </Animated.View>

        {/* Quick Action */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Pressable
            onPress={() => router.push('/(tabs)/capture')}
            style={({ pressed }) => [
              styles.captureButton,
              {
                backgroundColor: Colors.primary[500],
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Ionicons name="camera" size={22} color="#FFFFFF" />
            <Text style={styles.captureButtonText}>Capture & Verify</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            {records.length > 5 && (
              <Pressable onPress={() => router.push('/(tabs)/gallery')}>
                <Text style={[styles.seeAll, { color: Colors.primary[500] }]}>See All</Text>
              </Pressable>
            )}
          </View>

          {recent.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.border : Colors.light.border }]}>
              <Ionicons name="images-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No media verified yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Capture or import a photo to get started
              </Text>
            </View>
          ) : (
            recent.map((record, index) => (
              <Animated.View key={record.id} entering={FadeInRight.delay(500 + index * 80).springify()}>
                <MediaListCard record={record} />
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <View style={[styles.infoCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.border : Colors.light.border }]}>
            <View style={styles.infoRow}>
              <Ionicons name="finger-print" size={20} color={Colors.primary[500]} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Your Device Key</Text>
                <Text style={[styles.infoValue, { color: colors.textSecondary }]} numberOfLines={1}>
                  {publicKey ? publicKey.substring(0, 24) + '...' : 'Not generated'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, fontWeight: '500' },
  appName: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  keyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  keyPillText: { fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    overflow: 'hidden',
    minHeight: 88,
  },
  statNumber: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 4 },
  statBgIcon: { position: 'absolute', bottom: -2, right: -2 },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  captureButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySubtext: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 12, marginTop: 2 },
});
