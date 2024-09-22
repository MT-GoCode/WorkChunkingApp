import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';

export default function TimerScreen({ route, navigation }) {
  const { task, totalSeconds } = route.params;

  const [reminders, setReminders] = useState([]);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [reminderIndex, setReminderIndex] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const progress = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Lock the orientation to portrait on component mount
    const lockPortrait = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
    lockPortrait();

    // Set navigation bar color to black at all times
    NavigationBar.setBackgroundColorAsync('#000000');
    NavigationBar.setButtonStyleAsync('light');

    // Load reminders from AsyncStorage
    const loadReminders = async () => {
      try {
        const savedReminders = await AsyncStorage.getItem('reminders');
        if (savedReminders !== null && savedReminders.trim() !== '') {
          const remindersArray = savedReminders
            .split('\n')
            .map((reminder) => reminder.trim());
          setReminders(remindersArray);
        } else {
          // Default reminders
          setReminders([
            'Maintain good posture',
            'Focus on a single task',
            'Stay hydrated',
            'Take deep breaths',
            'Keep your workspace organized',
            'Avoid distractions',
          ]);
        }
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    };

    loadReminders();

    return () => {
      // Reset orientation to portrait when component unmounts
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    if (remainingSeconds > 0) {
      const timer = setTimeout(
        () => setRemainingSeconds(remainingSeconds - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else {
      setTimerFinished(true);
      handleTimerEnd();
    }
  }, [remainingSeconds]);

  useEffect(() => {
    if (!timerFinished) {
      const reminderTimer = setInterval(() => {
        setReminderIndex((prev) => (prev + 1) % reminders.length);
      }, 3000); // Change reminder every 3 seconds

      return () => clearInterval(reminderTimer);
    }
  }, [timerFinished, reminders]);

  useEffect(() => {
    const percentage = (totalSeconds - remainingSeconds) / totalSeconds;
    Animated.timing(progress, {
      toValue: percentage,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [remainingSeconds]);

  const handleTimerEnd = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${
      hrs > 0 ? (mins < 10 ? '0' : '') : ''
    }${mins}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const circleFillColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', timerFinished ? 'red' : '#1e90ff'],
  });

  const borderColor = timerFinished ? 'red' : '#1e90ff';

  // Function to rotate the screen orientation
  const rotateScreen = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        setIsLandscape(false);
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
        );
        setIsLandscape(true);
      }
    } catch (error) {
      console.log('Error changing screen orientation:', error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isLandscape && styles.containerLandscape,
      ]}
    >
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      {isLandscape ? (
        <View style={styles.landscapeContainer}>
          {/* Left Half */}
          <View style={styles.leftContainer}>
            <Text
              style={[
                styles.taskText,
                timerFinished && styles.timeUpText,
                styles.taskTextLandscape,
              ]}
            >
              {timerFinished ? "Time's up!" : task}
            </Text>
            {!timerFinished && (
              <Text style={[styles.reminderText, styles.reminderTextLandscape]}>
                {reminders[reminderIndex]}
              </Text>
            )}
          </View>
          {/* Right Half */}
          <View style={styles.rightContainer}>
            <View style={styles.timerContainerLandscape}>
              <Animated.View
                style={[
                  styles.progressCircle,
                  {
                    backgroundColor: circleFillColor,
                    borderColor: borderColor,
                  },
                ]}
              >
                <Text style={styles.timerText}>
                  {formatTime(remainingSeconds)}
                </Text>
              </Animated.View>
            </View>
            <View style={styles.buttonContainerLandscape}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  navigation.navigate('NewChunk');
                  setRemainingSeconds(totalSeconds);
                }}
              >
                <Text style={styles.buttonText}>New Chunk</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rotateButton}
                onPress={rotateScreen}
              >
                <Text style={styles.rotateButtonText}>⟳</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Portrait Mode
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.taskText,
              timerFinished && styles.timeUpText,
            ]}
          >
            {timerFinished ? "Time's up!" : task}
          </Text>
          <View style={styles.timerContainer}>
            <Animated.View
              style={[
                styles.progressCircle,
                {
                  backgroundColor: circleFillColor,
                  borderColor: borderColor,
                },
              ]}
            >
              <Text style={styles.timerText}>
                {formatTime(remainingSeconds)}
              </Text>
            </Animated.View>
          </View>
          <View style={styles.reminderContainer}>
            {!timerFinished && (
              <Text style={styles.reminderText}>
                {reminders[reminderIndex]}
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                navigation.navigate('NewChunk');
                setRemainingSeconds(totalSeconds);
              }}
            >
              <Text style={styles.buttonText}>New Chunk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rotateButton}
              onPress={rotateScreen}
            >
              <Text style={styles.rotateButtonText}>⟳</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const CIRCLE_SIZE = 180;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerLandscape: {
    paddingHorizontal: 0,
    flexDirection: 'row',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskText: {
    color: '#fff',
    fontSize: 32,
    marginBottom: 10,
    textAlign: 'center',
  },
  taskTextLandscape: {
    fontSize: 28,
  },
  timeUpText: {
    color: 'red',
  },
  timerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  timerContainerLandscape: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 32,
  },
  reminderContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  reminderText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  reminderTextLandscape: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  buttonContainerLandscape: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  rotateButton: {
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1e90ff',
    borderRadius: 5,
    alignItems: 'center',
  },
  rotateButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
