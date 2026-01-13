import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GEMINI_API_KEY } from '@env'; // Import the key securely

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

    // 1. Add User Message immediately
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
      // 2. Call Gemini API
      // FIX APPLIED HERE: Added '/' after models and switched to 'gemini-1.5-flash' for better limits
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

      // 3. Extract AI Reply
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
      
      // Optional: Add an error message to chat
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: "System Error: Unable to reach legal database.",
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Text style={{color: '#fff', fontSize: 24}}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sakshi AI Assistant</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
            placeholder="Type your legal query..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sendButtonText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#1B365D', paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backButton: { padding: 8 },
  chatContainer: { padding: 16, paddingBottom: 20 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1B365D', borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#E1E4E8' },
  messageText: { fontSize: 15 },
  userText: { color: '#fff' },
  aiText: { color: '#333' },
  inputContainer: {
    flexDirection: 'row', padding: 12, backgroundColor: '#fff', 
    borderTopWidth: 1, borderTopColor: '#E1E4E8', alignItems: 'center',
  },
  input: {
    flex: 1, backgroundColor: '#F8F9FA', borderRadius: 20, paddingHorizontal: 16, 
    paddingVertical: 10, marginRight: 10, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#E1E4E8',
  },
  sendButton: { backgroundColor: '#1B365D', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  sendButtonDisabled: { backgroundColor: '#A0A0A0' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});