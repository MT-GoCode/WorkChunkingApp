import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function NewChunkScreen({ navigation }) {
  const [task, setTask] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [checks, setChecks] = useState([]); // [{label: '...', value: false}, ...]
  const [reminders, setReminders] = useState([]);
  const isFocused = useIsFocused(); // Get the current focus state of the screen

  const loadSettings = async () => {
    try {
      const savedChecks = await AsyncStorage.getItem('checks');
      const savedReminders = await AsyncStorage.getItem('reminders');

      // Load checks
      if (savedChecks !== null && savedChecks.trim() !== '') {
        const checksArray = savedChecks.split('\n').map((check) => ({
          label: check.trim(),
          value: false,
        }));
        setChecks(checksArray);
      } else {
        // Default checks
        const defaultChecks = [
          { label: 'Task is specific?', value: false },
          { label: 'Time is realistic?', value: false },
          { label: 'Music is off if not needed?', value: false },
        ];
        setChecks(defaultChecks);
      }

      // Load reminders
      if (savedReminders !== null && savedReminders.trim() !== '') {
        const remindersArray = savedReminders.split('\n').map((reminder) => reminder.trim());
        setReminders(remindersArray);
      } else {
        // Default reminders
        setReminders([]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadSettings(); // Reload settings when the screen is focused
    }
  }, [isFocused]); // Depend on the isFocused value

  const parseTime = (input) => {
    const regex = /(\d+)\s*h(?:ours?)?|\s*(\d+)\s*m(?:inutes?)?|\s*(\d+)\s*s(?:econds?)?/gi;
    let totalSeconds = 0;
    let match;
    while ((match = regex.exec(input)) !== null) {
      if (match[1]) totalSeconds += parseInt(match[1]) * 3600;
      if (match[2]) totalSeconds += parseInt(match[2]) * 60;
      if (match[3]) totalSeconds += parseInt(match[3]);
    }
    return totalSeconds;
  };

  // Custom Checkbox component
  const Checkbox = ({ value, onValueChange }) => {
    return (
      <TouchableOpacity onPress={onValueChange} style={styles.checkbox}>
        {value && <View style={styles.checkboxInner} />}
      </TouchableOpacity>
    );
  };

  const handleStartChunk = () => {
    const totalSeconds = parseTime(timeInput);
    if (!task.trim()) {
      Alert.alert('Please enter a task.');
      return;
    }
    if (totalSeconds <= 0) {
      Alert.alert('Please enter a valid time.');
      return;
    }
    // Check if all checkboxes are checked
    const allChecked = checks.every((check) => check.value === true);
    if (!allChecked) {
      Alert.alert('Please check all the boxes.');
      return;
    }

    navigation.navigate('Timer', { task, totalSeconds });

    // Reset form
    setTask('');
    setTimeInput('');
    // Reset checks
    const resetChecks = checks.map((check) => ({ ...check, value: false }));
    setChecks(resetChecks);
  };

  const toggleCheck = (index) => {
    const newChecks = [...checks];
    newChecks[index].value = !newChecks[index].value;
    setChecks(newChecks);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Chunk</Text>
        <TouchableWithoutFeedback onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableWithoutFeedback>
      </View>

      <Text style={styles.label}>Task:</Text>
      <TextInput
        style={styles.input}
        value={task}
        onChangeText={setTask}
        placeholder="Enter your task"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Time Allotted:</Text>
      <TextInput
        style={styles.input}
        value={timeInput}
        onChangeText={setTimeInput}
        placeholder="e.g., 1h 30m 15s"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Checks:</Text>
      {checks.map((check, index) => (
        <View style={styles.checkboxContainer} key={index}>
          <Checkbox value={check.value} onValueChange={() => toggleCheck(index)} />
          <Text style={styles.checkboxLabel}>{check.label}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleStartChunk}>
        <Text style={styles.buttonText}>Start Chunk</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#1e90ff',
  },
  checkboxLabel: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 5,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
