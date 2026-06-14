import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { api } from '../../services/api';
import { scheduleMealRemindersFromPlans } from '../../services/notifications';

export default function PortalMealPlansScreen({ navigation }: any) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Swap State
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [selectedFoodToSwap, setSelectedFoodToSwap] = useState<any>(null);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [loadingSubstitutes, setLoadingSubstitutes] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await api.get('/portal/meal-plans');
        const data = Array.isArray(response.data) ? response.data : response.data.mealPlans || [];
        setPlans(data);
        scheduleMealRemindersFromPlans(data).catch(() => undefined);
      } catch (error) {
        console.error('Erro ao buscar planos alimentares:', error);
        Alert.alert('Erro', 'Não foi possível carregar os planos alimentares.');
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleOpenSwap = async (planId: string, mealIdx: number, foodIdx: number, food: any) => {
    setSelectedFoodToSwap({ planId, mealIdx, foodIdx, ...food });
    setSwapModalVisible(true);
    setLoadingSubstitutes(true);
    try {
      const response = await api.get('/foods/substitutes', {
        params: { foodName: food.foodName, targetCalories: food.calories }
      });
      if (response.data?.success) {
        setSubstitutes(response.data.substitutes);
      } else {
        setSubstitutes([]);
      }
    } catch (error) {
      console.error('Erro ao buscar substitutos:', error);
      Alert.alert('Erro', 'Não foi possível encontrar substitutos.');
      setSubstitutes([]);
    } finally {
      setLoadingSubstitutes(false);
    }
  };

  const confirmSwap = (substitute: any) => {
    if (!selectedFoodToSwap) return;

    const { planId, mealIdx, foodIdx } = selectedFoodToSwap;

    // Atualização Otimista no App
    setPlans(prevPlans => {
      const newPlans = [...prevPlans];
      const planIndex = newPlans.findIndex(p => p.id === planId);
      if (planIndex === -1) return prevPlans;

      const plan = { ...newPlans[planIndex] };
      const meals = [...plan.meals];
      const items = [...meals[mealIdx].items];

      // Ajustar a quantidade
      const newQuantity = (parseFloat(substitute.basePortion.replace(/[^0-9.]/g, '') || '1') * parseFloat(substitute.suggestedMultiplier)).toFixed(1);
      const unit = substitute.basePortion.replace(/[0-9.]/g, '').trim() || 'unidade(s)';

      items[foodIdx] = {
        ...items[foodIdx],
        foodName: substitute.name,
        quantity: newQuantity,
        portion: unit,
        // Mantemos calorias originais porque a matemática bate
      };

      meals[mealIdx].items = items;
      plan.meals = meals;
      newPlans[planIndex] = plan;

      return newPlans;
    });

    setSwapModalVisible(false);
    setSelectedFoodToSwap(null);
  };

  const generateAndSharePDF = async (plan: any) => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #1f2937; }
              h1 { color: #10b981; }
              .meal { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #10b981; }
              .meal-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; color: #374151; }
              .food-item { margin-left: 10px; font-size: 16px; margin-bottom: 5px; }
            </style>
          </head>
          <body>
            <h1>${plan.name}</h1>
            <p>Gerado em: ${new Date(plan.createdAt || new Date()).toLocaleDateString()}</p>
            ${plan.meals?.map((meal: any) => `
              <div class="meal">
                <div class="meal-title">${meal.label} ${meal.time ? `- ${meal.time}` : ''}</div>
                ${meal.items?.map((food: any) => `
                  <div class="food-item">• ${food.quantity} ${food.portion} de ${food.foodName}</div>
                `).join('')}
              </div>
            `).join('')}
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Falha ao gerar o PDF da dieta.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum plano alimentar disponível.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="food-apple" size={24} color="#10b981" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.createdAt && (
                    <Text style={styles.dateText}>Gerado em: {new Date(item.createdAt).toLocaleDateString()}</Text>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity onPress={() => navigation.navigate('PortalShoppingList', { plan: item })}>
                  <MaterialCommunityIcons name="cart-outline" size={26} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => generateAndSharePDF(item)}>
                  <MaterialCommunityIcons name="share-variant" size={24} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>

            {item.meals && item.meals.map((meal: any, mIdx: number) => (
               <View key={mIdx} style={styles.mealBox}>
                 <Text style={styles.mealName}>{meal.label} {meal.time ? `- ${meal.time}` : ''}</Text>
                 {meal.items && meal.items.map((food: any, fIdx: number) => (
                   <View key={fIdx} style={styles.foodRow}>
                     <Text style={styles.foodItem}>
                       • {food.quantity} {food.portion} de {food.foodName}
                     </Text>
                     <TouchableOpacity onPress={() => handleOpenSwap(item.id, mIdx, fIdx, food)} style={styles.swapButton}>
                       <MaterialCommunityIcons name="swap-horizontal" size={20} color="#f59e0b" />
                     </TouchableOpacity>
                   </View>
                 ))}
               </View>
            ))}
          </View>
        )}
      />

      {/* Modal de Substituição */}
      <Modal visible={swapModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Substituir {selectedFoodToSwap?.foodName}</Text>
              <TouchableOpacity onPress={() => setSwapModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {loadingSubstitutes ? (
              <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 32 }} />
            ) : substitutes.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum substituto encontrado na mesma categoria.</Text>
            ) : (
              <ScrollView style={styles.substitutesList}>
                {substitutes.map(sub => (
                  <TouchableOpacity key={sub.id} style={styles.substituteCard} onPress={() => confirmSwap(sub)}>
                    <Text style={styles.substituteName}>{sub.name}</Text>
                    <Text style={styles.substituteDetails}>
                      Sugerido: {(parseFloat(sub.basePortion.replace(/[^0-9.]/g, '') || '1') * parseFloat(sub.suggestedMultiplier)).toFixed(1)} {sub.basePortion.replace(/[0-9.]/g, '').trim()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 64 },
  emptyText: { textAlign: 'center', marginTop: 16, color: '#6b7280', fontSize: 16 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  dateText: { fontSize: 14, color: '#6b7280' },
  mealBox: { marginTop: 8, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8 },
  mealName: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 6 },
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  foodItem: { fontSize: 14, color: '#4b5563', flex: 1 },
  swapButton: { padding: 4, backgroundColor: '#fef3c7', borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  substitutesList: { marginTop: 8 },
  substituteCard: { padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  substituteName: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },
  substituteDetails: { fontSize: 14, color: '#4b5563', marginTop: 4 }
});
