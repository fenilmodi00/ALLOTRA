import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Switch, Button, Divider, Text, Dialog, Portal, TextInput } from 'react-native-paper';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useAppTheme } from '../../theme';

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const theme = useAppTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you would persist this setting and apply it to the theme
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
    // In a real app, you would persist this setting and configure push notifications
  };

  const showEditDialog = () => {
    setEditFirstName(user?.firstName || '');
    setEditLastName(user?.lastName || '');
    setEditDialogVisible(true);
  };

  const hideEditDialog = () => {
    setEditDialogVisible(false);
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await user.update({
        firstName: editFirstName,
        lastName: editLastName,
      });
      hideEditDialog();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        {user && (
          <>
            <List.Item
              title="Name"
              description={`${user.firstName} ${user.lastName}`}
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => <List.Icon {...props} icon="pencil" />}
              onPress={showEditDialog}
            />
            <List.Item
              title="Email"
              description={user.primaryEmailAddress?.emailAddress}
              left={(props) => <List.Icon {...props} icon="email" />}
            />
          </>
        )}
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Push Notifications"
          description="Get notified about IPO results"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={confirmLogout}
          style={styles.logoutButton}
          buttonColor={theme.colors.error}
        >
          Logout
        </Button>
      </View>

      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={hideEditDialog}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="First Name"
              value={editFirstName}
              onChangeText={setEditFirstName}
              style={styles.input}
            />
            <TextInput
              label="Last Name"
              value={editLastName}
              onChangeText={setEditLastName}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideEditDialog}>Cancel</Button>
            <Button onPress={updateProfile} loading={isSubmitting} disabled={isSubmitting}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
  },
}); 