import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import type { ViewStyle, TextStyle, TouchableOpacityProps, ScrollViewProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Task, TaskStatus } from '../../types/task';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAvoidingView } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Task) => void;
  initialData?: Task;
  mode?: 'create' | 'edit';
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [status, setStatus] = useState<TaskStatus>('in progress');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset the animation value when the modal becomes visible
      slideAnim.setValue(SCREEN_HEIGHT);
      
      // Start the slide-up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setDueDate(new Date(initialData.dueDate));
        setStatus(initialData.status);
      } else {
        resetForm();
      }
    } else {
      // Slide down when closing
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setStatus('in progress' as TaskStatus);
    setShowDatePicker(false);
    setShowStatusDropdown(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      const taskData: Task = {
        id: initialData?.id || '',
        title: title.trim(),
        description: description.trim(),
        dueDate: selectedDate.toISOString(),
        status,
        createdBy: initialData?.createdBy || '',
        createdAt: initialData?.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        participants: initialData?.participants || [],
        subtasks: initialData?.subtasks || [],
      };

      await onSubmit(taskData);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleBackdropPress = () => {
    setShowDatePicker(false);
    setShowStatusDropdown(false);
    onClose();
  };

  // Update the TouchableOpacity components to use proper types
  const BackdropTouchable: React.FC<TouchableOpacityProps> = ({ children, ...props }) => (
  <TouchableOpacity {...props}>{children}</TouchableOpacity>
);

const CloseButton: React.FC<TouchableOpacityProps> = ({ children, ...props }) => (
  <TouchableOpacity {...props}>{children}</TouchableOpacity>
);

const SubmitButton: React.FC<TouchableOpacityProps> = ({ children, ...props }) => (
  <TouchableOpacity {...props}>{children}</TouchableOpacity>
);

const StatusButton: React.FC<TouchableOpacityProps> = ({ children, ...props }) => (
  <TouchableOpacity {...props}>{children}</TouchableOpacity>
);

const DropdownItem: React.FC<TouchableOpacityProps> = ({ children, ...props }) => (
  <TouchableOpacity {...props}>{children}</TouchableOpacity>
);

// Update the ScrollView component
const FormScrollView: React.FC<ScrollViewProps> = ({ children, ...props }) => (
  <ScrollView {...props}>{children}</ScrollView>
);

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <BackdropTouchable 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={handleBackdropPress}
          >
            <View style={styles.backdrop} />
          </BackdropTouchable>

          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                transform: [{ translateY: slideAnim }],
                maxHeight: MODAL_HEIGHT,
              },
            ]}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {mode === 'create' ? 'Create Task' : 'Edit Task'}
                </Text>
                <CloseButton
                  onPress={handleBackdropPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name="close" size={28} color={colors.text} />
                </CloseButton>
              </View>

              <FormScrollView 
                style={styles.form} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.formContent}
              >
                {/* Title */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.divider,
                      },
                    ]}
                    placeholder="Enter task title"
                    placeholderTextColor={colors.secondaryText}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={50}
                  />
                  <Text style={[styles.characterCount, { color: colors.secondaryText }]}>
                    {title.length}/50 characters
                  </Text>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.divider,
                      },
                    ]}
                    placeholder="Enter task description"
                    placeholderTextColor={colors.secondaryText}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Due Date */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Due Date *</Text>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.divider,
                      },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <View style={styles.dateInputContent}>
                      <Text
                        style={[
                          styles.inputText,
                          { color: dueDate ? colors.text : colors.secondaryText },
                        ]}
                      >
                        {dueDate.toLocaleDateString()}
                      </Text>
                      <MaterialIcons name="calendar-today" size={22} color={colors.text} />
                    </View>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <View
                      style={[
                        styles.datePickerContainer,
                        {
                          backgroundColor: colors.cardBackground,
                          borderColor: colors.divider,
                        },
                      ]}
                    >
                      <DateTimePicker
                        value={dueDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                        textColor={colors.text}
                        style={styles.datePicker}
                        themeVariant={colorScheme}
                      />
                    </View>
                  )}
                </View>

                {/* Status */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Status *</Text>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.divider,
                      },
                    ]}
                    onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                  >
                    <View style={styles.statusInputContent}>
                      <Text style={[styles.inputText, { color: colors.text }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                      <MaterialIcons
                        name={showStatusDropdown ? 'expand-less' : 'expand-more'}
                        size={24}
                        color={colors.text}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <SubmitButton
                  onPress={handleSubmit}
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.submitButtonText, { color: '#fff' }]}>
                    {mode === 'create' ? 'Create' : 'Update'}
                  </Text>
                </SubmitButton>
              </FormScrollView>

              {/* Status Dropdown */}
              {showStatusDropdown && (
                <View
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  {['in progress', 'completed', 'expired', 'closed'].map((statusOption) => (
                    <DropdownItem
                      key={statusOption}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setStatus(statusOption as TaskStatus);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                        {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                      </Text>
                    </DropdownItem>
                  ))}
                </View>
              )}
            </KeyboardAvoidingView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    flex: 1,
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  datePickerContainer: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Platform.OS === 'ios' ? 10 : 0,
  },
  datePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : undefined,
  },
  statusInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  dropdown: {
    position: 'absolute',
    top: 200,
    left: 24,
    right: 24,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
}); 