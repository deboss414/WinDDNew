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
  ViewStyle,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import type { TouchableOpacityProps, ScrollViewProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Task, TaskStatus } from '../../types/task';
import DateTimePicker from '@react-native-community/datetimepicker';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Task) => void;
  initialData?: Task;
  mode?: 'create' | 'edit';
  containerStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  overlayStyle?: ViewStyle;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  containerStyle,
  headerStyle,
  contentStyle,
  overlayStyle,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [status, setStatus] = useState<TaskStatus>('in progress');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset the animation value when the modal becomes visible
      slideAnim.setValue(SCREEN_HEIGHT);
      
      // Start the slide-up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
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
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
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
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleDatePickerDone = () => {
    setDueDate(tempDate);
    setShowDatePicker(false);
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
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: fadeAnim,
              },
              overlayStyle
            ]}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [{ translateY: slideAnim }],
                    backgroundColor: colors.cardBackground,
                  },
                  containerStyle
                ]}
              >
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={{ flex: 1 }}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                >
                  <View style={[styles.modalHeader, headerStyle]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      {mode === 'create' ? 'Create Task' : 'Edit Task'}
                    </Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                      <MaterialIcons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView 
                    style={[styles.formContent, contentStyle]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="none"
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
                        onPress={() => {
                          setTempDate(dueDate);
                          setShowDatePicker(true);
                        }}
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
                          {Platform.OS === 'ios' && (
                            <View style={styles.datePickerHeader}>
                              <TouchableOpacity
                                onPress={() => setShowDatePicker(false)}
                                style={styles.datePickerButton}
                              >
                                <Text style={[styles.datePickerButtonText, { color: colors.text }]}>
                                  Cancel
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={handleDatePickerDone}
                                style={styles.datePickerButton}
                              >
                                <Text style={[styles.datePickerButtonText, { color: colors.primary }]}>
                                  Done
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          <DateTimePicker
                            value={Platform.OS === 'ios' ? tempDate : dueDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
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
                  </ScrollView>

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
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: MODAL_HEIGHT,
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
    padding: Platform.OS === 'ios' ? 0 : 0,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerButton: {
    padding: 4,
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  datePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 300 : undefined,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
}); 