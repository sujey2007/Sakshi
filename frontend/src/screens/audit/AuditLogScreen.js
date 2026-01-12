import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const LOG_DATA = [
  { id: '1', officer: 'Officer fdv', action: 'Blockchain Seal', time: '8:20 AM', status: 'SUCCESS' },
  { id: '2', officer: 'Officer fdv', action: 'Identity Established', time: '8:15 AM', status: 'VERIFIED' },
];

export default function AuditLogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>System Audit Logs</Text>
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
  header: { fontSize: 26, fontWeight: 'bold', color: '#6200ee', marginBottom: 20 },
  logCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 },
  logAction: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  logDetail: { fontSize: 14, color: '#666', marginVertical: 5 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});
