import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NewChunkScreen from './screens/NewChunkScreen';
import TimerScreen from './screens/TimerScreen';
import SettingsScreen from './screens/SettingsScreen';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

const Stack = createNativeStackNavigator();

export default function App() {

  NavigationBar.setBackgroundColorAsync('#000000');
  NavigationBar.setButtonStyleAsync('light');

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack.Navigator initialRouteName="NewChunk" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NewChunk" component={NewChunkScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
}
