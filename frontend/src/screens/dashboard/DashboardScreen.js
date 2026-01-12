import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  ScrollView, Dimensions, PanResponder 
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  
  // 10 minutes in seconds (600 seconds)
  const IDLE_TIME = 600; 
  const [secondsLeft, setSecondsLeft] = useState(IDLE_TIME);
  const timerRef = useRef(null);

  // --- Logic: Reset Timer on User Interaction ---
  const resetTimer = () => {
    setSecondsLeft(IDLE_TIME);
  };

  // Create a PanResponder to detect any touch on the screen
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer(); // Reset timer when user touches screen
        return false; // Don't block the touch from reaching buttons
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetTimer(); // Reset timer when user moves/scrolls
        return false;
      },
    })
  ).current;

  useEffect(() => {
    // Start the countdown
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          logout(); // Automatic logout after 10 mins of IDLE time
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    // Wrap the entire view with panHandlers to catch all interactions
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Session Active</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.timerContainer, secondsLeft < 60 && {backgroundColor: '#D32F2F'}]}>
            <MaterialCommunityIcons name="timer-sand" size={14} color="#FFF" />
            <Text style={styles.timerText}>Idle in: {formatTime(secondsLeft)}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Uploads</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statBox, { borderRightWidth: 0 }]}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>Online</Text>
            <Text style={styles.statLabel}>Network</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Forensic Modules</Text>
        
        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Upload')}>
            <View style={[styles.iconContainer, { backgroundColor: '#0B2D5215' }]}>
              <MaterialCommunityIcons name="camera-plus" size={30} color="#0B2D52" />
            </View>
            <Text style={styles.cardTitle}>Evidence Upload</Text>
            <Text style={styles.cardDesc}>Secure capture & hash</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('History')}>
            <View style={[styles.iconContainer, { backgroundColor: '#0B2D5215' }]}>
              <MaterialCommunityIcons name="folder-text-outline" size={30} color="#0B2D52" />
            </View>
            <Text style={styles.cardTitle}>Case History</Text>
            <Text style={styles.cardDesc}>Audit verified logs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusPanel}>
          <Text style={styles.statusText}>Blockchain Integrity: 99.9%</Text>
          <Text style={styles.nodeText}>System active. Interaction resets idle timer.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  header: { backgroundColor: '#0B2D52', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', borderBottomRightRadius: 25 },
  headerRight: { alignItems: 'flex-end' },
  welcomeText: { color: '#D1D1D1', fontSize: 12 },
  nameText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginBottom: 8 },
  timerText: { color: '#FFF', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 10 },
  scrollContent: { padding: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 25, elevation: 2 },
  statBox: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#EEE' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0B2D52' },
  statLabel: { fontSize: 10, color: '#999', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: (width - 55) / 2, padding: 15, borderRadius: 18, marginBottom: 15, elevation: 3 },
  iconContainer: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0B2D52' },
  cardDesc: { fontSize: 11, color: '#777', marginTop: 4 },
  statusPanel: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginTop: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  statusText: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  nodeText: { fontSize: 11, color: '#999', marginTop: 4 }
});