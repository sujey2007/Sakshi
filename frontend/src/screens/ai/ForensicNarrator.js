import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Keyboard,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
// *** FIX 1: Changed import to use the legacy API as requested by the error ***
import * as FileSystem from 'expo-file-system/legacy';
import { GEMINI_API_KEY } from '@env';

export default function ForensicNarrator() {
  const navigation = useNavigation();

  // State for Audio Recording
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // State for AI Processing
  const [rawText, setRawText] = useState('');
  const [structuredReport, setStructuredReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------
  // 1. AUDIO RECORDING FUNCTIONS
  // ---------------------------------------------------------
  async function startRecording() {
    try {
      // Check permissions
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRawText('');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Could not start microphone.');
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setIsRecording(false);
    setRecording(undefined);

    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    console.log('Recording stored at', uri);

    analyzeAudioEvidence(uri);
  }

  // ---------------------------------------------------------
  // 2. AI ANALYSIS (AUDIO OR TEXT)
  // ---------------------------------------------------------
  const analyzeAudioEvidence = async (audioUri) => {
    setIsLoading(true);

    try {
      let contentParts = [];

      // A. If we have AUDIO
      if (audioUri) {
        let base64Audio = '';

        if (Platform.OS === 'web') {
          const response = await fetch(audioUri);
          const blob = await response.blob();

          base64Audio = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result.split(',')[1];
              resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          // *** FIX 2: Kept the string 'base64' (safe for both legacy and new) ***
          base64Audio = await FileSystem.readAsStringAsync(audioUri, {
            encoding: 'base64',
          });
        }

        contentParts.push({
          inline_data: {
            mime_type: Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4',
            data: base64Audio,
          },
        });

        contentParts.push({
          text:
            'Listen to this crime scene narration. Extract the key facts and structure them into a formal legal memo.',
        });
      }
      // B. If we have TEXT
      else if (rawText.trim()) {
        contentParts.push({
          text: `Raw Notes: "${rawText}". Structure this into a formal legal memo.`,
        });
      } else {
        Alert.alert('Input Required', 'Please record voice or type details.');
        setIsLoading(false);
        return;
      }

      // C. System Instructions
      contentParts.push({
        text: `
Act as a Senior Indian Forensic Officer.
1. Identify the likely offense under the Bharatiya Nyaya Sanhita (BNS).
2. Structure the evidence into a "Seizure Memo" compliant with Section 105 of BNSS.

Format output as:
**Suspected Offense:** [BNS Section]
**Location:** [Extracted]
**Seizure Memo Details:** [Formal description]
**Chain of Custody:** [Recommendations]
        `,
      });

      // D. Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: contentParts }],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to analyze');
      }

      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text;

      setStructuredReport(aiResponse);
    } catch (error) {
      console.error('Analysis Error:', error);
      Alert.alert('Analysis Failed', 'Could not process the evidence.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 3. UI RENDER
  // ---------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Forensic Narrator</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.label}>🎙️ Evidence Input</Text>
          <Text style={styles.subLabel}>
            Record your voice or type notes manually.
          </Text>

          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingActive,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.recordButtonText}>
              {isRecording
                ? '🔴 Stop Recording & Analyze'
                : '🎤 Tap to Record Evidence'}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              textAlign: 'center',
              color: '#888',
              marginVertical: 10,
            }}
          >
            - OR -
          </Text>

          <TextInput
            style={styles.inputArea}
            placeholder="Type manually here..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={rawText}
            onChangeText={setRawText}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() => analyzeAudioEvidence(null)}
            disabled={isLoading || isRecording}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                ⚡ Synthesize Text Report
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {structuredReport && (
          <View style={[styles.card, styles.resultCard]}>
            <Text style={styles.label}>
              📄 BNSS Sec. 105 Memo Draft
            </Text>
            <View style={styles.divider} />
            <Text style={styles.reportText}>
              {structuredReport}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1B365D',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backText: {
    fontSize: 28,
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#4A90E2',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  inputArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 80,
    color: '#333',
    marginBottom: 15,
  },
  recordButton: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1B365D',
    borderStyle: 'dashed',
  },
  recordingActive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#D32F2F',
    borderStyle: 'solid',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  analyzeButton: {
    backgroundColor: '#1B365D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },
});