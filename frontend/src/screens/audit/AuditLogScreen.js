import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LOG_DATA = [
  { id: '1', officer: 'Officer fdv', action: 'Blockchain Seal', time: '8:20 AM', status: 'SUCCESS' },
  { id: '2', officer: 'Officer fdv', action: 'Identity Established', time: '8:15 AM', status: 'VERIFIED' },
];

export default function AuditLogScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#6200ee" />
        </TouchableOpacity>
        <Text style={[styles.header, { marginBottom: 0 }]}>System Audit Logs</Text>
      </View>
      <FlatList
        data={LOG_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.logAction}>{item.action}</Text>
            <Text style={styles.logDetail}>User: {item.officer} | {item.time}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'SUCCESS' ? '#4CAF50' : '#2196F3' }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#6200ee' },
  logCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 },
  logAction: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  logDetail: { fontSize: 14, color: '#666', marginVertical: 5 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});