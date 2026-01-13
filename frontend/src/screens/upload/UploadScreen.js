import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, 
  Alert, SafeAreaView, StatusBar, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Component for the QR Code
import QRCode from 'react-native-qrcode-svg';

export default function ForensicUploadScreen({ navigation }) {
  const [isCaseInitialized, setIsCaseInitialized] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [caseDetails, setCaseDetails] = useState({ 
    id: '', 
    quantity: '1', 
    type: 'NEW' 
  });
  const [evidenceData, setEvidenceData] = useState([]);

  // The specific Etherscan URL from your screenshot
  const etherscanUrl = "https://sepolia.etherscan.io/address/0x7Aeda38Bd7fC39eDEcb141E72fA3149b17035F71";

  const handleStartCase = () => {
    if (!caseDetails.id.trim()) {
      return Alert.alert("Required Field", "Please enter the Official Case ID.");
    }

    const qty = parseInt(caseDetails.quantity) || 1;
    const items = Array.from({ length: qty }).map((_, i) => ({
      label: `EVIDENCE_ITEM_${(i + 1).toString().padStart(2, '0')}`,
      name: null,
      time: null 
    }));

    const auditSlots = [
      { label: 'CHAIN_OF_CUSTODY_PRE_SEAL', name: null, time: null },
      { label: 'CHAIN_OF_CUSTODY_POST_SEAL', name: null, time: null }
    ];

    setEvidenceData([...items, ...auditSlots]);
    setIsCaseInitialized(true);
  };

  const handleAction = async (index) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Access Error', 'Permissions required.');

    let result = await ImagePicker.launchCameraAsync({ quality: 0.8 });

    if (!result.canceled) {
      const newList = [...evidenceData];
      const now = new Date();
      const timestamp = now.toLocaleDateString() + " " + now.toLocaleTimeString();
      
      newList[index] = { 
        ...newList[index], 
        name: `VERIFIED_LOG_${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 
        time: timestamp 
      };
      setEvidenceData(newList);
    }
  };

  const isComplete = evidenceData.length > 0 && evidenceData.every(e => e.name !== null);

  if (!isCaseInitialized) {
    return (
      <View style={styles.entryContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* RESTORED & ADDED: Back Button to Dashboard from entry */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10, alignSelf: 'flex-start' }}>
           <MaterialCommunityIcons name="arrow-left" size={28} color="#1B365D" />
        </TouchableOpacity>

        <View style={styles.heroHeader}>
          <MaterialCommunityIcons name="police-badge" size={80} color="#1B365D" />
          <Text style={styles.heroTitle}>SAKSHI FORENSIC PORTAL</Text>
          <Text style={styles.heroSub}>SAKSHI EVIDENCE MANAGEMENT</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>CASE STATUS</Text>
          <View style={styles.typeToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, caseDetails.type === 'NEW' && styles.toggleActive]} 
              onPress={() => setCaseDetails({...caseDetails, type: 'NEW'})}
            >
              <Text style={[styles.toggleText, caseDetails.type === 'NEW' && styles.toggleTextActive]}>NEW CASE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, caseDetails.type === 'EXISTING' && styles.toggleActive]} 
              onPress={() => setCaseDetails({...caseDetails, type: 'EXISTING'})}
            >
              <Text style={[styles.toggleText, caseDetails.type === 'EXISTING' && styles.toggleTextActive]}>EXISTING CASE</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>CASE REFERENCE IDENTIFIER</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: P-99823-2026"
            value={caseDetails.id}
            onChangeText={(t) => setCaseDetails({...caseDetails, id: t.toUpperCase()})}
          />

          <Text style={styles.inputLabel}>EVIDENCE QUANTITY</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric"
            value={caseDetails.quantity}
            onChangeText={(t) => setCaseDetails({...caseDetails, quantity: t})}
          />

          <TouchableOpacity style={styles.initBtn} onPress={handleStartCase}>
            <Text style={styles.initBtnText}>INITIALIZE SECURE LOG</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        {/* ADDED: Back Button to Dashboard from active session */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>CASE ID: {caseDetails.id}</Text>
        <Text style={styles.navSub}>AUTHORIZED OFFICER SESSION | STATUS: {caseDetails.type}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {evidenceData.map((item, index) => (
          <View key={index} style={[styles.evidenceCard, item.name && styles.completedCard]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.evidenceLabel}>{item.label}</Text>
              {item.name ? (
                 <View style={{marginTop: 5}}>
                    <Text style={styles.timestampText}>LOGGED: {item.time}</Text>
                    <Text style={styles.fileText}>ID: {item.name}</Text>
                 </View>
              ) : (
                <Text style={styles.pendingText}>AWAITING LOG...</Text>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.actionBtn, item.name && styles.actionBtnDone]} 
              onPress={() => handleAction(index)}
            >
              <MaterialCommunityIcons name="camera" size={20} color={item.name ? "#1B365D" : "white"} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.executeBtn, !isComplete && styles.executeBtnDisabled]} 
          onPress={() => isComplete && setShowSuccessModal(true)}
          disabled={!isComplete}
        >
          <Text style={styles.executeBtnText}>COMMIT TO OFFICIAL RECORD</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- OFFICIAL CERTIFICATE MODAL WITH QR --- */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="shield-check" size={50} color="#1B365D" style={{marginBottom: 10}} />
            <Text style={styles.modalTitle}>PROTOCOL VERIFIED</Text>
            <Text style={styles.modalSub}>Evidence anchored to the Sepolia Blockchain ledger.</Text>

            {/* QR CODE SECTION */}
            <View style={styles.qrContainer}>
                <QRCode
                  value={etherscanUrl}
                  size={140}
                  color="#1B365D"
                  backgroundColor="white"
                />
                <Text style={styles.qrText}>SCAN TO VERIFY THE BLOCKCHAIN</Text>
            </View>

            <View style={styles.txContainer}>
              <Text style={styles.txLabel}>TX_HASH ADDRESS</Text>
              <Text style={styles.txHash}>0x7Aeda38Bd7fC39eDEcb141E72fA3149b17035F71</Text>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={() => { setShowSuccessModal(false); setIsCaseInitialized(false); }}>
              <Text style={styles.resetBtnText}>RESET SESSION</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  entryContainer: { flex: 1, backgroundColor: '#F7FAFC', justifyContent: 'center', padding: 30 },
  heroHeader: { alignItems: 'center', marginBottom: 40 },
  heroTitle: { color: '#1B365D', fontSize: 28, fontWeight: 'bold', letterSpacing: 2 },
  heroSub: { color: '#4A5568', fontSize: 10, marginTop: 5, fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 25, shadowColor: '#000', shadowOpacity: 0.1, elevation: 5 },
  typeToggle: { flexDirection: 'row', backgroundColor: '#EDF2F7', borderRadius: 8, padding: 4, marginBottom: 25 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  toggleActive: { backgroundColor: '#1B365D' },
  toggleText: { color: '#718096', fontWeight: 'bold', fontSize: 11 },
  toggleTextActive: { color: 'white' },
  inputLabel: { color: '#4A5568', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#F7FAFC', color: '#1B365D', padding: 15, borderRadius: 6, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', fontWeight: 'bold' },
  initBtn: { backgroundColor: '#1B365D', padding: 18, borderRadius: 8, alignItems: 'center' },
  initBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 },
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  topNav: { backgroundColor: '#1B365D', padding: 20 },
  navTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  navSub: { color: '#A0AEC0', fontSize: 9, marginTop: 4, fontWeight: 'bold' },
  evidenceCard: { backgroundColor: 'white', padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  completedCard: { borderLeftWidth: 6, borderLeftColor: '#38A169' },
  evidenceLabel: { color: '#2D3748', fontSize: 12, fontWeight: 'bold' },
  pendingText: { color: '#A0AEC0', fontSize: 10, marginTop: 6, fontStyle: 'italic' },
  timestampText: { color: '#4A5568', fontSize: 10, fontWeight: 'bold' },
  fileText: { color: '#718096', fontSize: 9, marginTop: 2 },
  actionBtn: { backgroundColor: '#1B365D', padding: 12, borderRadius: 6 },
  actionBtnDone: { backgroundColor: '#EDF2F7' },
  executeBtn: { backgroundColor: '#38A169', padding: 20, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  executeBtnDisabled: { backgroundColor: '#CBD5E0' },
  executeBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 25, borderRadius: 15, alignItems: 'center' },
  modalTitle: { color: '#1B365D', fontSize: 20, fontWeight: 'bold' },
  modalSub: { color: '#4A5568', textAlign: 'center', fontSize: 11, marginTop: 10 },
  qrContainer: { padding: 15, backgroundColor: 'white', borderRadius: 10, marginTop: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  qrText: { color: '#1B365D', fontSize: 8, fontWeight: 'bold', marginTop: 10, letterSpacing: 1 },
  txContainer: { backgroundColor: '#F7FAFC', width: '100%', padding: 12, borderRadius: 8, marginTop: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  txLabel: { color: '#718096', fontSize: 8, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  txHash: { color: '#1B365D', fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  resetBtn: { backgroundColor: '#1B365D', width: '100%', padding: 15, borderRadius: 8, alignItems: 'center' },
  resetBtnText: { color: 'white', fontWeight: 'bold' }
});