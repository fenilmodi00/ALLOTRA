import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PanCard } from '../../types';
import SwipeableRow from '../../components/common/SwipeableRow';
import { useAppTheme } from '../../theme';
import api from '../../services/api';

// Define validation schema using zod
const panSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  panNumber: z.string()
    .min(10, 'PAN must be 10 characters')
    .max(10, 'PAN must be 10 characters')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
});

type PanFormData = z.infer<typeof panSchema>;

const panArraySchema = z.array(
  z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    panNumber: z.string(),
    isDefault: z.boolean(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
  })
);

export default function PanManagementScreen() {
  const [pans, setPans] = useState<PanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useAppTheme();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PanFormData>({
    resolver: zodResolver(panSchema),
    defaultValues: {
      name: '',
      panNumber: '',
    },
  });

  const fetchPans = async () => {
    try {
      const response = await api.panCards.getAll();
      const pansData = panArraySchema.parse((response as any).data).map(pan => ({
        ...pan,
        createdAt: new Date(pan.createdAt),
        updatedAt: new Date(pan.updatedAt),
      }));
      setPans(pansData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch PAN cards. Please try again.');
      console.error('Error fetching PANs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPans();
  }, []);

  const onSubmit = async (data: PanFormData) => {
    setSubmitting(true);
    try {
      const response = await api.panCards.create(data);
      const newPan = panArraySchema.element.parse((response as any).data);
      setPans([...pans, {
        ...newPan,
        createdAt: new Date(newPan.createdAt),
        updatedAt: new Date(newPan.updatedAt),
      }]);
      reset();
      setError(null);
    } catch (err) {
      setError('Failed to add PAN card. Please try again.');
      console.error('Error adding PAN:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const deletePan = async (id: string) => {
    try {
      await api.panCards.delete(id);
      setPans(pans.filter(pan => pan.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete PAN card');
      console.error('Error deleting PAN:', err);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete PAN Card',
      'Are you sure you want to delete this PAN card?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePan(id) },
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
      <Text variant="headlineMedium" style={styles.title}>
        Manage PAN Cards
      </Text>

      <Card style={styles.formCard}>
        <Card.Content>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="PAN Card Name (e.g. Self, Spouse)"
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
            name="panNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="PAN Number"
                value={value.toUpperCase()}
                onChangeText={(text) => onChange(text.toUpperCase())}
                onBlur={onBlur}
                error={!!errors.panNumber}
                style={styles.input}
                autoCapitalize="characters"
                maxLength={10}
              />
            )}
          />
          {errors.panNumber && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.panNumber.message}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            loading={submitting}
            disabled={submitting}
          >
            Add PAN Card
          </Button>
        </Card.Content>
      </Card>

      {error && (
        <Text style={[styles.errorText, styles.generalError, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <FlatList
        data={pans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableRow
            onDelete={() => confirmDelete(item.id)}
          >
            <Card style={styles.panCard}>
              <Card.Content>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodyMedium">{item.panNumber}</Text>
                {item.isDefault && (
                  <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                    Default
                  </Text>
                )}
              </Card.Content>
            </Card>
          </SwipeableRow>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No PAN cards added yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
  formCard: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  generalError: {
    textAlign: 'center',
    marginBottom: 16,
  },
  panCard: {
    marginBottom: 8,
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