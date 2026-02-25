import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

import { Colors } from '@/constants/Colors';
import { BLOCK_EXPLORER } from '@/constants/config';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppStore } from '@/stores/media-store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useThemeColors();
  const { publicKey, walletAddress, walletBalance, stats, refreshWallet, refreshStats } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      refreshWallet();
      refreshStats();
    }, [])
  );

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied!', `${label} copied to clipboard.`);
    } catch {
      Alert.alert('Error', 'Failed to copy.');
    }
  };

  const InfoRow = ({
    icon,
    label,
    value,
    copyable,
    delay = 0,
  }: {
    icon: string;
    label: string;
    value: string;
    copyable?: boolean;
    delay?: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <View
        style={[
          styles.infoRow,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: isDark ? Colors.dark.elevated : Colors.primary[50] }]}>
          <Ionicons name={icon as any} size={18} color={Colors.primary[500]} />
        </View>
        <View style={styles.infoContent}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
            {value}
          </Text>
        </View>
        {copyable && (
          <Pressable
            onPress={() => copyToClipboard(value, label)}
            style={({ pressed }) => [styles.copyButton, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerSection}>
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.headerTitle, { color: colors.text }]}>ProofSnap</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Media Authentication System
          </Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.statsContainer, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.border : Colors.light.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.primary[500] }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? Colors.dark.border : Colors.light.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>{stats.verified}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Verified</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? Colors.dark.border : Colors.light.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{stats.onChain}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>On-Chain</Text>
          </View>
        </Animated.View>

        {/* Device Key Section */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Device Key</Text>
        </Animated.View>

        <InfoRow
          icon="key"
          label="Ed25519 Public Key"
          value={publicKey ?? 'Not generated'}
          copyable={!!publicKey}
          delay={300}
        />

        {/* Blockchain Section */}
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Blockchain Wallet</Text>
        </Animated.View>

        <InfoRow
          icon="wallet"
          label="Wallet Address"
          value={walletAddress ?? 'Loading...'}
          copyable={!!walletAddress}
          delay={400}
        />

        <InfoRow
          icon="diamond"
          label="Testnet Balance (MOCK)"
          value={`${walletBalance} MOCK`}
          delay={450}
        />

        <InfoRow
          icon="globe"
          label="Network"
          value="DataHaven Testnet"
          delay={500}
        />

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(550).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        </Animated.View>

        <InfoRow icon="information-circle" label="Version" value="1.0.0" delay={600} />
        <InfoRow icon="shield" label="Security" value="Ed25519 + SHA-256" delay={650} />
        <InfoRow icon="link" label="Blockchain" value="DataHaven (EVM)" delay={700} />
        <InfoRow icon="eye" label="AI Detection" value="SightEngine" delay={750} />

        {/* How It Works */}
        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <View style={[styles.howItWorks, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.border : Colors.light.border }]}>
            <Text style={[styles.howTitle, { color: colors.text }]}>How ProofSnap Works</Text>
            {[
              { step: '1', text: 'Capture or import media', icon: 'camera' },
              { step: '2', text: 'Generate SHA-256 hash', icon: 'finger-print' },
              { step: '3', text: 'Sign with Ed25519 device key', icon: 'key' },
              { step: '4', text: 'Anchor proof on DataHaven blockchain', icon: 'link' },
              { step: '5', text: 'AI deepfake & plagiarism analysis', icon: 'eye' },
              { step: '6', text: 'Compute trust score & watermark', icon: 'shield-checkmark' },
            ].map((item) => (
              <View key={item.step} style={styles.howStep}>
                <View style={[styles.howStepNumber, { backgroundColor: Colors.primary[500] + '20' }]}>
                  <Text style={[styles.howStepNumberText, { color: Colors.primary[500] }]}>{item.step}</Text>
                </View>
                <Text style={[styles.howStepText, { color: colors.text }]}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 10 },
  headerSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 36 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10, marginTop: 10 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    gap: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  infoValue: { fontSize: 14, fontWeight: '600', marginTop: 3 },
  copyButton: { padding: 10 },
  howItWorks: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginTop: 12,
  },
  howTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  howStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  howStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howStepNumberText: { fontSize: 14, fontWeight: '800' },
  howStepText: { fontSize: 14, flex: 1, fontWeight: '500' },
});
