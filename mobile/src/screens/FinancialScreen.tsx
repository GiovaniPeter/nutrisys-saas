import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';

export default function FinancialScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFinancial = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get('/financial/transactions');
      const data = Array.isArray(response.data) ? response.data : response.data.transactions || response.data.data || [];

      let totalIncome = 0;
      let totalExpense = 0;

      data.forEach((trx: any) => {
        const amount = Number(trx.amount) || 0;
        if (trx.type === 'INCOME') totalIncome += amount;
        if (trx.type === 'EXPENSE') totalExpense += amount;
      });

      setTransactions(data);
      setSummary({ income: totalIncome, expense: totalExpense });
    } catch (error) {
      console.error('Erro ao buscar transações financeiras:', error);
      Alert.alert('Erro', 'Não foi possível carregar o resumo financeiro.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFinancial();
    }, [fetchFinancial])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinancial(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
      <View style={styles.overview}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Receitas no mês</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.income)}</Text>
        </View>
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryLabel}>Despesas no mês</Text>
          <Text style={[styles.summaryValue, styles.expenseValue]}>{formatCurrency(summary.expense)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Últimas Transações</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.transactionList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Sem transações recentes.</Text>}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionTitle}>{item.description || 'Transação'}</Text>
              <Text style={styles.transactionDate}>{new Date(item.date || item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              item.type === 'EXPENSE' && styles.expenseValue
            ]}>
              {item.type === 'EXPENSE' ? '- ' : '+ '}
              {formatCurrency(Number(item.amount) || 0)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#6b7280',
    fontSize: 16,
  },
  overview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderTopWidth: 4,
    borderColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseCard: {
    borderColor: '#ef4444',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  expenseValue: {
    color: '#ef4444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  transactionList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  transactionDate: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  }
});
