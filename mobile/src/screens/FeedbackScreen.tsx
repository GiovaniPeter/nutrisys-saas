import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';

type FeedbackType = 'FEATURE' | 'BUG';

export default function FeedbackScreen({ navigation }: any) {
  const [type, setType] = useState<FeedbackType>('FEATURE');
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (title.trim().length < 5) {
      Alert.alert('Título curto', 'Informe um título com pelo menos 5 caracteres.');
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert('Descrição curta', 'Descreva sua solicitação com pelo menos 20 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/feedback', {
        type,
        title: title.trim(),
        area: area.trim() || undefined,
        description: description.trim(),
        stepsToReproduce: type === 'BUG' ? stepsToReproduce.trim() : undefined,
        expectedResult: type === 'BUG' ? expectedResult.trim() : undefined,
        userAgent: `ClinOS Mobile App (${Platform.OS} ${Platform.Version})`,
      });

      const requestId = response.data?.requestId;
      const protocolStr = requestId ? `\nProtocolo: ${requestId.slice(0, 8)}` : '';

      Alert.alert(
        'Solicitação enviada',
        `Recebemos sua mensagem! Obrigado por ajudar a melhorar o ClinOS.${protocolStr}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      const msg = data?.error || data?.message || error.message || 'Não foi possível enviar sua solicitação.';
      Alert.alert(status ? `Erro (${status})` : 'Erro ao enviar', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Sugestões e Bugs</Text>
        <Text style={styles.subheading}>
          Conte o que facilitaria sua rotina ou informe um problema encontrado no ClinOS.
        </Text>

        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeCard, type === 'FEATURE' && styles.typeCardActiveFeature]}
            onPress={() => setType('FEATURE')}
          >
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={24}
              color={type === 'FEATURE' ? '#10b981' : '#6b7280'}
            />
            <Text style={[styles.typeTitle, type === 'FEATURE' && styles.typeTitleActiveFeature]}>
              Solicitar função
            </Text>
            <Text style={styles.typeSub}>Sugerir melhoria ou nova ferramenta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeCard, type === 'BUG' && styles.typeCardActiveBug]}
            onPress={() => setType('BUG')}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color={type === 'BUG' ? '#ef4444' : '#6b7280'}
            />
            <Text style={[styles.typeTitle, type === 'BUG' && styles.typeTitleActiveBug]}>
              Reportar bug
            </Text>
            <Text style={styles.typeSub}>Informar falha ou comportamento incorreto</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder={type === 'FEATURE' ? 'Ex.: Lembrete de retorno no WhatsApp' : 'Ex.: Erro ao salvar consulta'}
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />

        <Text style={styles.label}>Área do sistema (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Agenda, Pacientes, Dieta, Financeiro..."
          placeholderTextColor="#9ca3af"
          value={area}
          onChangeText={setArea}
          maxLength={120}
        />

        <Text style={styles.label}>
          {type === 'FEATURE' ? 'Como essa função ajudaria você? *' : 'O que aconteceu? *'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={
            type === 'FEATURE'
              ? 'Descreva a necessidade, quem usaria e qual o resultado esperado (mínimo 20 caracteres)...'
              : 'Descreva detalhadamente o problema (mínimo 20 caracteres)...'
          }
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={4000}
        />

        {type === 'BUG' ? (
          <>
            <Text style={styles.label}>Passos para reproduzir (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textAreaSmall]}
              placeholder="1. Abri a tela...\n2. Cliquei no botão...\n3. O erro ocorreu..."
              placeholderTextColor="#9ca3af"
              value={stepsToReproduce}
              onChangeText={setStepsToReproduce}
              multiline
              numberOfLines={3}
              maxLength={2000}
            />

            <Text style={styles.label}>O que deveria acontecer? (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textAreaSmall]}
              placeholder="Conte qual era o resultado esperado."
              placeholderTextColor="#9ca3af"
              value={expectedResult}
              onChangeText={setExpectedResult}
              multiline
              numberOfLines={2}
              maxLength={1000}
            />
          </>
        ) : null}

        <View style={styles.privacyNoteBox}>
          <MaterialCommunityIcons name="shield-outline" size={18} color="#6b7280" />
          <Text style={styles.privacyNoteText}>
            Não inclua nomes, exames ou dados confidenciais de pacientes nas mensagens.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {type === 'FEATURE' ? 'Enviar Sugestão' : 'Enviar Relatório de Bug'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    color: '#111827',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheading: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
    padding: 14,
  },
  typeCardActiveFeature: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  typeCardActiveBug: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  typeTitle: {
    color: '#374151',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  typeTitleActiveFeature: {
    color: '#047857',
  },
  typeTitleActiveBug: {
    color: '#b91c1c',
  },
  typeSub: {
    color: '#6b7280',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    padding: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    height: 75,
    textAlignVertical: 'top',
  },
  privacyNoteBox: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 12,
  },
  privacyNoteText: {
    color: '#6b7280',
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 8,
    marginTop: 24,
    padding: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
