import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PortalShoppingListScreen({ route, navigation }: any) {
  const { plan } = route.params || {};
  const [days, setDays] = useState(7);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  // Algoritmo de agrupamento e soma
  const shoppingItems = useMemo(() => {
    if (!plan || !plan.meals) return [];

    const itemMap = new Map<string, { name: string, baseQuantity: number, portion: string, category: string }>();

    plan.meals.forEach((meal: any) => {
      meal.items?.forEach((food: any) => {
        // Remover números da porção para agrupar corretamente. Ex: "100g" -> "g", "1 unidade" -> "unidade"
        let portionStr = (food.portion || '').toLowerCase();
        let qty = parseFloat(food.quantity?.toString() || '0');

        // Se a porção tiver número junto, vamos tentar separar (ex: "100g")
        const portionMatch = portionStr.match(/^([\d.]+)\s*(.*)$/);
        if (portionMatch) {
          qty = qty * parseFloat(portionMatch[1]);
          portionStr = portionMatch[2];
        }

        portionStr = portionStr.trim() || 'unidade(s)';

        // Chave única baseada no nome do alimento e unidade de medida
        const key = `${food.foodName.toLowerCase().trim()}_${portionStr}`;

        if (itemMap.has(key)) {
          const existing = itemMap.get(key)!;
          existing.baseQuantity += qty;
        } else {
          itemMap.set(key, {
            name: food.foodName,
            baseQuantity: qty,
            portion: portionStr,
            category: meal.label // Só para ter alguma referência caso queiramos ordenar
          });
        }
      });
    });

    // Converter para array e ordenar alfabeticamente
    return Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [plan]);

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleShare = async () => {
    try {
      let text = `🛒 Lista de Compras para ${days} dias\nDieta: ${plan?.name}\n\n`;

      shoppingItems.forEach(item => {
        const totalQty = (item.baseQuantity * days).toFixed(1).replace(/\.0$/, '');
        text += `☐ ${totalQty} ${item.portion} de ${item.name}\n`;
      });

      await Share.share({
        message: text,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a lista.');
    }
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nenhum plano selecionado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Supermercado</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={24} color="#10b981" />
        </TouchableOpacity>
      </View>

      <View style={styles.daysFilterContainer}>
        <Text style={styles.daysLabel}>Multiplicar por:</Text>
        <View style={styles.daysButtons}>
          {[7, 15, 30].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.dayButton, days === d && styles.dayButtonActive]}
              onPress={() => setDays(d)}
            >
              <Text style={[styles.dayButtonText, days === d && styles.dayButtonTextActive]}>{d} dias</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={shoppingItems}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isChecked = !!checkedItems[index];
          const totalQty = (item.baseQuantity * days).toFixed(1).replace(/\.0$/, '');

          return (
            <TouchableOpacity
              style={[styles.itemCard, isChecked && styles.itemCardChecked]}
              onPress={() => toggleCheck(index)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={isChecked ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                size={24}
                color={isChecked ? "#10b981" : "#9ca3af"}
              />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, isChecked && styles.itemNameChecked]}>{item.name}</Text>
                <Text style={[styles.itemQty, isChecked && styles.itemQtyChecked]}>
                  {totalQty} {item.portion}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  shareButton: { padding: 4 },
  daysFilterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  daysLabel: { fontSize: 14, color: '#6b7280', marginBottom: 8, fontWeight: 'bold' },
  daysButtons: { flexDirection: 'row', gap: 8 },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  dayButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  dayButtonText: { color: '#4b5563', fontWeight: 'bold' },
  dayButtonTextActive: { color: '#fff' },
  list: { padding: 16 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemCardChecked: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  itemInfo: { marginLeft: 12, flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, color: '#1f2937', fontWeight: '500', flex: 1 },
  itemNameChecked: { color: '#6b7280', textDecorationLine: 'line-through' },
  itemQty: { fontSize: 15, color: '#10b981', fontWeight: 'bold' },
  itemQtyChecked: { color: '#9ca3af' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});
