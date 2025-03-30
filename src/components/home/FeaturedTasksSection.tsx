import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TaskCard } from '../task/TaskCard';
import { Task } from '../../types/task';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/MainTabs';
import { TaskStackParamList } from '../../navigation/MainTabs';
import { getColors } from '../../constants/colors';
import { useColorScheme } from 'react-native';

type TabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

interface FeaturedTasksSectionProps {
  tasks: Task[];
}

export const FeaturedTasksSection: React.FC<FeaturedTasksSectionProps> = ({ tasks }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<TabNavigationProp>();

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const pageNum = Math.floor(contentOffset.x / viewSize);
    setActiveIndex(pageNum);
  };

  const handleTaskPress = (taskId: string) => {
    // First switch to the Tasks tab
    navigation.navigate('Tasks');
    // Then navigate to TaskDetail using the nested navigator
    setTimeout(() => {
      navigation.navigate('Tasks', {
        screen: 'TaskDetail',
        params: { taskId }
      });
    }, 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!tasks.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Featured Tasks</Text>
        <Text style={[styles.date, { color: colors.text }]}>
          Due: {formatDate(tasks[activeIndex]?.dueDate || '')}
        </Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={Dimensions.get('window').width - 32}
        decelerationRate="fast"
      >
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCardWrapper}
            onPress={() => handleTaskPress(task.id)}
          >
            <TaskCard task={task} onPress={() => handleTaskPress(task.id)} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  taskCardWrapper: {
    width: Dimensions.get('window').width - 32,
    paddingHorizontal: 8,
  },
}); 