import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  ScrollView, Dimensions, Modal, TextInput, Alert, FlatList 
} from 'react-native';
import { AuthContext } from '../../context/AuthContext'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  
  // --- STATE FOR PERSONNEL ---
  const [personnel, setPersonnel] = useState([
    { id: '1', name: 'Insp. Vikram Singh', role: 'Lead Investigator', status: 'Active', badge: 'V-102' },
    { id: '2', name: 'Sub-Insp. Priya Rai', role: 'Forensic Analyst', status: 'On Field', badge: 'P-554' },
    { id: '3', name: 'Const. Amit Kumar', role: 'Evidence Handler', status: 'Active', badge: 'A-908' },
    { id: '4', name: 'Dr. Sameer Khan', role: 'Medical Examiner', status: 'Away', badge: 'S-221' },
    { id: '5', name: 'Insp. Rajesh Gupta', role: 'System Admin', status: 'Active', badge: 'ROOT-99' },
    { id: '6', name: 'Sub-Insp. Neha Sharma', role: 'Cyber Specialist', status: 'Active', badge: 'N-412' },
    { id: '7', name: 'Const. Ravi Varma', role: 'Patrol Officer', status: 'Offline', badge: 'R-112' },
    { id: '8', name: 'Insp. Sunita Rao', role: 'Legal Consultant', status: 'Offline', badge: 'S-889' },
    { id: '9', name: 'Sgt. Leo Das', role: 'Field Technician', status: 'Offline', badge: 'L-007' },
  ]);

  const MOCK_CASES = [
    { id: 'C-8821', title: 'Cyber Heist - North Block', status: 'Under Investigation' },
    { id: 'C-9904', title: 'Data Breach - HQ Alpha', status: 'Evidence Collected' },
    { id: 'C-1022', title: 'Crypto Laundering Trace', status: 'Active Tracking' }
  ];

  const MOCK_CUSTODY = [
    { id: 'T1', item: 'Encrypted HDD', who: 'Insp. Vikram Singh', when: '14 Jan 2026', action: 'Seized' },
    { id: 'T2', item: 'Server Logs', who: 'Sub-Insp. Neha Sharma', when: '13 Jan 2026', action: 'Captured' }
  ];

  // --- MODAL STATES ---
  const [showUsers, setShowUsers] = useState(false);
  const [showCases, setShowCases] = useState(false);
  const [showCustody, setShowCustody] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // --- LOGIC STATES ---
  const [accessKey, setAccessKey] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // --- REGISTRATION FORM STATE ---
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const handleLogout = () => {
    Alert.alert("Terminate Session", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Terminate", onPress: async () => { if (logout) await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }, style: "destructive" }
    ]);
  };

  const startAction = (action) => {
    setPendingAction(action);
    setIsVerifying(true);
  };

  const confirmAccess = () => {
    if (accessKey.trim().length > 0) {
      setIsVerifying(false); 
      // The useEffect below will handle opening the feature modal
    } else {
      Alert.alert("Required", "Please enter any key to verify root access.");
    }
  };

  // TRIGGER FEATURE MODAL AFTER GATE CLOSES
  useEffect(() => {
    if (!isVerifying && pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setAccessKey('');
      
      // Essential Delay for Mobile UI Rendering
      setTimeout(() => {
        if (action === 'users') setShowUsers(true);
        if (action === 'cases') setShowCases(true);
        if (action === 'custody') setShowCustody(true);
        if (action === 'register') setShowRegistration(true);
      }, 350);
    }
  }, [isVerifying, pendingAction]);

  const handleEnrollPersonnel = () => {
    if (!newName || !newRole || !newBadge) return Alert.alert("Error", "Fields required.");
    setPersonnel([{ id: Date.now().toString(), name: newName, role: newRole, badge: newBadge.toUpperCase(), status: 'Offline' }, ...personnel]);
    setNewName(''); setNewRole(''); setNewBadge(''); setShowRegistration(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerSide}>
            <Text style={styles.adminBadge}>ROOT PRIVILEGE</Text>
            <Text style={styles.headerValue}>{user?.name || "admin"}</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.brandTitle}>SAKSHI</Text>
            <Text style={styles.brandSub}>ADMINISTRATOR</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.headerSide}>
            <MaterialCommunityIcons name="shield-lock" size={24} color="white" style={{alignSelf: 'flex-end'}} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Administrator Controls</Text>
        <View style={styles.grid}>
          {/* CARDS */}
          <TouchableOpacity style={styles.card} onPress={() => startAction('register')}>
            <View style={[styles.iconBox, {backgroundColor: '#E8F5E9'}]}>
              <MaterialCommunityIcons name="account-plus" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.cardTitle}>Register User</Text>
            <Text style={styles.cardSubtitle}>Enroll Personnel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => startAction('users')}>
            <View style={[styles.iconBox, {backgroundColor: '#E3F2FD'}]}>
              <MaterialCommunityIcons name="account-group" size={28} color="#1565C0" />
            </View>
            <Text style={styles.cardTitle}>Users & Roles</Text>
            <Text style={styles.cardSubtitle}>{personnel.length} Authorized</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => startAction('cases')}>
            <View style={[styles.iconBox, {backgroundColor: '#F3E5F5'}]}>
              <MaterialCommunityIcons name="folder-text" size={28} color="#7B1FA2" />
            </View>
            <Text style={styles.cardTitle}>Cases & Evidence</Text>
            <Text style={styles.cardSubtitle}>Registry Access</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => startAction('custody')}>
            <View style={[styles.iconBox, {backgroundColor: '#FFF3E0'}]}>
              <MaterialCommunityIcons name="link-lock" size={28} color="#E65100" />
            </View>
            <Text style={styles.cardTitle}>Chain of Custody</Text>
            <Text style={styles.cardSubtitle}>Handling Timeline</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutFooter} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#D32F2F" />
          <Text style={styles.logoutFooterText}>Terminate Session</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- MASTER OVERRIDE MODAL --- */}
      <Modal visible={isVerifying} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.gateCard}>
            <MaterialCommunityIcons name="shield-key" size={60} color="#0B2D52" />
            <Text style={styles.gateTitle}>Master Override</Text>
            <TextInput style={styles.gateInput} placeholder="ANY KEY" secureTextEntry onChangeText={setAccessKey} value={accessKey} placeholderTextColor="#999" />
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmAccess}><Text style={styles.confirmBtnText}>GRANT ACCESS</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {setIsVerifying(false); setPendingAction(null);}} style={{marginTop: 15}}><Text style={{color: '#777'}}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- PERSONNEL LIST MODAL --- */}
      <Modal visible={showUsers} animationType="slide">
        <SafeAreaView style={{flex: 1, backgroundColor: '#F5F7FA'}}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUsers(false)}><MaterialCommunityIcons name="chevron-left" size={30} color="white" /></TouchableOpacity>
            <Text style={styles.modalTitle}>Authorized Personnel</Text>
          </View>
          <FlatList data={personnel} keyExtractor={item => item.id} contentContainerStyle={{padding: 15}} renderItem={({item}) => (
            <View style={styles.listCard}>
              <View style={styles.listIcon}><Text style={styles.listLetter}>{item.name[0]}</Text></View>
              <View style={{flex: 1}}><Text style={styles.listName}>{item.name}</Text><Text style={styles.listSub}>{item.role}</Text></View>
              <View style={[styles.statusTag, {backgroundColor: item.status === 'Active' ? '#4CAF50' : item.status === 'Offline' ? '#9E9E9E' : '#FF9800'}]}><Text style={styles.statusText}>{item.status}</Text></View>
            </View>
          )} />
        </SafeAreaView>
      </Modal>

      {/* --- CASES MODAL --- */}
      <Modal visible={showCases} animationType="slide">
        <SafeAreaView style={{flex: 1, backgroundColor: '#F5F7FA'}}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCases(false)}><MaterialCommunityIcons name="chevron-left" size={30} color="white" /></TouchableOpacity>
            <Text style={styles.modalTitle}>Case Registry</Text>
          </View>
          <FlatList data={MOCK_CASES} keyExtractor={item => item.id} contentContainerStyle={{padding: 15}} renderItem={({item}) => (
            <View style={styles.listCard}>
              <MaterialCommunityIcons name="file-document" size={24} color="#7B1FA2" style={{marginRight: 15}} />
              <View style={{flex: 1}}><Text style={styles.listName}>{item.title}</Text><Text style={styles.listSub}>ID: {item.id} • Status: {item.status}</Text></View>
            </View>
          )} />
        </SafeAreaView>
      </Modal>

      {/* --- CUSTODY MODAL --- */}
      <Modal visible={showCustody} animationType="slide">
        <SafeAreaView style={{flex: 1, backgroundColor: '#F5F7FA'}}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustody(false)}><MaterialCommunityIcons name="chevron-left" size={30} color="white" /></TouchableOpacity>
            <Text style={styles.modalTitle}>Chain of Custody</Text>
          </View>
          <FlatList data={MOCK_CUSTODY} keyExtractor={item => item.id} contentContainerStyle={{padding: 15}} renderItem={({item}) => (
            <View style={styles.listCard}>
              <MaterialCommunityIcons name="link-lock" size={24} color="#E65100" style={{marginRight: 15}} />
              <View style={{flex: 1}}><Text style={styles.listName}>{item.action}: {item.item}</Text><Text style={styles.listSub}>{item.who} • {item.when}</Text></View>
            </View>
          )} />
        </SafeAreaView>
      </Modal>

      {/* --- REGISTRATION MODAL --- */}
      <Modal visible={showRegistration} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.gateCard}>
            <Text style={styles.gateTitle}>Register Personnel</Text>
            <TextInput style={styles.gateInput} placeholder="Full Name" value={newName} onChangeText={setNewName} placeholderTextColor="#999" />
            <TextInput style={styles.gateInput} placeholder="Role" value={newRole} onChangeText={setNewRole} placeholderTextColor="#999" />
            <TextInput style={styles.gateInput} placeholder="Badge ID" value={newBadge} onChangeText={setNewBadge} placeholderTextColor="#999" />
            <TouchableOpacity style={[styles.confirmBtn, {backgroundColor: '#2E7D32'}]} onPress={handleEnrollPersonnel}><Text style={styles.confirmBtnText}>AUTHORIZE</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setShowRegistration(false)} style={{marginTop: 15}}><Text style={{color: '#777'}}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#0B2D52', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 25 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSide: { flex: 1 },
  headerCenter: { flex: 2, alignItems: 'center' },
  brandTitle: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: 3 },
  brandSub: { color: '#D1D1D1', fontSize: 10, fontWeight: 'bold' },
  adminBadge: { color: '#D1D1D1', fontSize: 8, fontWeight: 'bold' },
  headerValue: { color: 'white', fontSize: 13 },
  scrollContent: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: 'white', width: (width - 45) / 2, padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0B2D52', textAlign: 'center' },
  cardSubtitle: { fontSize: 11, color: '#78909C', marginTop: 4 },
  modalHeader: { backgroundColor: '#0B2D52', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  listCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  listIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0B2D52', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listLetter: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  listName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  listSub: { color: '#777', fontSize: 12 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  gateCard: { backgroundColor: 'white', width: '85%', padding: 30, borderRadius: 24, alignItems: 'center' },
  gateTitle: { fontSize: 22, fontWeight: 'bold', color: '#0B2D52', marginTop: 10 },
  gateInput: { width: '100%', backgroundColor: '#F5F7FA', padding: 15, borderRadius: 12, textAlign: 'center', marginVertical: 20, color: '#333' },
  confirmBtn: { backgroundColor: '#0B2D52', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' },
  logoutFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, paddingBottom: 20 },
  logoutFooterText: { color: '#D32F2F', fontWeight: 'bold', marginLeft: 8, fontSize: 15 }
});