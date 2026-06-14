import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function FoodsScreen() {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const searchFoods = async (text: string = '', isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get(`/foods?q=${text}&limit=50`);
      setFoods(Array.isArray(response.data.foods) ? response.data.foods : []);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de alimentos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    searchFoods('');
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    searchFoods(search, true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alimentos por nome..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => searchFoods(search)}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); searchFoods(''); }}>
             <MaterialCommunityIcons name="close-circle" size={24} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="food-apple" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Nenhum alimento encontrado para focar.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.portion}>
                  Ref: {item.portion} {item.householdMeasure ? `(${item.householdMeasure})` : ''}
                </Text>
              </View>

              <View style={styles.macrosRow}>
                 <View style={styles.macroBox}>
                   <Text style={[styles.macroLabel, { color: '#ef4444' }]}>Kcal</Text>
                   <Text style={styles.macroValue}>{Math.round(item.calories)}</Text>
                 </View>
                 <View style={styles.macroBox}>
                   <Text style={[styles.macroLabel, { color: '#3b82f6' }]}>Carb</Text>
                   <Text style={styles.macroValue}>{Math.round(item.carbs)}g</Text>
                 </View>
                 <View style={styles.macroBox}>
                   <Text style={[styles.macroLabel, { color: '#10b981' }]}>Prot</Text>
                   <Text style={styles.macroValue}>{Math.round(item.protein)}g</Text>
                 </View>
                 <View style={styles.macroBox}>
                   <Text style={[styles.macroLabel, { color: '#f59e0b' }]}>Gord</Text>
                   <Text style={styles.macroValue}>{Math.round(item.fat)}g</Text>
                 </View>
              </View>

              {item.source && (
                 <Text style={styles.sourceText}>Fonte: {item.source}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#1f2937' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyText: { color: '#6b7280', marginTop: 12, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardHeader: { marginBottom: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  portion: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 },
  macroBox: { alignItems: 'center' },
  macroLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  macroValue: { fontSize: 15, fontWeight: '600', color: '#374151' },
  sourceText: { fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'right' }
});