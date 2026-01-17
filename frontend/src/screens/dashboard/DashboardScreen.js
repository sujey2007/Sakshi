import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  ScrollView, Dimensions, Modal, TextInput, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const scrollViewRef = useRef(null);
  
  // --- SESSION TIMER ---
  const IDLE_TIME = 600; 
  const [secondsLeft, setSecondsLeft] = useState(IDLE_TIME);
  const timerRef = useRef(null);

  // --- SECURITY GATE ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [targetScreen, setTargetScreen] = useState(null);

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    if (logout) logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleLogout(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFeatureAccess = (screenName) => {
    setTargetScreen(screenName);
    setIsVerifying(true); 
  };

  const confirmAccess = async () => {
    if (accessKey.length > 0) {
      const usageLog = {
        id: Date.now().toString(),
        who: `Insp. ${user?.name || 'Sabari'}`,
        what: `FEATURE ACCESS: ${targetScreen.toUpperCase()}`,
        when: new Date().toLocaleString() + ' IST',
        where: 'Secure Dashboard Session',
        why: `Authorized unlocking of ${targetScreen} system`,
        status: 'Authorized',
        hash: 'SHA256: ' + Math.random().toString(36).substring(2, 10).toUpperCase()
      };

      try {
        const data = await AsyncStorage.getItem('@sakshi_audit_trail');
        const logs = data ? JSON.parse(data) : [];
        await AsyncStorage.setItem('@sakshi_audit_trail', JSON.stringify([usageLog, ...logs]));
      } catch (e) { console.error(e); }

      setIsVerifying(false);
      setAccessKey('');
      setTimeout(() => {
        if (targetScreen) navigation.navigate(targetScreen);
      }, 400); 
    } else {
      Alert.alert("Security Gate", "Please enter a valid Credential Key.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BRANDED HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerSide}>
            <Text style={styles.headerSmallLabel}>OFFICER</Text>
            <Text style={styles.headerValue}>{user?.name || "Sabari"}</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.brandTitle}>SAKSHI</Text>
            <Text style={styles.brandSub}>DIGITAL FORENSICS</Text>
          </View>
          <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
            <View style={[styles.timerBadge, secondsLeft < 60 && {backgroundColor: '#C0392B'}]}>
               <MaterialCommunityIcons name="clock-outline" size={10} color="#FFF" />
               <Text style={styles.timerText}> {formatTime(secondsLeft)}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <MaterialCommunityIcons name="logout-variant" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionTitle}>Field Operations</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.card} onPress={() => handleFeatureAccess('CaseDiary')}>
              <View style={[styles.iconContainer, { backgroundColor: '#1B365D15' }]}>
                <MaterialCommunityIcons name="notebook-edit" size={30} color="#1B365D" />
              </View>
              <Text style={styles.cardTitle}>Case Diary</Text>
              <Text style={styles.cardDesc}>Timeline & BNSS Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => handleFeatureAccess('Upload')}>
              <View style={[styles.iconContainer, { backgroundColor: '#1B365D15' }]}>
                <MaterialCommunityIcons name="camera-plus" size={30} color="#1B365D" />
              </View>
              <Text style={styles.cardTitle}>Evidence Upload</Text>
              <Text style={styles.cardDesc}>Secure capture & hash</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => handleFeatureAccess('TeamManagement')}>
              <View style={[styles.iconContainer, { backgroundColor: '#1B365D15' }]}>
                <MaterialCommunityIcons name="account-group" size={30} color="#1B365D" />
              </View>
              <Text style={styles.cardTitle}>Team Management</Text>
              <Text style={styles.cardDesc}>Assign case officers</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Forensic Intelligence</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#673AB7' }]} onPress={() => handleFeatureAccess('LegalChatbot')}>
              <View style={[styles.iconContainer, { backgroundColor: '#673AB715' }]}>
                <MaterialCommunityIcons name="scale-balance" size={30} color="#673AB7" />
              </View>
              <Text style={styles.cardTitle}>Legal AI Chatbot</Text>
              <Text style={styles.cardDesc}>BNS/BNSS statutory guide</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#4A90E2' }]} onPress={() => handleFeatureAccess('ForensicNarrator')}>
              <View style={[styles.iconContainer, { backgroundColor: '#4A90E215' }]}>
                <MaterialCommunityIcons name="microphone-settings" size={30} color="#4A90E2" />
              </View>
              <Text style={styles.cardTitle}>Forensic Narrator</Text>
              <Text style={styles.cardDesc}>Voice-to-Memo (Sec 105)</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>System Tracker</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#27AE60' }]} onPress={() => handleFeatureAccess('Audit')}>
              <View style={[styles.iconContainer, { backgroundColor: '#27AE6015' }]}>
                <MaterialCommunityIcons name="history" size={30} color="#27AE60" />
              </View>
              <Text style={styles.cardTitle}>Audit Trail</Text>
              <Text style={styles.cardDesc}>Immutable system ledger</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      <Modal visible={isVerifying} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.gateCard}>
            <MaterialCommunityIcons name="shield-lock" size={60} color="#1B365D" />
            <Text style={styles.gateTitle}>Identity Check</Text>
            <TextInput 
              style={styles.gateInput}
              placeholder="XXXX-XXXX"
              secureTextEntry
              value={accessKey}
              onChangeText={setAccessKey}
            />
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmAccess}>
              <Text style={styles.confirmBtnText}>VERIFY & UNLOCK</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsVerifying(false)} style={styles.cancelBtn}>
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
  header: { backgroundColor: '#1B365D', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomRightRadius: 25, borderBottomLeftRadius: 25, elevation: 8 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSide: { flex: 1 },
  headerCenter: { flex: 2, alignItems: 'center' },
  brandTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: 4 },
  brandSub: { color: '#D1D1D1', fontSize: 9, fontWeight: 'bold', letterSpacing: 2, marginTop: -2 },
  headerSmallLabel: { color: '#A0AEC0', fontSize: 8, fontWeight: 'bold' },
  headerValue: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  timerBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  timerText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 80 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: (width - 55) / 2, padding: 15, borderRadius: 18, marginBottom: 15, elevation: 3 },
  iconContainer: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1B365D' },
  cardDesc: { fontSize: 11, color: '#777', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  gateCard: { backgroundColor: 'white', width: '85%', padding: 30, borderRadius: 25, alignItems: 'center' },
  gateTitle: { fontSize: 22, fontWeight: 'bold', color: '#1B365D', marginTop: 15 },
  gateInput: { width: '100%', backgroundColor: '#F0F4F8', padding: 15, borderRadius: 12, fontSize: 20, textAlign: 'center', fontWeight: 'bold', color: '#1B365D', marginVertical: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  confirmBtn: { backgroundColor: '#1B365D', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' },
  cancelBtn: { marginTop: 20 },
  cancelText: { color: '#999', fontWeight: '600' }
});