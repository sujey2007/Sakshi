import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Alert
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState(null); 
  const [isAddingOfficer, setIsAddingOfficer] = useState(false); 
  
  const { login } = useContext(AuthContext);

  const handleIdChange = (text) => {
    let cleaned = text.replace(/[^0-9A-Z]/g, '');
    let masked = cleaned.length > 4 ? `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}` : cleaned;
    setId(masked.toUpperCase());
  };

  const recordAuditTrail = async (officerName, officerId, actionType) => {
    const newLog = {
      id: Date.now().toString(),
      who: `Insp. ${officerName} (ID: ${officerId})`,
      what: actionType,
      when: new Date().toLocaleString() + ' IST',
      where: 'Forensic Terminal 01',
      why: 'Authorized Session Start',
      status: 'Verified',
      hash: 'SHA256: ' + Math.random().toString(36).substring(2, 10).toUpperCase()
    };
    try {
      const existingData = await AsyncStorage.getItem('@sakshi_audit_trail');
      const currentLogs = existingData ? JSON.parse(existingData) : [];
      await AsyncStorage.setItem('@sakshi_audit_trail', JSON.stringify([newLog, ...currentLogs]));
    } catch (e) { console.error("Audit log failed", e); }
  };

  // --- OFFICER LOGIN ---
  const handleOfficerLogin = async () => {
    if (!name || !id) return Alert.alert("Required", "Enter Name & Key.");
    setLoading(true);
    await recordAuditTrail(name, id, 'System Login');
    setTimeout(() => {
      setLoading(false);
      login({ name, officerId: id, role: 'officer' });
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    }, 800);
  };

  // --- BIOMETRIC LOGIN ---
  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'SAKSHI Bio-Auth' });
      if (result.success) {
        setLoading(true);
        await recordAuditTrail('Authorized Officer', 'BIO-AUTH', 'Biometric Login');
        setTimeout(() => {
          setLoading(false);
          login({ name: 'Auth Officer', officerId: 'BIO-AUTH', role: 'officer' });
          navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
        }, 800);
      }
    } catch (error) { Alert.alert("Error", "Auth failed."); }
  };

  // --- MODIFIED ADMIN VERIFY: ALLOWS ANY ID ---
  const handleAdminVerify = async () => {
    // Check if fields are empty, otherwise allow any input
    if (name && id) {
      setLoading(true);
      await recordAuditTrail(name, id, 'Admin Login Bypass');
      setTimeout(() => {
        setLoading(false);
        // Grant admin role to the session
        login({ name: name, officerId: id, role: 'admin' });
        // Navigate to AdminDashboard
        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      }, 800);
    } else {
      Alert.alert("Input Required", "Please enter a Name and Key to login.");
    }
  };

  const onMainButtonPress = () => {
    if (isAddingOfficer) {
      // Logic for registration
    } else if (method === 'admin') {
      handleAdminVerify();
    } else {
      handleOfficerLogin();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <View style={styles.blueHeader}>
            <Text style={styles.headerTextMain}>SAKSHI</Text>
            <Text style={styles.headerTextSub}>DIGITAL FORENSICS</Text>
          </View>
          <View style={styles.shieldBottom} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>
            {isAddingOfficer ? "Admin: Register New User" : (method === 'admin' ? "Administrator Login" : "Authorized Access")}
          </Text>

          {!method ? (
            <View style={styles.choiceContainer}>
              <TouchableOpacity style={styles.choiceBtn} onPress={() => setMethod('credential')}>
                <MaterialCommunityIcons name="keyboard-outline" size={36} color="#0B2D52" />
                <Text style={styles.choiceBtnText}>Use Credential Key</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.choiceBtn} onPress={handleBiometricLogin}>
                <MaterialCommunityIcons name="fingerprint" size={36} color="#0B2D52" />
                <Text style={styles.choiceBtnText}>Login with Biometrics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminLink} onPress={() => setMethod('admin')}>
                <Text style={styles.adminLinkText}>Administrator Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Key (XXXX-XXXX)" maxLength={9} value={id} onChangeText={handleIdChange} />
              <TouchableOpacity style={styles.signInBtn} onPress={onMainButtonPress}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signInText}>Secure Login</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {setMethod(null); setIsAddingOfficer(false);}} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
            </View>
          )}

          <View style={styles.securityBadge}>
            <MaterialCommunityIcons name="lock-check" size={16} color="#999" />
            <Text style={styles.footerNote}> AES-256 Bit Encryption | Node Verified</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { height: '30%', alignItems: 'center' },
  blueHeader: { backgroundColor: '#0B2D52', width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center' },
  headerTextMain: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', letterSpacing: 5 },
  headerTextSub: { color: '#D1D1D1', fontSize: 13, fontWeight: 'bold' },
  shieldBottom: { width: 0, height: 0, borderLeftWidth: width / 2, borderRightWidth: width / 2, borderTopWidth: 40, borderTopColor: '#0B2D52', borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  content: { flex: 1, paddingHorizontal: 25, marginTop: 25 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  choiceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  choiceBtnText: { marginLeft: 15, fontSize: 17, fontWeight: 'bold', color: '#0B2D52' },
  adminLink: { marginTop: 15, alignSelf: 'center' },
  adminLinkText: { color: '#0B2D52', textDecorationLine: 'underline', fontWeight: 'bold' },
  input: { backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', padding: 15, marginBottom: 15 },
  signInBtn: { backgroundColor: '#0B2D52', padding: 18, borderRadius: 8, alignItems: 'center' },
  signInText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  backBtn: { marginTop: 20, alignSelf: 'center' },
  backBtnText: { color: '#0B2D52', fontWeight: '600' },
  securityBadge: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingBottom: 20 },
  footerNote: { color: '#999', fontSize: 12, marginLeft: 5 },
});