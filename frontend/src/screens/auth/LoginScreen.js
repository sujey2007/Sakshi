import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Alert
} from 'react-native';
// Import Biometric Module
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [isFocused, setIsFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const { login } = useContext(AuthContext);

  // --- Logic: Biometric Authentication ---
  const handleBiometricLogin = async () => {
    try {
      // 1. Check if hardware supports biometrics
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Biometrics Unavailable", 
          "Please ensure fingerprints are registered in your device settings or use Credential Key."
        );
        return;
      }

      // 2. Authenticate
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to Access SAKSHI',
        fallbackLabel: 'Enter Credential Key',
      });

      if (result.success) {
        setLoading(true);
        // Simulate background verification
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
    let masked = cleaned;
    if (cleaned.length > 4) {
      masked = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    }
    setId(masked.toUpperCase());
  };

  const performManualLogin = () => {
    if (!name || !id) {
      Alert.alert("Input Required", "Please enter your Name and Credential Key.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({ name: name, officerId: id, role: isAdminMode ? 'admin' : 'officer' });
    }, 1500);
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
          <View style={styles.form}>
            <Text style={styles.sectionLabel}>{isAdminMode ? 'System Administrator' : 'Authorized Officer'}</Text>
            <Text style={styles.description}>Accessing the immutable forensic ledger.</Text>

            <TextInput 
              style={[styles.input, isFocused === 'name' && styles.inputFocused]} 
              placeholder={isAdminMode ? "Admin ID" : "Officer Name"}
              onFocus={() => setIsFocused('name')}
              onBlur={() => setIsFocused(null)}
              value={name}
              onChangeText={setName}
            />
            
            <View style={[styles.inputWithTag, isFocused === 'id' && styles.inputFocused]}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]} 
                placeholder="Credential Key (XXXX-XXXX)" 
                maxLength={9}
                onFocus={() => setIsFocused('id')}
                onBlur={() => setIsFocused(null)}
                value={id}
                onChangeText={handleIdChange}
              />
              {/* Fingerprint Button */}
              <TouchableOpacity onPress={handleBiometricLogin} style={styles.bioButton}>
                <MaterialCommunityIcons 
                  name={isAdminMode ? "key-chain" : "fingerprint"} 
                  size={28} 
                  color="#0B2D52" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signInBtn} onPress={performManualLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signInText}>Secure Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsAdminMode(!isAdminMode)} style={styles.adminToggle}>
              <Text style={styles.adminToggleText}>{isAdminMode ? "Officer Portal" : "Admin Sign In"}</Text>
            </TouchableOpacity>
          </View>

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
  blueHeader: {
    backgroundColor: '#0B2D52', width: '100%', height: '80%',
    justifyContent: 'center', alignItems: 'center', paddingTop: 20,
  },
  headerTextMain: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', letterSpacing: 5 },
  headerTextSub: { color: '#D1D1D1', fontSize: 13, fontWeight: 'bold', letterSpacing: 3 },
  shieldBottom: {
    width: 0, height: 0,
    borderLeftWidth: width / 2, borderRightWidth: width / 2,
    borderTopWidth: 40, borderTopColor: '#0B2D52',
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  content: { flex: 1, paddingHorizontal: 25, marginTop: 25 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  description: { color: '#666', fontSize: 14, marginBottom: 25 },
  form: { width: '100%' },
  input: {
    backgroundColor: '#F9F9F9', borderRadius: 8,
    borderWidth: 1, borderColor: '#E0E0E0',
    padding: 15, fontSize: 16, marginBottom: 15, color: '#333'
  },
  inputFocused: { borderColor: '#0B2D52', borderWidth: 2, backgroundColor: '#FFF' },
  inputWithTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 15 },
  bioButton: { padding: 10, marginRight: 5 },
  signInBtn: { backgroundColor: '#0B2D52', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  signInText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  adminToggle: { marginTop: 25 },
  adminToggleText: { textAlign: 'center', color: '#0B2D52', fontWeight: '700', textDecorationLine: 'underline' },
  securityBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingBottom: 20 },
  footerNote: { color: '#999', fontSize: 12, marginLeft: 5 },
});