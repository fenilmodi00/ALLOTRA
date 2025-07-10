import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { IPO } from '../../types';
import api from '../../services/api';

export default function DashboardScreen() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useAppTheme();

  const fetchIpos = async () => {
    try {
      const response = await api.ipos.getAll();
      // TypeScript fix: explicitly type the response data
      const ipoData = response.data as IPO[];
      setIpos(ipoData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch IPOs. Please try again later.');
      console.error('Error fetching IPOs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIpos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIpos();
  };

  const checkAllotment = async (ipoId: string) => {
    try {
      // This will be implemented to check allotment status for all user's PAN cards
      await api.allotments.check(ipoId);
      // After checking, we could navigate to results screen or show a success message
    } catch (err) {
      console.error('Error checking allotment:', err);
      // Show error message
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Available IPOs
      </Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
          <Button mode="contained" onPress={fetchIpos} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={ipos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge">{item.name}</Text>
                <Text variant="bodyMedium">Symbol: {item.symbol}</Text>
                <View style={styles.dateContainer}>
                  <Text variant="bodySmall">Opens: {new Date(item.startDate).toLocaleDateString()}</Text>
                  <Text variant="bodySmall">Closes: {new Date(item.endDate).toLocaleDateString()}</Text>
                </View>
                <Text variant="bodyMedium">Price Range: {item.priceRange}</Text>
                <Text variant="bodyMedium">Lot Size: {item.lotSize} shares</Text>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained" 
                  onPress={() => checkAllotment(item.id)}
                >
                  Check Status
                </Button>
              </Card.Actions>
            </Card>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>No IPOs available at the moment.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    flexGrow: 1,
  },
}); 