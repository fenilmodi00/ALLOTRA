import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, Button, TextInput, ActivityIndicator, FAB, Portal, Dialog } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IPO } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

// Define validation schema using zod
const ipoZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  priceRange: z.string(),
  lotSize: z.number(),
  minLots: z.number(),
  maxLots: z.number(),
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date()]),
  status: z.enum(['upcoming', 'active', 'closed']),
  allotmentDate: z.union([z.string(), z.date()]).optional(),
  listingDate: z.union([z.string(), z.date()]).optional(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});
const ipoArraySchema = z.array(ipoZodSchema);

type IpoFormData = z.infer<typeof ipoZodSchema>;

export default function AdminPanelScreen() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingIpo, setEditingIpo] = useState<IPO | null>(null);
  const theme = useAppTheme();
  const { state } = useAuth();
  const { user } = state;
  const navigation = useNavigation();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<IpoFormData>({
    resolver: zodResolver(ipoZodSchema),
    defaultValues: {
      name: '',
      symbol: '',
      priceRange: '',
      lotSize: 1,
      minLots: 1,
      maxLots: 10,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  // Check if user is admin, if not, redirect to Dashboard
  useEffect(() => {
    if (!user?.isAdmin) {
      Alert.alert('Access Denied', 'You do not have permission to access this page.');
      navigation.goBack();
    }
  }, [user, navigation]);

  const fetchIpos = async () => {
    try {
      const response = await api.ipos.getAll();
      const iposData = ipoArraySchema.parse((response as any).data).map(ipo => ({
        ...ipo,
        startDate: new Date(ipo.startDate),
        endDate: new Date(ipo.endDate),
        createdAt: new Date(ipo.createdAt),
        updatedAt: new Date(ipo.updatedAt),
        allotmentDate: ipo.allotmentDate ? new Date(ipo.allotmentDate) : undefined,
        listingDate: ipo.listingDate ? new Date(ipo.listingDate) : undefined,
      } as IPO));
      setIpos(iposData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch IPOs. Please try again.');
      console.error('Error fetching IPOs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpos();
  }, []);

  const showDialog = (ipo?: IPO) => {
    if (ipo) {
      setEditingIpo(ipo);
      setValue('name', ipo.name);
      setValue('symbol', ipo.symbol);
      setValue('priceRange', ipo.priceRange);
      setValue('lotSize', ipo.lotSize);
      setValue('minLots', ipo.minLots);
      setValue('maxLots', ipo.maxLots);
      setValue('startDate', new Date(ipo.startDate).toISOString().split('T')[0]);
      setValue('endDate', new Date(ipo.endDate).toISOString().split('T')[0]);
    } else {
      setEditingIpo(null);
      reset();
    }
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const onSubmit = async (data: IpoFormData) => {
    setSubmitting(true);
    try {
      if (editingIpo) {
        // Update existing IPO
        await api.put(`/ipos/${editingIpo.id}`, data);
        setIpos(ipos.map(ipo =>
          ipo.id === editingIpo.id
            ? {
                ...ipo,
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                updatedAt: new Date(),
                allotmentDate: ipo.allotmentDate ? new Date(ipo.allotmentDate) : undefined,
                listingDate: ipo.listingDate ? new Date(ipo.listingDate) : undefined,
              } as IPO
            : ipo
        ));
      } else {
        // Create new IPO
        const response = await api.post('/ipos', data);
        const newIpo = ipoZodSchema.parse((response as any).data);
        setIpos([
          ...ipos,
          {
            ...newIpo,
            startDate: new Date(newIpo.startDate),
            endDate: new Date(newIpo.endDate),
            createdAt: new Date(newIpo.createdAt),
            updatedAt: new Date(newIpo.updatedAt),
            allotmentDate: newIpo.allotmentDate ? new Date(newIpo.allotmentDate) : undefined,
            listingDate: newIpo.listingDate ? new Date(newIpo.listingDate) : undefined,
          } as IPO,
        ]);
      }
      hideDialog();
      setError(null);
    } catch (err) {
      setError(`Failed to ${editingIpo ? 'update' : 'add'} IPO. Please try again.`);
      console.error(`Error ${editingIpo ? 'updating' : 'adding'} IPO:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteIpo = async (id: string) => {
    try {
      await api.delete(`/ipos/${id}`);
      setIpos(ipos.filter(ipo => ipo.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete IPO');
      console.error('Error deleting IPO:', err);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete IPO',
      'Are you sure you want to delete this IPO?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteIpo(id) },
      ]
    );
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
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <FlatList
        data={ipos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.name} ({item.symbol})</Text>
              <Text variant="bodyMedium">Price Range: {item.priceRange}</Text>
              <Text variant="bodyMedium">Lot Size: {item.lotSize} shares</Text>
              <View style={styles.dateContainer}>
                <Text variant="bodySmall">Opens: {new Date(item.startDate).toLocaleDateString()}</Text>
                <Text variant="bodySmall">Closes: {new Date(item.endDate).toLocaleDateString()}</Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => showDialog(item)}>Edit</Button>
              <Button onPress={() => confirmDelete(item.id)} textColor={theme.colors.error}>
                Delete
              </Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No IPOs added yet. Click the + button to add one.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => showDialog()}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>{editingIpo ? 'Edit IPO' : 'Add IPO'}</Dialog.Title>
          <Dialog.Content>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="IPO Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.name}
                  style={styles.input}
                />
              )}
            />
            {errors.name && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.name.message}
              </Text>
            )}

            <Controller
              control={control}
              name="symbol"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Symbol"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.symbol}
                  style={styles.input}
                />
              )}
            />
            {errors.symbol && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.symbol.message}
              </Text>
            )}

            <Controller
              control={control}
              name="priceRange"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Price Range (e.g. ₹900-₹950)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.priceRange}
                  style={styles.input}
                />
              )}
            />
            {errors.priceRange && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.priceRange.message}
              </Text>
            )}

            <Controller
              control={control}
              name="lotSize"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Lot Size"
                  value={value.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  onBlur={onBlur}
                  error={!!errors.lotSize}
                  style={styles.input}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.lotSize && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.lotSize.message}
              </Text>
            )}

            <Controller
              control={control}
              name="minLots"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Minimum Lots"
                  value={value.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  onBlur={onBlur}
                  error={!!errors.minLots}
                  style={styles.input}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.minLots && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.minLots.message}
              </Text>
            )}

            <Controller
              control={control}
              name="maxLots"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Maximum Lots"
                  value={value.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  onBlur={onBlur}
                  error={!!errors.maxLots}
                  style={styles.input}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.maxLots && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.maxLots.message}
              </Text>
            )}

            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Start Date (YYYY-MM-DD)"
                  value={typeof value === 'string' ? value : value instanceof Date ? value.toISOString().split('T')[0] : ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.startDate}
                  style={styles.input}
                />
              )}
            />
            {errors.startDate && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.startDate.message}
              </Text>
            )}

            <Controller
              control={control}
              name="endDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="End Date (YYYY-MM-DD)"
                  value={typeof value === 'string' ? value : value instanceof Date ? value.toISOString().split('T')[0] : ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.endDate}
                  style={styles.input}
                />
              )}
            />
            {errors.endDate && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.endDate.message}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting}>
              {editingIpo ? 'Update' : 'Add'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  card: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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