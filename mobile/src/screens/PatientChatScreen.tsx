import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export default function PatientChatScreen({ route }: any) {
  const { patient } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const userStr = await AsyncStorage.getItem('@NutriPlan:user');
      if (userStr) setCurrentUser(JSON.parse(userStr));
      fetchMessages();
    }
    init();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat?patientId=${patient.id}`);
      const data = Array.isArray(response.data) ? response.data : response.data.messages || response.data.data || [];
      // Ordena pelas mensagens mais antigas até as mais recentes
      const sorted = data.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(sorted);
    } catch (error) {
      console.error('Erro ao buscar chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Opcional: Otimizar mostrando mensagem na tela instantamene (UI otimista)
    const newMsgObj = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'PROFESSIONAL',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsgObj]);
    setInputText('');

    try {
      await api.post('/chat', {
        patientId: patient.id,
        text: newMsgObj.text
      });
      // Em apps reais, poderiamos re-fechar a list atualizada
      // fetchMessages();
    } catch (error) {
      console.error('Erro ao enviar msg:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const renderBubble = ({ item }: { item: any }) => {
    const isProf = item.sender === 'PROFESSIONAL';
    return (
      <View style={[styles.messageRow, isProf ? styles.messageRowProf : styles.messageRowPatient]}>
        <View style={[styles.bubble, isProf ? styles.bubbleProf : styles.bubblePatient]}>
          <Text style={[styles.messageText, isProf && { color: '#fff' }]}>{item.text}</Text>
          <Text style={[styles.messageTime, isProf && { color: '#e0f2fe' }]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderBubble}
        // Auto scroll to bottom
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Inicie uma conversa com {patient.name?.split(' ')[0] || 'o paciente'}</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escreva sua mensagem..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <MaterialCommunityIcons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 32 },
  emptyText: { color: '#6b7280' },
  list: { padding: 16 },
  messageRow: { flexDirection: 'row', marginBottom: 12 },
  messageRowProf: { justifyContent: 'flex-end' },
  messageRowPatient: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleProf: { backgroundColor: '#3b82f6', borderBottomRightRadius: 4 },
  bubblePatient: { backgroundColor: '#e5e7eb', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, color: '#1f2937' },
  messageTime: { fontSize: 11, color: '#9ca3af', alignSelf: 'flex-end', marginTop: 4 },

  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#10b981',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  }
});
