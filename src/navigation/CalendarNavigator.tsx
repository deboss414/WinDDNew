import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';
import { getColors } from '../constants/colors';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { EventFormScreen } from '../screens/calendar/EventFormScreen';

export type CalendarStackParamList = {
  CalendarMain: undefined;
  EventForm: undefined;
};

const CalendarStack = createStackNavigator<CalendarStackParamList>();

export const CalendarNavigator = () => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  return (
    <CalendarStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <CalendarStack.Screen 
        name="CalendarMain" 
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <CalendarStack.Screen 
        name="EventForm" 
        component={EventFormScreen}
        options={{ title: 'New Event' }}
      />
    </CalendarStack.Navigator>
  );
}; 