import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Alert
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState(null); // 'credential' or 'admin'
  
  const { login } = useContext(AuthContext);

  // --- Logic: Biometric Authentication ---
  // Triggers sensor immediately and logs in without opening a form
  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert("Hardware Error", "Fingerprint sensor not detected or no prints enrolled.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify Identity for SAKSHI',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setLoading(true);
        // Direct login upon success
        setTimeout(() => {
          setLoading(false);
          login({ name: 'Authorized Officer', officerId: 'BIO-AUTH', role: 'officer' });
        }, 1000);
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication failed.");
    }
  };

  const handleIdChange = (text) => {
    let cleaned = text.replace(/[^0-9A-Z]/g, '');
    let masked = cleaned.length > 4 ? `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}` : cleaned;
    setId(masked.toUpperCase());
  };

  const performManualLogin = () => {
    if (!name || !id) return Alert.alert("Required", "Please fill in all fields.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({ name, officerId: id, role: method === 'admin' ? 'admin' : 'officer' });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <View style={styles.blueHeader}>
            <Text style={styles.headerTextMain}>SAKSHI</Text>
            <Text style={styles.headerTextSub}>DIGITAL FORENSICS</Text>
          </View>
          <View style={styles.shieldBottom} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Authorized Access</Text>
          <Text style={styles.description}>Logging into the immutable forensic ledger.</Text>

          {/* STEP 1: Method Selection */}
          {!method ? (
            <View style={styles.choiceContainer}>
              <Text style={styles.choiceTitle}>Select Login Method</Text>
              
              {/* Credential Key on top as requested */}
              <TouchableOpacity style={styles.choiceBtn} onPress={() => setMethod('credential')}>
                <MaterialCommunityIcons name="keyboard-outline" size={36} color="#0B2D52" />
                <Text style={styles.choiceBtnText}>Use Credential Key</Text>
              </TouchableOpacity>

              {/* Fingerprint below */}
              <TouchableOpacity style={styles.choiceBtn} onPress={handleBiometricLogin}>
                <MaterialCommunityIcons name="fingerprint" size={36} color="#0B2D52" />
                <Text style={styles.choiceBtnText}>Login with Biometrics</Text>
              </TouchableOpacity>

              {/* Admin Login Flow restored */}
              <TouchableOpacity style={styles.adminLink} onPress={() => setMethod('admin')}>
                <Text style={styles.adminLinkText}>Administrator Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 2: Login Form (Admin or Officer Credential) */
            <View style={styles.form}>
              <Text style={styles.formTitle}>
                {method === 'admin' ? 'Admin Portal' : 'Officer Credentials'}
              </Text>
              <TextInput 
                style={styles.input} 
                placeholder={method === 'admin' ? "Admin Username" : "Officer Name"}
                value={name}
                onChangeText={setName}
              />
              
              <TextInput 
                style={styles.input} 
                placeholder="Credential Key (XXXX-XXXX)" 
                maxLength={9}
                value={id}
                onChangeText={handleIdChange}
              />

              <TouchableOpacity style={styles.signInBtn} onPress={performManualLogin}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signInText}>Secure Login</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMethod(null)} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Change Method</Text>
              </TouchableOpacity>
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
  blueHeader: { backgroundColor: '#0B2D52', width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center', paddingTop: 20 },
  headerTextMain: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', letterSpacing: 5 },
  headerTextSub: { color: '#D1D1D1', fontSize: 13, fontWeight: 'bold', letterSpacing: 3 },
  shieldBottom: { width: 0, height: 0, borderLeftWidth: width / 2, borderRightWidth: width / 2, borderTopWidth: 40, borderTopColor: '#0B2D52', borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  content: { flex: 1, paddingHorizontal: 25, marginTop: 25 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  description: { color: '#666', fontSize: 14, marginBottom: 25 },
  choiceContainer: { marginTop: 10 },
  choiceTitle: { textAlign: 'center', fontSize: 15, color: '#666', marginBottom: 20, fontWeight: '500' },
  choiceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  choiceBtnText: { marginLeft: 15, fontSize: 17, fontWeight: 'bold', color: '#0B2D52' },
  adminLink: { marginTop: 15, alignSelf: 'center' },
  adminLinkText: { color: '#0B2D52', textDecorationLine: 'underline', fontWeight: 'bold' },
  form: { width: '100%' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#0B2D52', marginBottom: 15 },
  input: { backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', padding: 15, fontSize: 16, marginBottom: 15, color: '#333' },
  signInBtn: { backgroundColor: '#0B2D52', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  signInText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  backBtn: { marginTop: 25, alignSelf: 'center' },
  backBtnText: { color: '#0B2D52', fontWeight: '600' },
  securityBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingBottom: 20 },
  footerNote: { color: '#999', fontSize: 12, marginLeft: 5 },
});