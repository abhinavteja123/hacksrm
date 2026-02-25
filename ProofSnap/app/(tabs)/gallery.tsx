import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppStore } from '@/stores/media-store';
import { MediaCard } from '@/components/MediaCard';
import type { MediaRecord } from '@/lib/types';

const { width } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (width - 32 - CARD_GAP) / 2;

type FilterType = 'all' | 'verified' | 'pending' | 'failed';

export default function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useThemeColors();
  const { records, loadRecords } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  const filtered = filter === 'all'
    ? records
    : records.filter((r) => r.status === filter);

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'verified', label: 'Verified', icon: 'checkmark-circle' },
    { key: 'pending', label: 'Pending', icon: 'time' },
    { key: 'failed', label: 'Failed', icon: 'close-circle' },
  ];

  const renderItem = ({ item, index }: { item: MediaRecord; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={{ width: CARD_WIDTH }}
    >
      <MediaCard record={item} />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Gallery</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filtered.length} {filter === 'all' ? 'total' : filter} items
        </Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === f.key
                    ? Colors.primary[500]
                    : isDark
                    ? Colors.dark.card
                    : Colors.light.card,
                borderColor:
                  filter === f.key
                    ? Colors.primary[500]
                    : isDark
                    ? Colors.dark.border
                    : Colors.light.border,
              },
            ]}
          >
            <Ionicons
              name={f.icon as any}
              size={14}
              color={filter === f.key ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === f.key ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Grid */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.4 }} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {filter === 'all' ? 'No verified media yet' : `No ${filter} items`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, marginBottom: 14 },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 18,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  filterText: { fontSize: 12, fontWeight: '700' },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridContent: { paddingBottom: 24 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyText: { fontSize: 16, fontWeight: '700', marginTop: 16 },
});
