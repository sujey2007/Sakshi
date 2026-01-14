import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GEMINI_API_KEY } from '@env'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LegalChatbot() {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello. I am Sakshi, your legal forensic assistant. How can I help you analyze your case data today?',
      sender: 'ai', 
      timestamp: new Date(),
    },
  ]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Calling Gemini API with the corrected model version
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { 
                    text: `You are Sakshi, an AI legal assistant for Indian forensic officers. Answer concisely and professionally based on Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS). Question: ${inputText}` 
                  }
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Network response was not ok');
      }

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      Alert.alert("Error", "Failed to connect to AI Assistant.");
      
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: "System Error: Unable to reach legal database. Please check your API key.",
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to end whenever messages update
  useEffect(() => {
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered Professional Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Sakshi AI Assistant</Text>
            <Text style={styles.headerSubtitle}>Legal & Forensic Intelligence</Text>
        </View>
        <View style={{width: 40}} /> 
      </View>

      {/* Natural Scrolling Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag" // Keyboard dismisses on scroll for better UX
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={true}
      />

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Search BNS/BNSS statutes..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: '#1B365D', 
    paddingTop: Platform.OS === 'android' ? 45 : 12,
    elevation: 4,
  },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 10, color: '#BDC3C7', fontWeight: 'bold', letterSpacing: 1 },
  backButton: { width: 40 },
  chatContainer: { padding: 16, paddingBottom: 30 },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 18, marginBottom: 12 },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#1B365D', 
    borderBottomRightRadius: 4,
    elevation: 2 
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    elevation: 1 
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#1E293B' },
  inputContainer: {
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 25 : 12
  },
  input: {
    flex: 1, 
    backgroundColor: '#F1F5F9', 
    borderRadius: 25, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    marginRight: 10, 
    fontSize: 15, 
    color: '#334155', 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
  },
  sendButton: { 
    backgroundColor: '#1B365D', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sendButtonDisabled: { backgroundColor: '#94A3B8' },
});