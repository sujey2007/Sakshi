import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function QRScanScreen({ navigation }) {
  const [isScanning, setIsScanning] = useState(true);

  const simulateScan = () => {
    setIsScanning(false);
    Alert.alert(
      "QR Code Verified",
      "Evidence Hash: 0x88f...c91\nStatus: Tamper-proof\nAction: Access Granted.",
      [{ text: "View Details", onPress: () => navigation.navigate('Audit') }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verification Gate</Text>
      <View style={styles.scannerBox}>
        <View style={styles.frame} />
        {isScanning && <Text style={styles.scanningText}>SCANNING...</Text>}
      </View>
      <TouchableOpacity style={styles.button} onPress={simulateScan}>
        <Text style={styles.buttonText}>SIMULATE QR SCAN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 40 },
  scannerBox: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#03dac6', borderRadius: 20 },
  frame: { width: 200, height: 200, backgroundColor: 'rgba(3, 218, 198, 0.1)', borderRadius: 10 },
  scanningText: { color: '#03dac6', marginTop: 10, fontWeight: 'bold' },
  button: { marginTop: 40, backgroundColor: '#6200ee', padding: 15, borderRadius: 10, width: '70%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});
