import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AuditScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('@sakshi_audit_trail');
      if (storedData) {
        setLogs(JSON.parse(storedData));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.actionTitle}>{item.what}</Text>
        <Text style={styles.dateText}>{item.when}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.logText}><Text style={styles.bold}>OFFICER:</Text> {item.who}</Text>
        <Text style={styles.logText}><Text style={styles.bold}>DETAIL:</Text> {item.why}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.hashText}>{item.hash}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F7FA' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><MaterialCommunityIcons name="arrow-left" size={26} color="white" /></TouchableOpacity>
          <Text style={styles.headerTitle}>SAKSHI AUDIT</Text>
          <TouchableOpacity onPress={fetchLogs}><MaterialCommunityIcons name="refresh" size={24} color="white" /></TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator size="large" color="#1B365D" style={{ marginTop: 50 }} /> : (
          <FlatList 
            data={logs} 
            renderItem={renderItem} 
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1B365D', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, borderLeftWidth: 6, borderLeftColor: '#1B365D', elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  actionTitle: { fontWeight: 'bold', color: '#1B365D', fontSize: 12 },
  dateText: { fontSize: 10, color: '#94A3B8' },
  logText: { fontSize: 13, marginBottom: 4 },
  bold: { fontWeight: 'bold', color: '#64748B' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 8 },
  hashText: { fontSize: 10, color: '#94A3B8' },
  status: { color: '#27AE60', fontWeight: 'bold', fontSize: 11 }
});