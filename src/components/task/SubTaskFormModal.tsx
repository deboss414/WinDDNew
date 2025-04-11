import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { SubTask } from './SubTask';
import Slider from '@react-native-community/slider';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

interface SubTaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'>) => void;
  participants: string[];
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  initialData?: SubTask;
}

export const SubTaskFormModal: React.FC<SubTaskFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  participants,
  isSubmitting,
  mode = 'create',
  initialData,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  const colors = getColors(colorScheme);
  const iconColor = isDark ? '#ECEDEE' : '#11181C';
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const isFormSubmitting = localIsSubmitting || isSubmitting;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<string[]>([]);
  const [assigneeSearchText, setAssigneeSearchText] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [progress, setProgress] = useState(0);

  const filteredParticipants = (participants || []).filter(
    participant =>
      (participant || '').toLowerCase().includes((assigneeSearchText || '').toLowerCase()) &&
      !assignee.includes(participant)
  );

  useEffect(() => {
    if (visible) {
      if (initialData) {
        console.log('Edit mode - Initial Data:', initialData);
        console.log('Edit mode - Participants:', participants);
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setAssignee(initialData.assignee || []);
        setDueDate(new Date(initialData.dueDate));
        setProgress(initialData.progress);
      } else {
        console.log('Create mode - Participants:', participants);
        resetForm();
      }
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
    } else {
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
  }, [visible, initialData, slideAnim, fadeAnim]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignee([]);
    setDueDate(new Date());
    setProgress(0);
    setShowDatePicker(false);
    setLocalIsSubmitting(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const handleAddAssignee = (participant: string) => {
    // Prevent adding duplicates
    if (!assignee.includes(participant)) {
      setAssignee([...assignee, participant]);
    }
    setShowDatePicker(false);
  };

  const handleRemoveAssignee = (assigneeToRemove: string) => {
    setAssignee(assignee.filter(assignee => assignee !== assigneeToRemove));
  };

  const handleSubmit = async () => {
    if (isFormSubmitting) return;

    if (!title.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLocalIsSubmitting(true);
      // Set the time to 00:00
      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      const subtaskData: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'> = {
        title: title.trim(),
        description: description.trim(),
        assignee,
        dueDate: selectedDate.toISOString(),
        progress,
      };
      await onSubmit(subtaskData);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create subtask. Please try again.');
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  const handleBackdropPress = () => {
    if (!isFormSubmitting) {
      setShowDatePicker(false);
      onClose();
    }
  };

  const handleAssigneeToggle = (userId: string) => {
    setAssignee(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={() => !isFormSubmitting && onClose()}
      animationType="none"
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {mode === 'create' ? 'Create Subtask' : 'Edit Subtask'}
              </Text>
              <TouchableOpacity
                onPress={handleBackdropPress}
                disabled={isFormSubmitting}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={28} color={iconColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
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
                  placeholder="Enter subtask title"
                  placeholderTextColor={colors.secondaryText}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={50}
                  editable={!isFormSubmitting}
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
                  placeholder="Enter subtask description"
                  placeholderTextColor={colors.secondaryText}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isFormSubmitting}
                />
              </View>

              {/* Assignees */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Assignees *</Text>
                <View style={styles.selectedAssignees}>
                  {assignee.map((assignee, index) => (
                    <View
                      key={`${assignee}-${index}`}
                      style={[
                        styles.assigneeChip,
                        { backgroundColor: colors.cardBackground },
                      ]}
                    >
                      <Text style={[styles.assigneeChipText, { color: colors.text }]}>
                        {assignee}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveAssignee(assignee)}
                        style={styles.removeAssigneeButton}
                        disabled={isFormSubmitting}
                      >
                        <MaterialIcons name="close" size={18} color={iconColor} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <View style={styles.assigneeContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.divider,
                      },
                    ]}
                    placeholder="Search assignees..."
                    placeholderTextColor={colors.secondaryText}
                    value={assigneeSearchText}
                    onChangeText={(text) => {
                      setAssigneeSearchText(text);
                      setShowAssigneeDropdown(true);
                    }}
                    onFocus={() => {
                      setShowAssigneeDropdown(true);
                      if (participants?.length > 0) {
                        setAssigneeSearchText('');
                      }
                    }}
                    editable={!isFormSubmitting}
                  />
                  {showAssigneeDropdown && (
                    <View
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: colors.cardBackground,
                          borderColor: colors.divider,
                        },
                      ]}
                    >
                      <ScrollView
                        style={styles.dropdownScroll}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                      >
                        {filteredParticipants.map((participant) => (
                          <TouchableOpacity
                            key={participant}
                            style={styles.dropdownItem}
                            onPress={() => {
                              handleAddAssignee(participant);
                              setAssigneeSearchText('');
                              setShowAssigneeDropdown(false);
                            }}
                            disabled={isFormSubmitting}
                          >
                            <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                              {participant}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
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
                    if (!isFormSubmitting) {
                      setTempDate(dueDate);
                      setShowDatePicker(true);
                    }
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
                    <MaterialIcons name="calendar-today" size={22} color={iconColor} />
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
                          disabled={isFormSubmitting}
                        >
                          <Text style={[styles.datePickerButtonText, { color: colors.text }]}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleDatePickerDone}
                          style={styles.datePickerButton}
                          disabled={isFormSubmitting}
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

              {/* Progress */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Progress</Text>
                <View style={styles.progressContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    value={progress}
                    onValueChange={setProgress}
                    step={10}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.divider}
                    thumbTintColor={colors.primary}
                  />
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    {progress}%
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: isFormSubmitting ? colors.primary + '80' : colors.primary,
                  },
                ]}
                disabled={isFormSubmitting}
              >
                <Text style={[styles.submitButtonText, { color: '#fff' }]}>
                  {isFormSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: MODAL_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  form: {
    flexGrow: 0,
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
  selectedAssignees: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  assigneeChipText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  removeAssigneeButton: {
    padding: 2,
  },
  assigneeContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});