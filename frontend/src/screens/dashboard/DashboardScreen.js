import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  ScrollView, Dimensions, PanResponder, Modal, TextInput, Alert 
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  
  // --- SESSION TIMER LOGIC ---
  const IDLE_TIME = 600; 
  const [secondsLeft, setSecondsLeft] = useState(IDLE_TIME);
  const timerRef = useRef(null);

  // --- SECURITY GATE STATES ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [targetScreen, setTargetScreen] = useState(null);

  const resetTimer = () => setSecondsLeft(IDLE_TIME);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => { resetTimer(); return false; },
      onMoveShouldSetPanResponderCapture: () => { resetTimer(); return false; },
    })
  ).current;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (logout) logout(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [logout]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- RESTORED: SECURITY INTERCEPTOR ---
  const handleFeatureAccess = (screenName) => {
    setTargetScreen(screenName);
    setIsVerifying(true); // Forces the modal to open
  };

  const confirmAccess = () => {
    // MOCK LOGIC: Validates that input is not empty to allow demo flow
    if (accessKey.length > 0) {
      setIsVerifying(false);
      setAccessKey('');
      navigation.navigate(targetScreen); // Finally navigate
    } else {
      Alert.alert("Security Gate", "Please enter your Credential Key to unlock this feature.");
    }
  };

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Session Active</Text>
          <Text style={styles.nameText}>{user?.name || "Officer"}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.timerContainer, secondsLeft < 60 && {backgroundColor: '#D32F2F'}]}>
            <MaterialCommunityIcons name="timer-sand" size={14} color="#FFF" />
            <Text style={styles.timerText}>Idle: {formatTime(secondsLeft)}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout-variant" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SECTION 1: FIELD OPERATIONS */}
        <Text style={styles.sectionTitle}>Field Operations</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => handleFeatureAccess('TeamManagement')}>
            <View style={[styles.iconContainer, { backgroundColor: '#1B365D15' }]}>
              <MaterialCommunityIcons name="account-group" size={30} color="#1B365D" />
            </View>
            <Text style={styles.cardTitle}>Team Management</Text>
            <Text style={styles.cardDesc}>Assign case officers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleFeatureAccess('Upload')}>
            <View style={[styles.iconContainer, { backgroundColor: '#1B365D15' }]}>
              <MaterialCommunityIcons name="camera-plus" size={30} color="#1B365D" />
            </View>
            <Text style={styles.cardTitle}>Evidence Upload</Text>
            <Text style={styles.cardDesc}>Secure capture & hash</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 2: FORENSIC INTELLIGENCE */}
        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Forensic Intelligence</Text>
        <View style={styles.grid}>
          <TouchableOpacity 
            style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#4A90E2' }]} 
            onPress={() => handleFeatureAccess('ForensicNarrator')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#4A90E215' }]}>
              <MaterialCommunityIcons name="microphone-outline" size={30} color="#4A90E2" />
            </View>
            <Text style={styles.cardTitle}>Forensic Narrator</Text>
            <Text style={styles.cardDesc}>Voice-to-Memo (BNSS 105)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#673AB7' }]} 
            onPress={() => handleFeatureAccess('LegalChatbot')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#673AB715' }]}>
              <MaterialCommunityIcons name="robot-outline" size={30} color="#673AB7" />
            </View>
            <Text style={styles.cardTitle}>Legal AI Desk</Text>
            <Text style={styles.cardDesc}>BNS/BNSS Legal Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusPanel}>
          <Text style={styles.statusText}>Blockchain Integrity: 99.9%</Text>
          <Text style={styles.nodeText}>System active. Interaction resets idle timer.</Text>
        </View>
      </ScrollView>

      {/* --- FEATURE SECURITY GATE MODAL --- */}
      <Modal visible={isVerifying} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.gateCard}>
            <MaterialCommunityIcons name="shield-lock" size={60} color="#1B365D" />
            <Text style={styles.gateTitle}>Identity Check</Text>
            <Text style={styles.gateSub}>Re-enter your Credential Key to access this feature.</Text>
            
            <TextInput 
              style={styles.gateInput}
              placeholder="XXXX-XXXX"
              placeholderTextColor="#BDC3C7"
              secureTextEntry
              value={accessKey}
              onChangeText={setAccessKey}
            />

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmAccess}>
              <Text style={styles.confirmBtnText}>VERIFY & UNLOCK</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {setIsVerifying(false); setAccessKey('');}} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  header: { backgroundColor: '#1B365D', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', borderBottomRightRadius: 25 },
  headerRight: { alignItems: 'flex-end' },
  welcomeText: { color: '#D1D1D1', fontSize: 12 },
  nameText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginBottom: 8 },
  timerText: { color: '#FFF', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 10 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: (width - 55) / 2, padding: 15, borderRadius: 18, marginBottom: 15, elevation: 3 },
  iconContainer: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1B365D' },
  cardDesc: { fontSize: 11, color: '#777', marginTop: 4 },
  statusPanel: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#38A169' },
  statusText: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  nodeText: { fontSize: 11, color: '#999', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  gateCard: { backgroundColor: 'white', width: '85%', padding: 30, borderRadius: 25, alignItems: 'center' },
  gateTitle: { fontSize: 22, fontWeight: 'bold', color: '#1B365D', marginTop: 15 },
  gateSub: { textAlign: 'center', color: '#666', fontSize: 14, marginVertical: 10 },
  gateInput: { width: '100%', backgroundColor: '#F0F4F8', padding: 15, borderRadius: 12, fontSize: 20, textAlign: 'center', fontWeight: 'bold', color: '#1B365D', marginVertical: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  confirmBtn: { backgroundColor: '#1B365D', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { marginTop: 20 },
  cancelText: { color: '#999', fontWeight: '600' }
});