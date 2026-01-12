import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens from your folder structure
import LoginScreen from '../screens/auth/LoginScreen';
import FinalizeUpload from '../screens/upload/UploadScreen';
import QRScanScreen from '../screens/verify/QRScanScreen';
import AuditLogScreen from '../screens/audit/AuditLogScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Module 1: Identity Portal */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Identity Portal', headerShown: false }} 
      />

      {/* Module 2: Secure Evidence Wizard */}
      <Stack.Screen 
        name="Upload" 
        component={FinalizeUpload} 
        options={{ title: 'Secure Wizard' }} 
      />

      {/* Module 3: Verification Gate */}
      <Stack.Screen 
        name="Verify" 
        component={QRScanScreen} 
        options={{ title: 'Verification Gate' }} 
      />

      {/* Module 4: Admin Audit Logs */}
      <Stack.Screen 
        name="Audit" 
        component={AuditLogScreen} 
        options={{ title: 'System Logs' }} 
      />
    </Stack.Navigator>
  );
}

