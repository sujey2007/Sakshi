import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  SafeAreaView, ActivityIndicator, Alert, ScrollView, Platform 
} from 'react-native';
// SDK 54 uses CameraView and useCameraPermissions
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import * as DocumentPicker from 'expo-document-picker';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

// --- Sub-Component: Dynamic Evidence Slot ---
const DocumentSection = ({ index, onAction, docData, onTypeChange }) => {
  const types = ['Photo', 'Video', 'Audio', 'Report', 'Statement', 'Other'];
  const isMediaType = ['Photo', 'Video', 'Audio'].includes(docData.docType);

  return (
    <View style={styles.docCard}>
      <Text style={styles.docNumber}>Evidence Item #{index + 1}</Text>
      
      <View style={styles.pickerRow}>
        {types.map((type) => (
          <TouchableOpacity 
            key={type} 
            style={[styles.typeBadge, docData.docType === type && styles.typeBadgeActive]}
            onPress={() => onTypeChange(index, type)}
          >
            <Text style={[styles.typeText, docData.docType === type && styles.typeTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[
          styles.uploadBtn, 
          docData.uri ? styles.uploadBtnSuccess : (isMediaType ? styles.mediaBtn : styles.fileBtn)
        ]} 
        onPress={() => onAction(index, isMediaType)}
      >
        <MaterialCommunityIcons 
          name={docData.uri ? "check-circle" : (isMediaType ? "camera" : "file-upload")} 
          size={24} 
          color="#FFF" 
        />
        <Text style={styles.uploadBtnText}>
          {docData.uri ? "Integrity Verified" : (isMediaType ? `Capture ${docData.docType}` : `Upload ${docData.docType}`)}
        </Text>
      </TouchableOpacity>
      
      {docData.hash ? (
        <Text style={styles.hashText} numberOfLines={1}>SHA-256: {docData.hash}</Text>
      ) : null}
    </View>
  );
};

export default function UploadScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [permission, requestPermission] = useCameraPermissions(); // SDK 54 Permission Hook
  
  // Workflow Stages
  const [stage, setStage] = useState(0); // 0:Choice, 1:Identification, 2:Count, 3:Wizard
  const [uploadType, setUploadType] = useState(null); 
  const [caseName, setCaseName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [docCount, setDocCount] = useState('');
  const [documents, setDocuments] = useState([]);

  // Capture States
  const [showCamera, setShowCamera] = useState(false);
  const [activeDocIndex, setActiveDocIndex] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Logic: Routing based on Selection ---
  const handleAction = async (index, isMedia) => {
    setActiveDocIndex(index);
    if (isMedia) {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) return Alert.alert("Security", "Camera access required for forensic capture.");
      }
      setShowCamera(true);
    } else {
      pickDocument(index);
    }
  };

  // --- Logic: Forensic Hashing & URI Cleaning ---
  const processFile = async (index, uri) => {
    setIsProcessing(true);
    try {
      // Small timeout to ensure file is saved to cache
      await new Promise(r => setTimeout(r, 400)); 
      
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64);

      const updated = [...documents];
      updated[index] = { ...updated[index], uri, hash };
      setDocuments(updated);
      setShowCamera(false);
    } catch (e) {
      Alert.alert("Hashing Error", "Memory limit reached. Try a smaller file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const pickDocument = async (index) => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (!result.canceled) processFile(index, result.assets[0].uri);
  };

  const startWizard = () => {
    const count = parseInt(docCount);
    if (isNaN(count) || count <= 0) return Alert.alert("Required", "Please enter document quantity.");
    setDocuments(Array.from({ length: count }, () => ({ docType: 'Photo', uri: null, hash: '' })));
    setStage(3);
  };

  // --- Camera View (SDK 54 Standards) ---
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={(ref) => setCameraRef(ref)}>
          <View style={styles.camOverlay}>
             <TouchableOpacity 
              style={styles.shutter} 
              onPress={async () => {
                if (cameraRef && !isProcessing) {
                  // skipProcessing: true prevents the "infinite loading" bug
                  const photo = await cameraRef.takePictureAsync({ quality: 0.3, skipProcessing: true });
                  processFile(activeDocIndex, photo.uri);
                }
              }}
            >
              {isProcessing ? <ActivityIndicator color="#0B2D52" /> : <View style={styles.shutterInner} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCamera(false)}>
              <Text style={{color: '#FFF', fontWeight: 'bold'}}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>SAKSHI FORENSIC UPLOAD</Text></View>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        {stage === 0 && (
          <View style={styles.centered}>
            <Text style={styles.title}>Case Identification</Text>
            <TouchableOpacity style={styles.choiceCard} onPress={() => {setUploadType('new'); setStage(1);}}>
              <MaterialCommunityIcons name="folder-plus" size={32} color="#0B2D52" />
              <Text style={styles.choiceText}>New Case Entry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.choiceCard} onPress={() => {setUploadType('existing'); setStage(1);}}>
              <MaterialCommunityIcons name="folder-sync" size={32} color="#0B2D52" />
              <Text style={styles.choiceText}>Existing Case Entry</Text>
            </TouchableOpacity>
          </View>
        )}

        {stage === 1 && (
          <View>
            <Text style={styles.title}>{uploadType === 'new' ? 'Case Name' : 'Existing Case ID'}</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter Case Reference" 
              onChangeText={uploadType === 'new' ? setCaseName : setCaseId} 
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStage(2)}><Text style={styles.btnText}>Proceed</Text></TouchableOpacity>
          </View>
        )}

        {stage === 2 && (
          <View>
            <Text style={styles.title}>Document Quantity</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="How many items?" 
              onChangeText={setDocCount} 
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={startWizard}><Text style={styles.btnText}>Start Wizard</Text></TouchableOpacity>
          </View>
        )}

        {stage === 3 && (
          <View>
            <Text style={styles.subHeader}>Linked to: {uploadType === 'new' ? caseName : caseId}</Text>
            {documents.map((doc, idx) => (
              <DocumentSection 
                key={idx} 
                index={idx} 
                docData={doc} 
                onAction={handleAction} 
                onTypeChange={(i, type) => {
                  const updated = [...documents];
                  updated[i].docType = type;
                  updated[i].uri = null;
                  setDocuments(updated);
                }} 
              />
            ))}
            <TouchableOpacity 
              style={[styles.submitBtn, documents.some(d => !d.uri) && {opacity: 0.5}]} 
              disabled={documents.some(d => !d.uri)}
              onPress={() => {
                Alert.alert("Success", "Evidence submitted to blockchain ledger.");
                navigation.navigate('Dashboard');
              }}
            >
              <Text style={styles.btnText}>Finalize & Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { padding: 20, backgroundColor: '#0B2D52', alignItems: 'center', paddingTop: 50 },
  headerTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0B2D52', marginBottom: 20 },
  subHeader: { color: '#666', marginBottom: 20, fontWeight: 'bold' },
  choiceCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 3 },
  choiceText: { marginLeft: 15, fontSize: 18, fontWeight: 'bold', color: '#0B2D52' },
  input: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', marginBottom: 20, fontSize: 16 },
  primaryBtn: { backgroundColor: '#0B2D52', padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtn: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 50 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  docCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 18, marginBottom: 20, elevation: 2 },
  docNumber: { fontSize: 16, fontWeight: 'bold', color: '#0B2D52', marginBottom: 15 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeBadge: { padding: 8, borderRadius: 15, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F9F9F9' },
  typeBadgeActive: { backgroundColor: '#0B2D52', borderColor: '#0B2D52' },
  typeText: { fontSize: 11, color: '#666' },
  typeTextActive: { color: '#FFF', fontWeight: 'bold' },
  uploadBtn: { padding: 16, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  mediaBtn: { backgroundColor: '#1B5E20' },
  fileBtn: { backgroundColor: '#455A64' },
  uploadBtnSuccess: { backgroundColor: '#0B2D52' },
  uploadBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10 },
  hashText: { fontSize: 9, color: '#999', marginTop: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  camOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  shutter: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },
  closeBtn: { marginTop: 20, padding: 10 }
});