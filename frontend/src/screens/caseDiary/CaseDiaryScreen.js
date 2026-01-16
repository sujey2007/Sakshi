import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Alert, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Modal, Image 
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 

// --- 1. STATIC MOCK DATA ---
const BASE_CASE_DATA = {
  caseId: "CASE-2026-BLR-0042", 
  title: "Cyber Fraud - XYZ Payment Gateway",
  status: "Active",
  officer: "IO Rahul Sharma",
  timeline: [
    {
      id: "EVT-001",
      time: "10 Jan 09:30 AM",
      title: "Squad Initialization",
      desc: "Team assembled. FIR details briefed.",
      gps: "12.9716° N, 77.5946° E",
      verified: true
    },
    {
      id: "EVT-002",
      time: "10 Jan 11:15 AM",
      title: "Evidence Seizure",
      desc: "Seized Server HDD and Suspect's Laptop.",
      gps: "12.9352° N, 77.6245° E",
      verified: true
    }
  ],
  vault: [
    {
      id: "DOC-A101",
      type: "Seizure Memo",
      name: "Seizure_Memo_001.pdf",
      hash: "0x7f83...6d90",
      status: "Blockchain Verified"
    }
  ],
  certificates: [
    {
      id: "CERT-001",
      type: "Section 65B Certificate",
      desc: "Admissibility for Server Logs (HDD-01)",
      generatedBy: "IO Rahul Sharma",
      date: "12 Jan 2026",
      status: "Ready to Print",
      icon: "certificate",
      color: "#FF9500"
    },
    {
      id: "CERT-002",
      type: "Section 105 BNSS Memo",
      desc: "Chain of Custody for Workstation",
      generatedBy: "IO Rahul Sharma",
      date: "14 Jan 2026",
      status: "Pending Signature",
      icon: "file-signature",
      color: "#007AFF"
    }
  ],
  tracker: [
    {
      id: "TRK-001",
      item: "Server Log Backup (HDD-01)",
      status: "At Forensic Lab",
      originator: "IO Rahul Sharma",
      currentCustodian: "Dr. Anjali (Lab Head)",
      hash: "0x7f83...6d90",
      meta: "S/N: SEAGATE-XYZ-009",
      witness: "Pancha: Mr. R. Kumar"
    },
    {
      id: "TRK-002",
      item: "Suspect's Workstation (MacBook Pro)",
      status: "In Transit",
      originator: "SI Priya Singh",
      currentCustodian: "Logistics: Constable Rajesh",
      hash: "0x3a21...99aa",
      meta: "MAC: A1:B2:C3:D4:E5",
      witness: "Pancha: Mrs. S. Devi"
    },
    {
      id: "TRK-003",
      item: "Encrypted USB Drive (BitLocker)",
      status: "Stored in Malkhana",
      originator: "IO Rahul Sharma",
      currentCustodian: "Malkhana In-Charge",
      hash: "0x8b12...44cc",
      meta: "CAP: 64GB (SanDisk)",
      witness: "Pancha: Mr. R. Kumar"
    }
  ]
};

export default function CaseDiaryScreen({ navigation }) {
  // --- STATE ---
  const [isCaseLoaded, setIsCaseLoaded] = useState(false); 
  const [inputCaseId, setInputCaseId] = useState('');      
  
  const [activeTab, setActiveTab] = useState('Timeline');
  const [currentCaseId, setCurrentCaseId] = useState(BASE_CASE_DATA.caseId); 
  
  const [vaultData, setVaultData] = useState(BASE_CASE_DATA.vault);
  const [timelineData, setTimelineData] = useState(BASE_CASE_DATA.timeline); 
  const [certData, setCertData] = useState(BASE_CASE_DATA.certificates); 
  const [trackerData, setTrackerData] = useState(BASE_CASE_DATA.tracker); 

  // --- MODAL STATES ---
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  const [recipientName, setRecipientName] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [designation, setDesignation] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [location, setLocation] = useState('');

  const [pdfVisible, setPdfVisible] = useState(false);
  const [viewingCert, setViewingCert] = useState(null);

  // --- SYNC LOGIC (UPDATED) ---
  useFocusEffect(
    useCallback(() => {
      const loadSyncedEvidence = async () => {
        try {
          // 1. Fetch Local Data
          const jsonValue = await AsyncStorage.getItem('@evidence_vault');
          const localEvidence = jsonValue != null ? JSON.parse(jsonValue) : [];
          
          // 2. Sync Vault
          setVaultData([...localEvidence, ...BASE_CASE_DATA.vault]);

          // 3. Sync Timeline
          const newTimelineEvents = localEvidence.map((item, index) => ({
             id: `SYNC-EVT-${index}`,
             time: item.time ? item.time : "Just Now", 
             title: "Evidence Uploaded",
             desc: `Uploaded ${item.type}: ${item.name}`,
             gps: "12.9716° N, 77.5946° E", 
             verified: true
          }));
          setTimelineData([...newTimelineEvents, ...BASE_CASE_DATA.timeline]);

          // 4. Sync Certificates (Auto-Draft Section 65B)
          const newCertificates = localEvidence.map((item, index) => ({
             id: `SYNC-CERT-${index}`,
             type: "Section 65B Certificate",
             desc: `Admissibility for ${item.type}`,
             generatedBy: "Current Officer",
             date: item.time ? item.time.split(' ')[0] : "Today",
             status: "Draft / Pending",
             icon: "certificate",
             color: "#999" // Grey to indicate draft
          }));
          setCertData([...newCertificates, ...BASE_CASE_DATA.certificates]);

          // 5. Sync Tracker (Start Chain of Custody)
          const newTrackerItems = localEvidence.map((item, index) => ({
             id: `SYNC-TRK-${index}`,
             item: `${item.type} (${item.name.substring(0, 8)}...)`,
             status: "At Crime Scene",
             originator: "Current Officer",
             currentCustodian: "Current Officer",
             hash: item.hash || "Pending Hash...",
             meta: "DEVICE-META-LOG",
             witness: "Pending Entry"
          }));
          setTrackerData([...newTrackerItems, ...BASE_CASE_DATA.tracker]);

        } catch(e) {
          console.error("Sync Error:", e);
        }
      };
      loadSyncedEvidence();
    }, [])
  );

  // --- HANDLERS ---
  const handleSearchCase = () => {
    if (inputCaseId.trim().length === 0) {
      Alert.alert("Invalid ID", "Please enter a Case ID to proceed.");
      return;
    }
    setCurrentCaseId(inputCaseId.toUpperCase()); 
    setIsCaseLoaded(true); 
  };

  const handleExitCase = () => {
    setIsCaseLoaded(false); 
    setInputCaseId('');
  };

  const openTransferModal = (itemId) => {
    setSelectedItemId(itemId);
    setRecipientName(''); 
    setRecipientId('');
    setDesignation('');
    setTransferReason('');
    setLocation('');
    setTransferModalVisible(true);
  };

  const confirmTransfer = () => {
    if (!recipientName.trim() || !recipientId.trim() || !designation.trim() || !transferReason.trim() || !location.trim()) {
      Alert.alert("Incomplete Handover", "All fields are required for digital signature.");
      return;
    }
    const updatedTracker = trackerData.map(item => {
      if (item.id === selectedItemId) {
        return { 
          ...item, 
          currentCustodian: `${recipientName} (${designation})`, 
          status: `At ${location}`    
        };
      }
      return item;
    });
    setTrackerData(updatedTracker);
    setTransferModalVisible(false);
    Alert.alert("Transfer Successful", `Custody officially transferred to ${recipientName}.\nLog Reason: ${transferReason}`);
  };

  const handleViewPdf = (cert) => {
    setViewingCert(cert);
    setPdfVisible(true);
  };

  // --- RENDERERS ---
  const renderTimelineItem = ({ item }) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={styles.line} />
        <View style={styles.dot} />
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timestamp}>{item.time}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
              <Text style={styles.verifiedText}> Hashed</Text>
            </View>
          )}
        </View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDesc}>{item.desc}</Text>
        <View style={styles.gpsContainer}>
          <Ionicons name="location-sharp" size={14} color="#666" />
          <Text style={styles.gpsText}>{item.gps}</Text>
        </View>
      </View>
    </View>
  );

  const renderVaultItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <FontAwesome5 name="file-contract" size={20} color="#007AFF" />
           <Text style={styles.cardTitle}>{item.type || "Evidence"}</Text>
        </View>
        <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.fileName}>{item.name}</Text>
      <View style={styles.hashContainer}>
        <Text style={styles.hashLabel}>Integrity Hash:</Text>
        <Text style={styles.hashValue}>{item.hash || "Pending Hash..."}</Text>
      </View>
      <View style={styles.statusRow}>
        <MaterialIcons name="verified" size={16} color="#34C759" />
        <Text style={styles.statusText}>{item.status || "Synced Locally"}</Text>
      </View>
    </View>
  );

  const renderCertificateItem = ({ item }) => (
    <View style={styles.certCard}>
      <View style={[styles.certIconBg, { backgroundColor: item.color + '15' }]}>
         <FontAwesome5 name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.certContent}>
        <View style={styles.certHeader}>
           <Text style={styles.certTitle}>{item.type}</Text>
           {item.status === "Ready to Print" ? (
             <MaterialIcons name="print" size={18} color="#666" />
           ) : (
             <MaterialIcons name="pending" size={18} color="#FF9500" />
           )}
        </View>
        <Text style={styles.certDesc}>{item.desc}</Text>
        <Text style={styles.certMeta}>Generated: {item.date} • {item.generatedBy}</Text>
        <View style={styles.certActions}>
            <View style={[styles.statusBadge, { backgroundColor: item.status === "Ready to Print" ? '#DCFCE7' : '#FEF3C7' }]}>
                <Text style={[styles.statusTextBadge, { color: item.status === "Ready to Print" ? '#166534' : '#D97706' }]}>
                    {item.status}
                </Text>
            </View>
            <TouchableOpacity style={styles.actionLink} onPress={() => handleViewPdf(item)}>
                <Text style={styles.linkText}>View PDF</Text>
                <MaterialIcons name="arrow-forward" size={12} color="#007AFF" />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTrackerItem = ({ item }) => {
    let statusColor = '#666'; 
    let statusBg = '#eee';
    if(item.status.includes('Forensic')) { statusColor = '#673AB7'; statusBg = '#F3E5F5'; }
    else if(item.status.includes('Transit')) { statusColor = '#FF9800'; statusBg = '#FFF3E0'; }
    else if(item.status.includes('Malkhana')) { statusColor = '#795548'; statusBg = '#EFEBE9'; }
    else if(item.status.includes('Crime Scene')) { statusColor = '#D32F2F'; statusBg = '#FFEBEE'; }
    else { statusColor = '#2196F3'; statusBg = '#E3F2FD'; }

    return (
      <View style={styles.trackerCard}>
        <View style={styles.trackerHeader}>
          <Text style={styles.trackerItemName}>{item.item}</Text>
          <View style={[styles.trackerBadge, { backgroundColor: statusBg }]}>
             <Text style={[styles.trackerBadgeText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.custodyFlow}>
          <View style={styles.custodyNode}>
             <Text style={styles.custodyLabel}>Collected By</Text>
             <Text style={styles.custodyValue}>{item.originator}</Text>
             <Text style={styles.custodySub}>Origin</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right-thin" size={24} color="#999" />
          <View style={styles.custodyNode}>
             <Text style={styles.custodyLabel}>Held At/By</Text>
             <Text style={styles.custodyValue}>{item.currentCustodian}</Text>
             <Text style={styles.custodySub}>Current Location</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.handoverBtn} onPress={() => openTransferModal(item.id)}>
           <MaterialCommunityIcons name="account-arrow-right" size={20} color="#FFF" />
           <Text style={styles.handoverBtnText}>UPDATE CUSTODY</Text>
        </TouchableOpacity>

        <View style={styles.ledgerContainer}>
          <Text style={styles.ledgerTitle}>PHYSICAL EVIDENCE LEDGER</Text>
          <View style={styles.ledgerRow}>
             <Text style={styles.ledgerLabel}>HASH ID:</Text>
             <Text style={styles.ledgerValue}>{item.hash}</Text>
          </View>
          <View style={styles.ledgerRow}>
             <Text style={styles.ledgerLabel}>META:</Text>
             <Text style={styles.ledgerValue}>{item.meta}</Text>
          </View>
          <View style={styles.ledgerRow}>
             <Text style={styles.ledgerLabel}>WITNESS:</Text>
             <Text style={styles.ledgerValue}>{item.witness}</Text>
          </View>
        </View>
      </View>
    );
  };

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      
      {!isCaseLoaded ? (
         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.searchContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.absoluteBackBtn}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#1B365D" />
            </TouchableOpacity>
            <View style={styles.searchContent}>
                <View style={styles.searchIconBg}>
                    <MaterialCommunityIcons name="book-lock-open" size={50} color="#1B365D" />
                </View>
                <Text style={styles.searchTitle}>Access Case Diary</Text>
                <Text style={styles.searchSub}>Enter the Case ID to fetch the secure timeline.</Text>
                <TextInput 
                  style={styles.searchInput}
                  placeholder="e.g. CASE-2026-BLR-0042"
                  placeholderTextColor="#999"
                  value={inputCaseId}
                  onChangeText={setInputCaseId}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearchCase}>
                    <Text style={styles.searchBtnText}>FETCH RECORDS</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
         </KeyboardAvoidingView>
      ) : (
      <>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExitCase} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Case Diary: {currentCaseId}</Text>
            <Text style={styles.headerSubtitle}>{BASE_CASE_DATA.title}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {['Timeline', 'Vault', 'Certificates', 'Tracker'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentArea}>
          {activeTab === 'Timeline' && (
            <FlatList 
              data={timelineData}
              renderItem={renderTimelineItem}
              keyExtractor={(item, index) => item.id || index.toString()}
              contentContainerStyle={{padding: 20}}
            />
          )}
          {activeTab === 'Vault' && (
             <FlatList 
             data={vaultData} 
             renderItem={renderVaultItem}
             keyExtractor={(item, index) => item.id || index.toString()}
             contentContainerStyle={{padding: 20}}
           />
          )}
          {activeTab === 'Certificates' && (
             <View style={{flex:1}}>
                 <Text style={[styles.sectionHeader, {marginLeft: 20, marginTop: 20}]}>Automated Legal Compliance (BNSS)</Text>
                 <FlatList
                   data={certData}
                   renderItem={renderCertificateItem}
                   keyExtractor={item => item.id}
                   contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 20}}
                 />
             </View>
          )}
          {activeTab === 'Tracker' && (
             <View style={{flex:1}}>
                 <Text style={[styles.sectionHeader, {marginLeft: 20, marginTop: 20}]}>Chain of Custody (Physical Track)</Text>
                 <FlatList
                   data={trackerData}
                   renderItem={renderTrackerItem}
                   keyExtractor={item => item.id}
                   contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 20}}
                 />
             </View>
          )}
        </View>

        {/* --- TRANSFER CUSTODY MODAL --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={transferModalVisible}
          onRequestClose={() => setTransferModalVisible(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <MaterialCommunityIcons name="account-switch" size={30} color="#1B365D" />
                <Text style={styles.modalTitle}>Transfer Custody</Text>
              </View>
              <Text style={styles.modalSub}>Enter the Official Details of the Receiver.</Text>
              
              <TextInput 
                style={styles.modalInput}
                placeholder="Receiver's Name"
                placeholderTextColor="#999"
                value={recipientName}
                onChangeText={setRecipientName}
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Official ID / Badge No."
                placeholderTextColor="#999"
                value={recipientId}
                onChangeText={setRecipientId}
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Designation (e.g. Inspector)"
                placeholderTextColor="#999"
                value={designation}
                onChangeText={setDesignation}
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Reason for Transfer"
                placeholderTextColor="#999"
                value={transferReason}
                onChangeText={setTransferReason}
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="New Location / Facility"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setTransferModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={confirmTransfer}>
                  <Text style={styles.confirmBtnText}>DIGITAL SIGN & CONFIRM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* --- PDF VIEWER MODAL --- */}
        <Modal
          animationType="slide"
          visible={pdfVisible}
          onRequestClose={() => setPdfVisible(false)}
        >
          <SafeAreaView style={styles.pdfContainer}>
            <View style={styles.pdfHeaderActions}>
              <TouchableOpacity onPress={() => setPdfVisible(false)} style={styles.pdfCloseBtn}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.pdfTopTitle}>Document Viewer</Text>
              <MaterialIcons name="share" size={24} color="#007AFF" />
            </View>
            <ScrollView contentContainerStyle={styles.pdfPaper}>
              <View style={styles.pdfBorder}>
                <View style={styles.pdfOfficialHeader}>
                  <MaterialCommunityIcons name="police-badge" size={50} color="#1B365D" />
                  <Text style={styles.govTitle}>GOVERNMENT OF INDIA</Text>
                  <Text style={styles.govSub}>MINISTRY OF HOME AFFAIRS</Text>
                  <Text style={styles.govSubSmall}>BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.certMainTitle}>{viewingCert?.type?.toUpperCase()}</Text>
                <View style={styles.certBody}>
                  <Text style={styles.certText}>
                    This is to certify that the electronic record/evidence described below has been preserved in accordance with the standard operating procedures laid down under Section 65B of the Indian Evidence Act / relevant sections of BNSS.
                  </Text>
                  <View style={styles.certDetails}>
                    <Text style={styles.detailLabel}>CASE ID:</Text>
                    <Text style={styles.detailValue}>{currentCaseId}</Text>
                    <Text style={styles.detailLabel}>SUBJECT:</Text>
                    <Text style={styles.detailValue}>{viewingCert?.desc}</Text>
                    <Text style={styles.detailLabel}>GENERATED DATE:</Text>
                    <Text style={styles.detailValue}>{viewingCert?.date}</Text>
                  </View>
                  <Text style={styles.certText}>
                    I, <Text style={{fontWeight: 'bold'}}>{viewingCert?.generatedBy}</Text>, hereby declare that the integrity of the hash value generated at the time of seizure remains intact and has not been tampered with.
                  </Text>
                </View>
                <View style={styles.signatureBox}>
                  <Text style={styles.signTitle}>Digitally Signed By:</Text>
                  <Image 
                    source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png'}} 
                    style={styles.signImage} 
                    resizeMode="contain"
                  />
                  <Text style={styles.signName}>{viewingCert?.generatedBy}</Text>
                  <Text style={styles.signHash}>Hash: 0x7f83b165...7284add</Text>
                  <Text style={styles.signStamp}>OFFICIAL DIGITAL STAMP</Text>
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.printBtn} onPress={() => setPdfVisible(false)}>
               <Text style={styles.printBtnText}>PRINT DOCUMENT</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

      </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  searchContainer: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#F5F7FA' },
  absoluteBackBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  searchContent: { alignItems: 'center', backgroundColor: '#FFF', padding: 30, borderRadius: 20, elevation: 5 },
  searchIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  searchTitle: { fontSize: 24, fontWeight: 'bold', color: '#1B365D', marginBottom: 10 },
  searchSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
  searchInput: { width: '100%', backgroundColor: '#F0F4F8', padding: 15, borderRadius: 12, fontSize: 16, textAlign: 'center', fontWeight: 'bold', color: '#333', borderWidth: 1, borderColor: '#DDD', marginBottom: 20 },
  searchBtn: { flexDirection: 'row', backgroundColor: '#1B365D', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, alignItems: 'center', width: '100%', justifyContent: 'center' },
  searchBtnText: { color: '#FFF', fontWeight: 'bold', marginRight: 10, letterSpacing: 1 },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#1B365D', flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' }, 
  headerSubtitle: { fontSize: 14, color: '#E0E0E0', marginTop: 4 }, 
  tabContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#E0E7FF' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#666' }, 
  activeTabText: { color: '#007AFF' },
  contentArea: { flex: 1 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', marginRight: 15, width: 20 },
  line: { width: 2, flex: 1, backgroundColor: '#DDD' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#007AFF', position: 'absolute', top: 0 },
  timelineContent: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 2 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  timestamp: { fontSize: 12, fontWeight: '600', color: '#888' },
  verifiedBadge: { flexDirection: 'row', backgroundColor: '#34C759', paddingHorizontal: 6, borderRadius: 4, alignItems: 'center' },
  verifiedText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  eventDesc: { fontSize: 14, color: '#555', marginVertical: 4 },
  gpsContainer: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
  gpsText: { fontSize: 12, color: '#666', marginLeft: 4 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  fileName: { fontSize: 14, color: '#333', marginBottom: 10 },
  hashContainer: { backgroundColor: '#F8F9FA', padding: 8, borderRadius: 6 },
  hashLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase' },
  hashValue: { fontSize: 11, fontFamily: 'Courier', color: '#555' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  statusText: { fontSize: 12, color: '#34C759', fontWeight: '600', marginLeft: 5 },
  certCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  certIconBg: { width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  certContent: { flex: 1 },
  certHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  certTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  certDesc: { fontSize: 13, color: '#666', marginVertical: 4 },
  certMeta: { fontSize: 11, color: '#999', marginBottom: 10 },
  certActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusTextBadge: { fontSize: 10, fontWeight: 'bold' },
  actionLink: { flexDirection: 'row', alignItems: 'center' },
  linkText: { fontSize: 12, color: '#007AFF', fontWeight: '600', marginRight: 4 },
  trackerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  trackerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  trackerItemName: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  trackerBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  trackerBadgeText: { fontSize: 10, fontWeight: 'bold' },
  custodyFlow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA', padding: 10, borderRadius: 8, marginBottom: 15 },
  custodyNode: { flex: 1 },
  custodyLabel: { fontSize: 10, color: '#888', marginBottom: 2 },
  custodyValue: { fontSize: 12, fontWeight: '600', color: '#333' },
  custodySub: { fontSize: 9, color: '#999', marginTop: 2, fontStyle: 'italic' },
  ledgerContainer: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  ledgerTitle: { fontSize: 10, fontWeight: 'bold', color: '#aaa', marginBottom: 8, letterSpacing: 1 },
  ledgerRow: { flexDirection: 'row', marginBottom: 4 },
  ledgerLabel: { fontSize: 10, color: '#666', width: 60, fontWeight: '600' },
  ledgerValue: { fontSize: 10, color: '#333', flex: 1, fontFamily: 'Courier' },
  handoverBtn: { flexDirection: 'row', backgroundColor: '#1B365D', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  handoverBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#FFF', borderRadius: 15, padding: 25, elevation: 5 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B365D', marginLeft: 10 },
  modalSub: { fontSize: 14, color: '#666', marginBottom: 20 },
  modalInput: { backgroundColor: '#F5F7FA', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', color: '#333', fontSize: 16, marginBottom: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, marginRight: 10 },
  cancelBtnText: { color: '#888', fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#1B365D', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8 },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold' },
  pdfContainer: { flex: 1, backgroundColor: '#F2F2F2' },
  pdfHeaderActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#DDD' },
  pdfTopTitle: { fontSize: 16, fontWeight: 'bold' },
  pdfPaper: { flex: 1, padding: 20 },
  pdfBorder: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#1B365D', padding: 30, marginBottom: 30, elevation: 2 },
  pdfOfficialHeader: { alignItems: 'center', marginBottom: 20 },
  govTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B365D', marginTop: 10, letterSpacing: 1 },
  govSub: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 5 },
  govSubSmall: { fontSize: 10, fontWeight: 'bold', color: '#555', marginTop: 5, fontStyle: 'italic' },
  divider: { height: 2, backgroundColor: '#1B365D', marginVertical: 20 },
  certMainTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#000', marginBottom: 20, textDecorationLine: 'underline' },
  certBody: { marginBottom: 30 },
  certText: { fontSize: 14, lineHeight: 22, color: '#333', textAlign: 'justify', marginBottom: 15 },
  certDetails: { backgroundColor: '#F9FAFB', padding: 15, borderWidth: 1, borderColor: '#EEE', marginVertical: 15 },
  detailLabel: { fontSize: 11, color: '#888', fontWeight: 'bold' },
  detailValue: { fontSize: 14, color: '#333', fontWeight: 'bold', marginBottom: 10 },
  signatureBox: { marginTop: 30, alignItems: 'flex-end' },
  signTitle: { fontSize: 12, color: '#888', marginBottom: 5 },
  signImage: { width: 100, height: 40, marginBottom: 5 },
  signName: { fontSize: 16, fontWeight: 'bold', color: '#1B365D' },
  signHash: { fontSize: 10, color: '#555', fontFamily: 'Courier', marginTop: 2 },
  signStamp: { color: '#D32F2F', fontSize: 10, fontWeight: 'bold', marginTop: 5, borderWidth: 1, borderColor: '#D32F2F', padding: 4, borderRadius: 4 },
  printBtn: { backgroundColor: '#1B365D', margin: 20, padding: 15, borderRadius: 10, alignItems: 'center' },
  printBtnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 }
});