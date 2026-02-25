import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppStore } from '@/stores/media-store';
import { VerificationSteps } from '@/components/VerificationSteps';
import { TrustScoreCircle } from '@/components/TrustScoreCircle';

export default function CaptureScreen() {
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showVerification, setShowVerification] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useThemeColors();
  const router = useRouter();
  const { startVerification, currentVerification, clearVerification } = useAppStore();

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
      });

      if (photo?.uri) {
        setShowVerification(true);
        await startVerification(photo.uri, 'image');
      }
    } catch (error) {
      console.error('Capture failed:', error);
      Alert.alert('Capture Failed', 'Please try again.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileType = asset.type === 'video' ? 'video' : 'image';
        setShowVerification(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await startVerification(asset.uri, fileType as 'image' | 'video');
      }
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert('Import Failed', 'Please try again.');
    }
  };

  const handleDismissVerification = () => {
    setShowVerification(false);
    const result = currentVerification?.result;
    clearVerification();
    if (result) {
      router.push(`/verify/${result.id}` as any);
    }
  };

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="camera-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
        <Text style={[styles.permissionText, { color: colors.text }]}>Camera Access Required</Text>
        <Text style={[styles.permissionSubtext, { color: colors.textSecondary }]}>
          ProofSnap needs camera access to capture and verify media authenticity.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={[styles.permissionButton, { backgroundColor: Colors.primary[500] }]}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
        <Pressable onPress={handleImport} style={styles.importAltButton}>
          <Text style={[styles.importAltText, { color: Colors.primary[500] }]}>
            Or import from gallery
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Top overlay */}
        <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topRow}>
            <View style={styles.cameraModePill}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
              <Text style={styles.cameraModeText}>Photo</Text>
            </View>
          </View>
        </View>

        {/* Bottom overlay */}
        <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 80 }]}>
          {/* Import button */}
          <Pressable
            onPress={handleImport}
            style={({ pressed }) => [
              styles.sideButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="images" size={26} color="#FFFFFF" />
            <Text style={styles.sideButtonText}>Import</Text>
          </Pressable>

          {/* Capture button */}
          <Pressable
            onPress={handleCapture}
            style={({ pressed }) => [
              styles.captureButton,
              { transform: [{ scale: pressed ? 0.92 : 1 }] },
            ]}
          >
            <View style={styles.captureInner} />
          </Pressable>

          {/* Flip camera */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFacing((f) => (f === 'back' ? 'front' : 'back'));
            }}
            style={({ pressed }) => [
              styles.sideButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="camera-reverse" size={26} color="#FFFFFF" />
            <Text style={styles.sideButtonText}>Flip</Text>
          </Pressable>
        </View>
      </CameraView>

      {/* Verification Modal */}
      <Modal
        visible={showVerification}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleDismissVerification}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHandle, { backgroundColor: isDark ? Colors.dark.elevated : Colors.light.border }]} />

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {currentVerification?.isRunning ? 'Verifying Media...' : 'Verification Complete'}
            </Text>

            {currentVerification?.steps && currentVerification.steps.length > 0 && (
              <VerificationSteps steps={currentVerification.steps} />
            )}

            {!currentVerification?.isRunning && currentVerification?.result && (
              <Animated.View entering={FadeInUp.springify()} style={styles.resultContainer}>
                <TrustScoreCircle score={currentVerification.result.trustScore} />
                <Text style={[styles.resultText, { color: colors.text }]}>
                  Media Verified Successfully
                </Text>
                {currentVerification.result.blockchainTx && (
                  <Text style={[styles.txText, { color: colors.textSecondary }]} numberOfLines={1}>
                    Blockchain Tx: {currentVerification.result.blockchainTx.substring(0, 18)}...
                  </Text>
                )}
                <Pressable
                  onPress={handleDismissVerification}
                  style={[styles.viewDetailsButton, { backgroundColor: Colors.primary[500] }]}
                >
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </Pressable>
              </Animated.View>
            )}

            {currentVerification?.isRunning && (
              <View style={styles.runningIndicator}>
                <ActivityIndicator size="small" color={Colors.primary[500]} />
                <Text style={[styles.runningText, { color: colors.textSecondary }]}>
                  Processing...
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  camera: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cameraModeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 3,
  },
  captureInner: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
  },
  sideButton: {
    alignItems: 'center',
    gap: 4,
  },
  sideButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '500' },
  permissionText: { fontSize: 20, fontWeight: '700', marginTop: 20 },
  permissionSubtext: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  permissionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  importAltButton: { marginTop: 16 },
  importAltText: { fontSize: 14, fontWeight: '600' },
  // Modal
  modalContainer: { flex: 1, paddingTop: 12 },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  resultContainer: { alignItems: 'center', marginTop: 24, gap: 12 },
  resultText: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  txText: { fontSize: 12, marginTop: 4 },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  viewDetailsText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  runningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  runningText: { fontSize: 14 },
});
