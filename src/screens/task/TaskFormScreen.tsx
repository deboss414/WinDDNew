import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTask } from '../../api/taskApi';
import { MainStackParamList } from '../../navigation/MainStack';
import { getColors } from '../../constants/colors';

type TaskFormScreenNavigationProp = StackNavigationProp<MainStackParamList>;

export const TaskFormScreen: React.FC = () => {
  const navigation = useNavigation<TaskFormScreenNavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [status, setStatus] = useState<'in progress' | 'completed' | 'expired' | 'closed'>('in progress');
  const [participants, setParticipants] = useState<Array<{ email: string; displayName: string }>>([]);
  const [participantEmail, setParticipantEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [participantError, setParticipantError] = useState<string | null>(null);

  const handleAddParticipant = () => {
    if (!participantEmail.trim()) {
      setParticipantError('Please enter an email address');
      return;
    }

    if (!participantEmail.includes('@')) {
      setParticipantError('Please enter a valid email address');
      return;
    }

    if (participants.some(p => p.email === participantEmail)) {
      setParticipantError('This participant is already added');
      return;
    }

    setParticipants([...participants, {
      email: participantEmail,
      displayName: participantEmail.split('@')[0] // Temporary display name
    }]);
    setParticipantEmail('');
    setParticipantError(null);
  };

  const handleRemoveParticipant = (email: string) => {
    setParticipants(participants.filter(p => p.email !== email));
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: dueDate.toISOString(),
        participants,
        createdBy: 'Current User', // TODO: Replace with actual user ID/name
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.cardBackground,
              color: colors.text,
              borderColor: colors.divider
            }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            placeholderTextColor={colors.secondaryText}
            maxLength={50}
          />
          <Text style={[styles.characterCount, { color: colors.secondaryText }]}>
            {title.length}/50 characters
          </Text>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: colors.cardBackground,
              color: colors.text,
              borderColor: colors.divider
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            placeholderTextColor={colors.secondaryText}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={[styles.characterCount, { color: colors.secondaryText }]}>
            {description.length}/500 characters
          </Text>
        </View>

        {/* Due Date Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Due Date *</Text>
          <TouchableOpacity
            style={[styles.input, { 
              backgroundColor: colors.cardBackground,
              borderColor: colors.divider
            }]}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateInputContent}>
              <Text style={[styles.inputText, { color: colors.text }]}>
                {formatDate(dueDate)}
              </Text>
              <MaterialIcons name="calendar-today" size={22} color={colors.text} />
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDueDate(selectedDate);
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Status Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Status</Text>
          <TouchableOpacity 
            style={[styles.input, { 
              backgroundColor: colors.cardBackground,
              borderColor: colors.divider
            }]}
            onPress={() => setShowStatusDropdown(true)}
          >
            <View style={styles.statusInputContent}>
              <MaterialIcons
                name={
                  status === 'completed' ? 'check-circle' :
                  status === 'in progress' ? 'schedule' :
                  status === 'expired' ? 'error' : 'close'
                }
                size={20}
                color={colors.text}
              />
              <Text style={[styles.inputText, { color: colors.text }]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={colors.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Participants Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Participants</Text>
          <View style={styles.participantsContainer}>
            {participants.map((participant, index) => (
              <View
                key={index}
                style={[styles.participantChip, { backgroundColor: colors.cardBackground }]}
              >
                <Text style={[styles.participantChipText, { color: colors.text }]}>
                  {participant.displayName}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveParticipant(participant.email)}
                  style={styles.removeParticipantButton}
                >
                  <MaterialIcons name="close" size={18} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.addParticipantContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.divider,
                flex: 1
              }]}
              value={participantEmail}
              onChangeText={(text) => {
                setParticipantEmail(text);
                setParticipantError(null);
              }}
              placeholder="Enter participant email"
              placeholderTextColor={colors.secondaryText}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddParticipant}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {participantError && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {participantError}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: colors.primary,
            opacity: loading ? 0.7 : 1 
          }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Status Dropdown Modal */}
      <Modal
        visible={showStatusDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowStatusDropdown(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            {['in progress', 'completed', 'expired', 'closed'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  status === s && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => {
                  setStatus(s as typeof status);
                  setShowStatusDropdown(false);
                }}
              >
                <MaterialIcons
                  name={
                    s === 'completed' ? 'check-circle' :
                    s === 'in progress' ? 'schedule' :
                    s === 'expired' ? 'error' : 'close'
                  }
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.statusOptionText, { color: colors.text }]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  statusInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: 8,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  participantChipText: {
    fontSize: 14,
    marginRight: 8,
  },
  removeParticipantButton: {
    padding: 2,
  },
  addParticipantContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  statusOptionText: {
    fontSize: 16,
  },
}); 