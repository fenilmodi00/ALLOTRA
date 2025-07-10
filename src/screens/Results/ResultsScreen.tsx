import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Divider, SegmentedButtons } from 'react-native-paper';
import { AllotmentStatus, IPO, PanCard } from '../../types';
import { useAppTheme } from '../../theme';
import api from '../../services/api';

interface AllotmentResult extends AllotmentStatus {
  ipo: IPO;
  panCard: PanCard;
}

export default function ResultsScreen() {
  const [results, setResults] = useState<AllotmentResult[]>([]);
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIpoId, setSelectedIpoId] = useState<string | null>(null);
  const theme = useAppTheme();

  const fetchResults = async () => {
    try {
      // Fetch all results with IPO and PAN details
      const response = await api.allotments.getAll();
      setResults(response.data);

      // Fetch all IPOs for the filter
      const iposResponse = await api.ipos.getAll();
      setIpos(iposResponse.data);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch results. Please try again later.');
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  const filteredResults = selectedIpoId 
    ? results.filter(result => result.ipoId === selectedIpoId)
    : results;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allotted':
        return theme.colors.primary;
      case 'not_allotted':
        return theme.colors.error;
      default:
        return theme.colors.secondary;
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
        IPO Allotment Results
      </Text>

      {ipos.length > 0 && (
        <View style={styles.filterContainer}>
          <Text variant="bodyMedium" style={styles.filterLabel}>Filter by IPO:</Text>
          <SegmentedButtons
            value={selectedIpoId || 'all'}
            onValueChange={(value) => setSelectedIpoId(value === 'all' ? null : value)}
            buttons={[
              { value: 'all', label: 'All' },
              ...ipos.map(ipo => ({ value: ipo.id, label: ipo.name }))
            ]}
            style={styles.segmentedButtons}
          />
        </View>
      )}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{item.ipo.name}</Text>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium">PAN: </Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {item.panCard.name} ({item.panCard.panNumber})
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium">Status: </Text>
                  <Chip 
                    textStyle={{ color: '#fff' }}
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status === 'allotted' ? 'Allotted' : item.status === 'not_allotted' ? 'Not Allotted' : 'Pending'}
                  </Chip>
                </View>
                {item.status === 'allotted' && (
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium">Shares Allotted: </Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>
                      {item.allottedLots * item.ipo.lotSize}
                    </Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium">Applied Lots: </Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {item.appliedLots}
                  </Text>
                </View>
                {item.checkedDate && (
                  <Text variant="bodySmall" style={styles.timestamp}>
                    Checked on: {new Date(item.checkedDate).toLocaleString()}
                  </Text>
                )}
              </Card.Content>
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
              <Text>No results available.</Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Check IPO allotment status from the Dashboard tab.
              </Text>
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
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  card: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailValue: {
    fontWeight: 'bold',
  },
  timestamp: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
}); 