import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';

// --- IMPORT ALL SCREENS ---
import LoginScreen from './src/screens/auth/LoginScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen'; 
import AuditScreen from './src/screens/LogAudit/AuditScreen'; 
import CaseDiaryScreen from './src/screens/caseDiary/CaseDiaryScreen';
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
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#1B365D' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
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

          {/* ADMIN DASHBOARD */}
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboardScreen} 
            options={{ headerShown: false }} 
          />

          {/* SYSTEM TRACKER: AUDIT TRAIL */}
          <Stack.Screen 
            name="Audit" 
            component={AuditScreen} 
            options={{ headerShown: false }} 
          />
          
          <Stack.Screen 
            name="CaseDiary" 
            component={CaseDiaryScreen} 
            options={{ headerShown: false }} 
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