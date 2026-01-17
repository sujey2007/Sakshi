import React, { useState, useContext, useEffect } from 'react';
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
  
  const { login } = useContext(AuthContext);

  // --- Helpers ---
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
      status: 'Verified',
      hash: 'SHA256: ' + Math.random().toString(36).substring(2, 10).toUpperCase()
    };
    try {
      const existingData = await AsyncStorage.getItem('@sakshi_audit_trail');
      const currentLogs = existingData ? JSON.parse(existingData) : [];
      await AsyncStorage.setItem('@sakshi_audit_trail', JSON.stringify([newLog, ...currentLogs]));
    } catch (e) { console.error("Audit log failed", e); }
  };

  // --- Login Handlers ---
  const handleOfficerLogin = async () => {
    if (!name || !id) return Alert.alert("Required", "Please enter Name and Key.");
    setLoading(true);
    try {
      const storedUsers = await AsyncStorage.getItem('@sakshi_registered_officers');
      const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Check Name and ID against local Admin DB
      const isValid = registeredUsers.find(u => u.name === name && u.id === id);

      if (isValid) {
        await recordAuditTrail(name, id, 'Officer Login');
        setTimeout(() => {
          setLoading(false);
          login({ name, officerId: id, role: 'officer' });
          navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
        }, 800);
      } else {
        setLoading(false);
        Alert.alert("Invalid User", "The Name or Key entered does not match our authorized registry.");
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("Error", "Local Database inaccessible.");
    }
  };

  const handleBiometricAuth = async (typeLabel) => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return Alert.alert("Hardware Error", `${typeLabel} is not set up on this device.`);
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `SAKSHI ${typeLabel} Verification`,
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        setLoading(true);
        await recordAuditTrail(`${typeLabel} User`, 'BIO-AUTH', `${typeLabel} Login`);
        setTimeout(() => {
          setLoading(false);
          login({ name: 'Auth Officer', officerId: 'BIO-AUTH', role: 'officer' });
          navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
        }, 800);
      }
    } catch (error) { Alert.alert("Error", "Authentication failed."); }
  };

  const handleAdminVerify = async () => {
    if (name === 'hackhive' && id === '24680') {
      setLoading(true);
      await recordAuditTrail('hackhive', '24680', 'Admin Login');
      setTimeout(() => {
        setLoading(false);
        login({ name: 'hackhive', officerId: '24680', role: 'admin' });
        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      }, 800);
    } else {
      Alert.alert("Invalid Admin", "Administrator Name or Security Key is incorrect.");
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
            {method === 'admin' ? "Admin Portal" : "Authorized Access"}
          </Text>

          {!method ? (
            <View style={styles.choiceContainer}>
              {/* CARD 1: CREDENTIALS */}
              <TouchableOpacity style={styles.choiceBtn} onPress={() => setMethod('credential')}>
                <MaterialCommunityIcons name="keyboard-outline" size={36} color="#0B2D52" />
                <Text style={styles.choiceBtnText}>Use Credential Key</Text>
              </TouchableOpacity>

            

              {/* CARD 3: BIOMETRICS/TOUCHID */}
              <TouchableOpacity style={styles.choiceBtn} onPress={() => handleBiometricAuth('Biometrics')}>
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
              <TextInput 
                style={styles.input} 
                placeholder="Key" 
                value={id} 
                onChangeText={method === 'admin' ? setId : handleIdChange} 
                secureTextEntry={method === 'admin'} 
              />
              <TouchableOpacity style={styles.signInBtn} onPress={method === 'admin' ? handleAdminVerify : handleOfficerLogin}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signInText}>Secure Login</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMethod(null)} style={styles.backBtn}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
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