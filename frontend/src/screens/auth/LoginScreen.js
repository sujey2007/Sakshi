import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Alert
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  // --- States ---
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState(null); // 'credential' or 'admin'
  const [isAddingOfficer, setIsAddingOfficer] = useState(false); // Controls Admin Registration View
  
  const { login } = useContext(AuthContext);

  // --- Helpers ---
  const handleIdChange = (text) => {
    let cleaned = text.replace(/[^0-9A-Z]/g, '');
    let masked = cleaned.length > 4 ? `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}` : cleaned;
    setId(masked.toUpperCase());
  };

  // --- Workflow 1: Officer Login (Goes to Dashboard) ---
  const handleOfficerLogin = () => {
    if (!name || !id) return Alert.alert("Required", "Please fill in all fields.");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // This updates AuthContext and triggers navigation to Dashboard
      login({ name: name, officerId: id, role: 'officer' });
    }, 1000);
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert("Hardware Error", "Biometrics not available on this device.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify Identity for SAKSHI',
      });

      if (result.success) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          login({ name: 'Authorized Officer', officerId: 'BIO-AUTH', role: 'officer' });
        }, 1000);
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication failed.");
    }
  };

  // --- Workflow 2: Admin Actions (Stays on Login UI) ---
  const handleAdminVerify = () => {
    if (!name || !id) return Alert.alert("Required", "Admin credentials required.");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // UI SWAP: Stay on login screen but show registration form
      setIsAddingOfficer(true); 
      setName(''); 
      setId('');
    }, 800);
  };

  const handleRegisterNewOfficer = () => {
    if (!name || !id) return Alert.alert("Required", "Please enter new officer details.");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "User Added Successfully",
        `Officer ${name} has been registered to the forensic ledger.`,
        [
          { 
            text: "Return to Login", 
            onPress: () => {
              // Reset local state to show initial login screen
              setIsAddingOfficer(false);
              setMethod(null);
              setName('');
              setId('');
            } 
          }
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.blueHeader}>
            <Text style={styles.headerTextMain}>SAKSHI</Text>
            <Text style={styles.headerTextSub}>DIGITAL FORENSICS</Text>
          </View>
          <View style={styles.shieldBottom} />
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>
            {isAddingOfficer ? "Admin: Register New User" : "Authorized Access"}
          </Text>
          <Text style={styles.description}>
            {isAddingOfficer ? "Adding a new officer node to the network." : "Logging into the immutable forensic ledger."}
          </Text>

          {!method ? (
            /* PHASE 1: INITIAL SELECTION */
            <View style={styles.choiceContainer}>
              <Text style={styles.choiceTitle}>Select Login Method</Text>
              
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
          ) : isAddingOfficer ? (
            /* PHASE 3: ADMIN REGISTRATION FORM (THEME CONSISTENT) */
            <View style={styles.form}>
              <Text style={styles.formTitle}>New Officer Details</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Officer Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Assign Credential Key (XXXX-XXXX)" 
                placeholderTextColor="#999"
                maxLength={9}
                value={id}
                onChangeText={handleIdChange}
              />

              <TouchableOpacity style={styles.signInBtn} onPress={handleRegisterNewOfficer}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signInText}>Confirm Registration</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => { setIsAddingOfficer(false); setMethod(null); setName(''); setId(''); }} 
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>← Cancel & Exit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* PHASE 2: INPUT CREDENTIALS (ADMIN OR OFFICER) */
            <View style={styles.form}>
              <Text style={styles.formTitle}>
                {method === 'admin' ? 'Verify Administrator' : 'Officer Credentials'}
              </Text>
              <TextInput 
                style={styles.input} 
                placeholder={method === 'admin' ? "Admin Username" : "Officer Name"}
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Credential Key (XXXX-XXXX)" 
                placeholderTextColor="#999"
                maxLength={9}
                value={id}
                onChangeText={handleIdChange}
              />

              <TouchableOpacity 
                style={styles.signInBtn} 
                onPress={method === 'admin' ? handleAdminVerify : handleOfficerLogin}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.signInText}>
                    {method === 'admin' ? 'Verify Admin' : 'Secure Login'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => { setMethod(null); setName(''); setId(''); }} 
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>← Change Method</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Security Footer */}
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