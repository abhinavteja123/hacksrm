import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
  Share,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { Colors, GRADES, getGrade } from '@/constants/Colors';
import { BLOCK_EXPLORER } from '@/constants/config';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getRecordById } from '@/lib/db';
import type { MediaRecord } from '@/lib/types';
import { TrustScoreCircle } from '@/components/TrustScoreCircle';

const { width } = Dimensions.get('window');

export default function VerifyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useThemeColors();
  const [record, setRecord] = useState<MediaRecord | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    crypto: true,
    blockchain: true,
    ai: true,
    originality: false,
    device: false,
  });

  useEffect(() => {
    if (id) {
      getRecordById(id).then(setRecord);
    }
  }, [id]);

  if (!record) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const grade = getGrade(record.trustScore);
  const gradeInfo = GRADES[grade];

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyText = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', `${label} copied to clipboard.`);
    } catch {}
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `ProofSnap Verification\n\nTrust Score: ${record.trustScore}/100 (Grade ${record.trustGrade})\nFile Hash: ${record.fileHash}\nBlockchain Tx: ${record.blockchainTx ?? 'Pending'}\n\nVerified by ProofSnap - Proof of Capture`,
      });
    } catch {}
  };

  const Section = ({
    id: sectionId,
    icon,
    title,
    children,
    delay = 0,
  }: {
    id: string;
    icon: string;
    title: string;
    children: React.ReactNode;
    delay?: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <View
        style={[
          styles.section,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
      >
        <Pressable onPress={() => toggleSection(sectionId)} style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name={icon as any} size={18} color={Colors.primary[500]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          </View>
          <Ionicons
            name={expandedSections[sectionId] ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>
        {expandedSections[sectionId] && <View style={styles.sectionContent}>{children}</View>}
      </View>
    </Animated.View>
  );

  const DataRow = ({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) => (
    <View style={styles.dataRow}>
      <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.dataValueRow}>
        <Text style={[styles.dataValue, { color: colors.text }]} numberOfLines={1} selectable>
          {value}
        </Text>
        {onCopy && (
          <Pressable onPress={onCopy} style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={14} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );

  const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <Text style={[styles.scoreBarLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.scoreBarValue, { color }]}>{(score * 100).toFixed(1)}%</Text>
      </View>
      <View style={[styles.scoreBarTrack, { backgroundColor: isDark ? Colors.dark.elevated : Colors.light.elevated }]}>
        <View style={[styles.scoreBarFill, { width: `${Math.min(score * 100, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.heroContainer}>
            <Image source={{ uri: record.fileUri }} style={styles.heroImage} resizeMode="cover" />
            {/* Watermark overlay preview */}
            <View style={styles.watermarkOverlay}>
              <View style={styles.watermarkBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                <Text style={styles.watermarkText}>ProofSnap Verified</Text>
              </View>
            </View>
            {/* Status pill */}
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    record.status === 'verified' ? Colors.success : record.status === 'failed' ? Colors.danger : Colors.warning,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {record.status === 'verified' ? 'Verified' : record.status === 'failed' ? 'Failed' : 'Pending'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Trust Score */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.scoreContainer}>
          <TrustScoreCircle score={record.trustScore} size={150} />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.actionsRow}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: Colors.primary[500],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share Proof</Text>
          </Pressable>

          {record.blockchainTx && (
            <Pressable
              onPress={() => Linking.openURL(`${BLOCK_EXPLORER}/tx/${record.blockchainTx}`)}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: isDark ? Colors.dark.elevated : Colors.light.elevated,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Ionicons name="open-outline" size={18} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>View On-Chain</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Cryptographic Proof */}
        <Section id="crypto" icon="finger-print" title="Cryptographic Proof" delay={400}>
          <DataRow
            label="File Hash (SHA-256)"
            value={record.fileHash}
            onCopy={() => copyText(record.fileHash, 'Hash')}
          />
          <DataRow
            label="Digital Signature"
            value={record.signature.substring(0, 40) + '...'}
            onCopy={() => copyText(record.signature, 'Signature')}
          />
          <DataRow
            label="Public Key"
            value={record.publicKey.substring(0, 40) + '...'}
            onCopy={() => copyText(record.publicKey, 'Public Key')}
          />
        </Section>

        {/* Blockchain Record */}
        <Section id="blockchain" icon="link" title="Blockchain Record" delay={500}>
          <DataRow
            label="Transaction Hash"
            value={record.blockchainTx ?? 'Pending'}
            onCopy={record.blockchainTx ? () => copyText(record.blockchainTx!, 'Tx Hash') : undefined}
          />
          <DataRow label="Block Number" value={record.blockNumber?.toString() ?? 'Pending'} />
          <DataRow label="Network" value="DataHaven Testnet" />
          <DataRow label="Timestamp" value={new Date(record.timestamp).toLocaleString()} />
        </Section>

        {/* AI Analysis */}
        <Section id="ai" icon="eye" title="AI Analysis" delay={600}>
          <ScoreBar
            label="Deepfake Detection"
            score={record.aiDeepfakeScore}
            color={record.aiDeepfakeScore > 0.3 ? Colors.danger : Colors.success}
          />
          <ScoreBar
            label="AI Generated"
            score={record.aiGeneratedScore}
            color={record.aiGeneratedScore > 0.3 ? Colors.danger : Colors.success}
          />
          <View style={[styles.verdictRow, { marginTop: 8 }]}>
            <Ionicons
              name={record.aiDeepfakeScore < 0.3 && record.aiGeneratedScore < 0.3 ? 'checkmark-circle' : 'warning'}
              size={18}
              color={record.aiDeepfakeScore < 0.3 && record.aiGeneratedScore < 0.3 ? Colors.success : Colors.danger}
            />
            <Text
              style={[
                styles.verdictText,
                {
                  color: record.aiDeepfakeScore < 0.3 && record.aiGeneratedScore < 0.3 ? Colors.success : Colors.danger,
                },
              ]}
            >
              {record.aiDeepfakeScore < 0.3 && record.aiGeneratedScore < 0.3
                ? 'Media appears genuine'
                : 'Potential manipulation detected'}
            </Text>
          </View>
        </Section>

        {/* Originality */}
        <Section id="originality" icon="search" title="Originality Check" delay={700}>
          <DataRow label="Plagiarism Score" value={`${record.plagiarismScore}%`} />
          <View style={styles.verdictRow}>
            <Ionicons
              name={record.plagiarismScore < 20 ? 'checkmark-circle' : 'warning'}
              size={18}
              color={record.plagiarismScore < 20 ? Colors.success : Colors.warning}
            />
            <Text
              style={[
                styles.verdictText,
                { color: record.plagiarismScore < 20 ? Colors.success : Colors.warning },
              ]}
            >
              {record.plagiarismScore < 20 ? 'Content appears original' : 'Similar content found'}
            </Text>
          </View>
        </Section>

        {/* Device Info */}
        <Section id="device" icon="phone-portrait" title="Device Info" delay={800}>
          <DataRow label="Platform" value={record.deviceInfo ?? 'Unknown'} />
          <DataRow label="Capture Time" value={new Date(record.createdAt).toLocaleString()} />
          <DataRow label="File Type" value={record.fileType.toUpperCase()} />
          <DataRow label="File Size" value={formatBytes(record.fileSize)} />
        </Section>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 20 },
  heroContainer: {
    width: width,
    height: width * 0.7,
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  watermarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  watermarkText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  statusPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  scoreContainer: { alignItems: 'center', paddingVertical: 20 },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  section: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
  },
  dataRow: { marginBottom: 10 },
  dataLabel: { fontSize: 11, fontWeight: '500', marginBottom: 3 },
  dataValueRow: { flexDirection: 'row', alignItems: 'center' },
  dataValue: { fontSize: 13, fontWeight: '600', flex: 1 },
  copyBtn: { padding: 4, marginLeft: 6 },
  scoreBarContainer: { marginBottom: 10 },
  scoreBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  scoreBarLabel: { fontSize: 12 },
  scoreBarValue: { fontSize: 12, fontWeight: '700' },
  scoreBarTrack: { height: 6, borderRadius: 3 },
  scoreBarFill: { height: 6, borderRadius: 3 },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verdictText: { fontSize: 13, fontWeight: '600' },
});
