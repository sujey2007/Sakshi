import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';

// --- IMPORT ALL SCREENS (Restored Paths) ---
import LoginScreen from './src/screens/auth/LoginScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import AuditScreen from './src/screens/LogAudit/AuditScreen'; 
import LegalChatbot from './src/screens/ai/LegalChatbot';
import ForensicNarrator from './src/screens/ai/ForensicNarrator';
import TeamManagementScreen from './src/screens/teams/TeamManagementScreen';
import UploadScreen from './src/screens/upload/UploadScreen';
import QRScanScreen from './src/screens/verify/QRScanScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        {/* Using a persistent stack to prevent accidental resets to Login */}
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#1B365D' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            // Disable gestures to prevent accidental "swipe back" to login
            gestureEnabled: false 
          }}
        >
          {/* AUTHENTICATION */}
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />

          {/* MAIN DASHBOARD */}
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ headerShown: false }} 
          />

          {/* SYSTEM TRACKER: AUDIT TRAIL */}
          <Stack.Screen 
            name="Audit" 
            component={AuditScreen} 
            options={{ 
              headerShown: false, // Uses custom header in AuditScreen.js
            }} 
          />

          {/* FORENSIC INTELLIGENCE: AI TOOLS */}
          <Stack.Screen 
            name="LegalChatbot" 
            component={LegalChatbot} 
            options={{ headerShown: false }} 
          />

          <Stack.Screen 
            name="ForensicNarrator" 
            component={ForensicNarrator} 
            options={{ title: 'Forensic Narrator' }} 
          />

          {/* FIELD OPERATIONS & VERIFICATION */}
          <Stack.Screen 
            name="TeamManagement" 
            component={TeamManagementScreen} 
            options={{ title: 'Team Management' }} 
          />

          <Stack.Screen 
            name="Upload" 
            component={UploadScreen} 
            options={{ title: 'Evidence Upload' }} 
          />

          <Stack.Screen 
            name="QRScan" 
            component={QRScanScreen} 
            options={{ title: 'Verify Evidence' }} 
          />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}