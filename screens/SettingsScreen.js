import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const [checks, setChecks] = useState('');
  const [reminders, setReminders] = useState('');


  useEffect(() => {
    // Load settings from storage when the component mounts
    (async () => {
      try {
        const savedChecks = await AsyncStorage.getItem('checks');
        const savedReminders = await AsyncStorage.getItem('reminders');
        if (savedChecks !== null) setChecks(savedChecks);
        if (savedReminders !== null) setReminders(savedReminders);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('checks', checks);
      await AsyncStorage.setItem('reminders', reminders);
      Alert.alert('Settings Saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error saving settings');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Checks (Enter separated):</Text>
      <TextInput
        style={styles.input}
        value={checks}
        onChangeText={setChecks}
        placeholder="Enter checks"
        placeholderTextColor="#aaa"
        multiline
      />

      <Text style={styles.label}>Reminders (Enter separated):</Text>
      <TextInput
        style={styles.input}
        value={reminders}
        onChangeText={setReminders}
        placeholder="Enter reminders"
        placeholderTextColor="#aaa"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#888' }]}
        onPress={() => navigation.navigate('NewChunk')}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    marginVertical: 10,
    fontSize: 18,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    height: 100,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
