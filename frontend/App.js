import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';

// Import Context & Screens
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen'; // Ensure this path is correct
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import TeamManagementScreen from './src/screens/teams/TeamManagementScreen';
import UploadScreen from './src/screens/upload/UploadScreen';

const Stack = createStackNavigator();

function Navigation() {
  const { user, isLoading } = useContext(AuthContext);

  // 1. Show a loading spinner while checking for a saved session
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
        // 2. LOGGED IN STACK (User is present)
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="TeamManagement" component={TeamManagementScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
        </>
      ) : (
        // 3. AUTH STACK (No user present)
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