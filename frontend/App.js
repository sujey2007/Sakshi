import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';

// Import Context & Screens
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen'; 
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import TeamManagementScreen from './src/screens/teams/TeamManagementScreen';
import UploadScreen from './src/screens/upload/UploadScreen';

// --- AI SCREENS ---
import LegalChatbot from './src/screens/ai/LegalChatbot'; 
import ForensicNarrator from './src/screens/ai/ForensicNarrator'; 

const Stack = createStackNavigator();

function Navigation() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' }}>
        <ActivityIndicator size="large" color="#1B365D" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // 2. LOGGED IN STACK
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="TeamManagement" component={TeamManagementScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          
          {/* AI Features */}
          <Stack.Screen name="LegalChatbot" component={LegalChatbot} />
          <Stack.Screen name="ForensicNarrator" component={ForensicNarrator} />
        </>
      ) : (
        // 3. AUTH STACK
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}