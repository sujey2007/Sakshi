import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView, ActivityIndicator, Modal, Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  bg: '#F0F4F8',        
  headerBg: '#1B365D',  
  textMain: '#1B365D',  
  textSub: '#4A5568',   
  inputBg: '#F7FAFC',   
  border: '#E2E8F0',    
  accent: '#1B365D',    
  success: '#38A169',
  danger: '#D32F2F',
  report: '#4A90E2'
};

export default function TeamManagementScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [deletedTeams, setDeletedTeams] = useState([]);
  const [isHashing, setIsHashing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [teamName, setTeamName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [officerId, setOfficerId] = useState(''); 
  const [selectedOfficers, setSelectedOfficers] = useState([]); 

  const [showReportModal, setShowReportModal] = useState(false);
  const [activeSquadForReport, setActiveSquadForReport] = useState(null);
  const [submittingOfficer, setSubmittingOfficer] = useState('');
  const [reportText, setReportText] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [showBinModal, setShowBinModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const saveData = async (active, deleted) => {
    try { 
      await AsyncStorage.setItem('@forensic_teams', JSON.stringify(active));
      await AsyncStorage.setItem('@deleted_teams', JSON.stringify(deleted));
    } catch (e) { console.log("Save error"); }
  };

  const loadData = async () => {
    try {
      const savedActive = await AsyncStorage.getItem('@forensic_teams');
      const savedDeleted = await AsyncStorage.getItem('@deleted_teams');
      if (savedActive) setTeams(JSON.parse(savedActive));
      if (savedDeleted) setDeletedTeams(JSON.parse(savedDeleted));
    } catch (e) { console.log("Load error"); }
  };

  const addOfficer = () => {
    if (!officerId.trim()) return;
    const formattedId = officerId.toUpperCase().trim();
    if (selectedOfficers.includes(formattedId)) return Alert.alert("Error", "Officer assigned.");
    setSelectedOfficers([...selectedOfficers, formattedId]);
    setOfficerId('');
  };

  const handleInitializeSquad = () => {
    if (!teamName || !caseId || selectedOfficers.length === 0) return Alert.alert("Error", "Fields required.");
    setIsHashing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.toLocaleDateString()} • ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      let updatedTeams;
      if (editingId) {
        updatedTeams = teams.map(t => t.id === editingId ? { ...t, name: teamName, caseId, officers: selectedOfficers } : t);
        setEditingId(null);
      } else {
        const newTeam = { id: Math.random().toString(), name: teamName, caseId, officers: [...selectedOfficers], timestamp: timeStr, reports: [] };
        updatedTeams = [newTeam, ...teams];
      }
      setTeams(updatedTeams);
      saveData(updatedTeams, deletedTeams);
      setIsHashing(false);
      setShowSuccessModal(true);
      setTeamName(''); setCaseId(''); setSelectedOfficers([]);
    }, 1200);
  };

  const submitReport = () => {
    if (!submittingOfficer || !reportText.trim()) return Alert.alert("Error", "Select Officer & enter text.");
    const now = new Date();
    const newReport = { officer: submittingOfficer, text: reportText, time: now.toLocaleString() };
    const updatedTeams = teams.map(t => {
      if (t.id === activeSquadForReport.id) return { ...t, reports: [newReport, ...(t.reports || [])] };
      return t;
    });
    setTeams(updatedTeams);
    saveData(updatedTeams, deletedTeams);
    setShowReportModal(false);
    setReportText('');
    setSubmittingOfficer('');
    Alert.alert("Success", "Daily report filed.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SQUAD INITIALIZATION</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.formCard}>
          <Text style={styles.label}>SQUAD ALIAS</Text>
          <TextInput style={styles.input} placeholder="e.g. Alpha Squad" value={teamName} onChangeText={setTeamName} />
          <Text style={styles.label}>CASE REFERENCE ID</Text>
          <TextInput style={styles.input} placeholder="CRI-000-000" value={caseId} onChangeText={(t) => setCaseId(t.toUpperCase())} />
          <View style={styles.officerRow}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Officer ID" value={officerId} onChangeText={setOfficerId} />
            <TouchableOpacity style={styles.addBtn} onPress={addOfficer}><MaterialCommunityIcons name="plus" size={24} color="white" /></TouchableOpacity>
          </View>
          <View style={styles.chipRow}>
            {selectedOfficers.map((id, idx) => (
              <View key={idx} style={styles.chip}><Text style={styles.chipText}>{id}</Text></View>
            ))}
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleInitializeSquad}>
            {isHashing ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>{editingId ? "UPDATE SQUAD" : "AUTHORIZE & HASH"}</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.registryHeader}>
          <Text style={styles.sectionTitle}>ACTIVE SQUAD REGISTRY</Text>
          <TouchableOpacity onPress={() => setShowBinModal(true)}><MaterialCommunityIcons name="delete-variant" size={24} color={COLORS.textSub} /></TouchableOpacity>
        </View>

        {teams.map((team) => (
          <View key={team.id} style={styles.teamCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamNameText}>{team.name}</Text>
              <Text style={styles.teamCaseText}>ID: {team.caseId}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => {setEditingId(team.id); setTeamName(team.name); setCaseId(team.caseId); setSelectedOfficers(team.officers);}} style={[styles.actionBtn, {backgroundColor: COLORS.headerBg}]}><MaterialCommunityIcons name="pencil" size={18} color="white" /></TouchableOpacity>
              <TouchableOpacity onPress={() => {setActiveSquadForReport(team); setShowReportModal(true);}} style={[styles.actionBtn, {backgroundColor: COLORS.report}]}><MaterialCommunityIcons name="file-document-edit" size={18} color="white" /></TouchableOpacity>
              <TouchableOpacity onPress={() => {setIdToDelete(team.id); setShowDeleteConfirm(true);}} style={[styles.actionBtn, {backgroundColor: COLORS.danger}]}><MaterialCommunityIcons name="trash-can" size={18} color="white" /></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* RECYCLE BIN MODAL */}
      <Modal visible={showBinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%', height: '60%' }]}>
            <View style={styles.binTitleRow}>
                <Text style={styles.binTitle}>RECYCLE BIN</Text>
                <TouchableOpacity onPress={() => setShowBinModal(false)}><MaterialCommunityIcons name="close" size={24} color={COLORS.textMain} /></TouchableOpacity>
            </View>
            <ScrollView>
                {deletedTeams.map((t) => (
                    <View key={t.id} style={styles.binCard}>
                        <Text style={styles.teamNameText}>{t.name}</Text>
                        <TouchableOpacity onPress={() => {
                            setTeams([t, ...teams]);
                            setDeletedTeams(deletedTeams.filter(x => x.id !== t.id));
                        }}><MaterialCommunityIcons name="restore" size={24} color={COLORS.success} /></TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* REPORT MODAL */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%', padding: 0 }]}>
            <View style={[styles.modalHeader, {backgroundColor: COLORS.report}]}>
              <Text style={styles.modalHeaderText}>ATTRIBUTED DAILY REPORT</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}><MaterialCommunityIcons name="close" size={24} color="white" /></TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={styles.label}>SELECT SUBMITTING OFFICER</Text>
              <View style={styles.chipRow}>
                {activeSquadForReport?.officers.map((off, i) => (
                  <TouchableOpacity key={i} onPress={() => setSubmittingOfficer(off)} style={[styles.chip, submittingOfficer === off && {backgroundColor: COLORS.report}]}>
                    <Text style={[styles.chipText, submittingOfficer === off && {color: 'white'}]}>{off}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={styles.textArea} placeholder="Enter report text..." multiline value={reportText} onChangeText={setReportText} />
              <TouchableOpacity style={[styles.submitBtn, {backgroundColor: COLORS.report}]} onPress={submitReport}>
                <Text style={styles.submitBtnText}>SUBMIT LOG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="alert" size={50} color={COLORS.danger} />
            <Text style={styles.modalTitle}>MOVE TO BIN?</Text>
            <View style={styles.officerRow}>
              <TouchableOpacity style={[styles.submitBtn, {flex: 1, backgroundColor: '#CCC', marginRight: 10}]} onPress={() => setShowDeleteConfirm(false)}><Text>NO</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, {flex: 1, backgroundColor: COLORS.danger}]} onPress={() => {
                const teamToBin = teams.find(t => t.id === idToDelete);
                const updated = teams.filter(t => t.id !== idToDelete);
                setTeams(updated); setDeletedTeams([teamToBin, ...deletedTeams]);
                saveData(updated, [teamToBin, ...deletedTeams]); setShowDeleteConfirm(false);
              }}><Text style={{color: 'white'}}>YES</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="check-circle" size={60} color={COLORS.success} />
            <Text style={styles.modalTitle}>HASHED SUCCESSFULLY</Text>
            <TouchableOpacity style={styles.submitBtn} onPress={() => setShowSuccessModal(false)}><Text style={{color: 'white'}}>CONTINUE</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.headerBg, paddingTop: 50 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  formCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 3, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: 'bold', color: COLORS.textSub, marginBottom: 5 },
  input: { backgroundColor: COLORS.inputBg, padding: 15, borderRadius: 5, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border, fontWeight: 'bold' },
  officerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  addBtn: { backgroundColor: COLORS.accent, padding: 13, borderRadius: 5, marginLeft: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { backgroundColor: '#E2E8F0', padding: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMain },
  submitBtn: { backgroundColor: COLORS.accent, padding: 15, borderRadius: 5, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: 'bold' },
  registryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.textMain },
  teamCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  teamNameText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
  teamCaseText: { fontSize: 12, color: COLORS.textSub },
  actionRow: { flexDirection: 'row' },
  actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 15, alignItems: 'center' },
  modalHeader: { width: '100%', padding: 15, borderTopLeftRadius: 15, borderTopRightRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalHeaderText: { color: 'white', fontWeight: 'bold' },
  textArea: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 5, padding: 15, height: 120, textAlignVertical: 'top', marginBottom: 20, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain, marginVertical: 15 },
  binTitleRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  binTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
  binCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.inputBg, padding: 15, borderRadius: 10, marginBottom: 10 }
});