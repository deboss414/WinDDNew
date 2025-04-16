// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   useColorScheme,
//   Image,
//   Modal,
//   Alert,
//   Animated,
//   Pressable,
//   Dimensions,
// } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { getColors } from '../../constants/colors';
// import { Message, Conversation } from '../../types/chat';
// import { chatApi } from '../../api/chatApi';

// type RootStackParamList = {
//   TaskDetail: { taskId: string };
//   Chatroom: { conversationId: string; taskId: string; taskTitle: string };
// };

// type ChatroomScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// interface ChatroomScreenProps {
//   route: {
//     params: {
//       conversationId: string;
//       taskId: string;
//       taskTitle: string;
//     };
//   };
// }

// interface Participant {
//   id: string;
//   name: string;
//   avatar?: string;
// }

// export const ChatroomScreen: React.FC<ChatroomScreenProps> = ({ route }) => {
//   const navigation = useNavigation<ChatroomScreenNavigationProp>();
//   const { conversationId, taskId, taskTitle } = route.params;
//   const colorScheme = useColorScheme();
//   const colors = getColors(colorScheme);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [participants, setParticipants] = useState<Participant[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const flatListRef = useRef<FlatList>(null);
//   const [showParticipantsModal, setShowParticipantsModal] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
//   const [showMessageOptions, setShowMessageOptions] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingText, setEditingText] = useState('');
//   const [replyingTo, setReplyingTo] = useState<Message | null>(null);
//   const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 });
//   const modalAnimation = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     loadChatroomData();
//   }, [conversationId]);

//   const loadChatroomData = async () => {
//     try {
//       setLoading(true);
//       // Load messages and participants concurrently
//       const [messagesData, participantsData] = await Promise.all([
//         chatApi.getMessages(conversationId),
//         chatApi.getParticipants(conversationId)
//       ]);
      
//       setMessages(messagesData);
//       setParticipants(participantsData);
//     } catch (err) {
//       setError('Failed to load chatroom data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!newMessage.trim()) return;
//     try {
//       const message = await chatApi.sendMessage(
//         conversationId,
//         newMessage.trim(),
//         'current-user-id',
//         'Current User'
//       );
//       setMessages(prev => [...prev, message]);
//       setNewMessage('');
//       setReplyingTo(null); // Clear reply state only after sending
//       flatListRef.current?.scrollToEnd({ animated: true });
//     } catch (err) {
//       setError('Failed to send message');
//     }
//   };

//   const getParticipantAvatar = (senderId: string) => {
//     const participant = participants.find(p => p.id === senderId);
//     return participant?.avatar;
//   };

//   const showOptions = (message: Message, event: any) => {
//     const { pageX, pageY } = event.nativeEvent;
//     const screenWidth = Dimensions.get('window').width;
//     const screenHeight = Dimensions.get('window').height;
    
//     // Calculate position to show options
//     let x = pageX;
//     let y = pageY;
    
//     // Adjust position if near screen edges
//     if (x > screenWidth - 150) { // 150 is approximate width of options menu
//       x = screenWidth - 160;
//     }
//     if (y > screenHeight - 200) { // 200 is approximate height of options menu
//       y = screenHeight - 210;
//     }
    
//     setOptionsPosition({ x, y });
//     setSelectedMessage(message);
//     setShowMessageOptions(true);
    
//     Animated.spring(modalAnimation, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 65,
//       friction: 11,
//     }).start();
//   };

//   const hideOptions = () => {
//     Animated.spring(modalAnimation, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 65,
//       friction: 11,
//     }).start(() => {
//       setShowMessageOptions(false);
//       setSelectedMessage(null);
//       setIsEditing(false);
//     });
//   };

//   const handleEdit = () => {
//     if (!selectedMessage) return;
//     setIsEditing(true);
//     setEditingText(selectedMessage.content);
//   };

//   const handleSaveEdit = async () => {
//     if (!selectedMessage || !editingText.trim()) return;
//     try {
//       // TODO: Implement edit message API call
//       setMessages(prev => prev.map(msg => 
//         msg.id === selectedMessage.id 
//           ? { ...msg, content: editingText.trim() }
//           : msg
//       ));
//       setIsEditing(false);
//       hideOptions();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to edit message');
//     }
//   };

//   const handleDelete = async () => {
//     if (!selectedMessage) return;
//     Alert.alert(
//       'Delete Message',
//       'Are you sure you want to delete this message?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               // TODO: Implement delete message API call
//               setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
//               hideOptions();
//             } catch (error) {
//               Alert.alert('Error', 'Failed to delete message');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleReply = () => {
//     if (!selectedMessage) return;
//     setReplyingTo(selectedMessage);
//     hideOptions();
//   };

//   const renderMessage = ({ item }: { item: Message }) => {
//     const isCurrentUser = item.senderId === 'current-user-id';
//     const avatar = getParticipantAvatar(item.senderId);

//     return (
//       <View style={[
//         styles.messageContainer,
//         isCurrentUser ? styles.sentMessage : styles.receivedMessage,
//       ]}>
//         {!isCurrentUser && (
//           <View style={styles.avatarContainer}>
//             <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
//               <Text style={styles.avatarText}>
//                 {item.senderName.charAt(0).toUpperCase()}
//               </Text>
//             </View>
//           </View>
//         )}
//         <View style={styles.messageContent}>
//           {!isCurrentUser && (
//             <Text style={[styles.senderName, { color: colors.secondaryText }]}>
//               {item.senderName}
//             </Text>
//           )}
//           <View
//             style={[
//               styles.messageBubble,
//               {
//                 backgroundColor: isCurrentUser ? colors.primary : colors.cardBackground,
//                 borderTopLeftRadius: isCurrentUser ? 16 : 8,
//                 borderTopRightRadius: isCurrentUser ? 8 : 16,
//               },
//             ]}
//           >
//             <Text
//               style={[
//                 styles.messageText,
//                 { color: isCurrentUser ? '#fff' : colors.text },
//               ]}
//             >
//               {item.content}
//             </Text>
//           </View>
//           <View style={styles.messageFooter}>
//             <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
//               {new Date(item.timestamp).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit',
//               })}
//             </Text>
//             <View style={styles.messageActions}>
//               {isCurrentUser && (
//                 <TouchableOpacity
//                   style={styles.deleteButton}
//                   onPress={() => {
//                     Alert.alert(
//                       'Delete Message',
//                       'Are you sure you want to delete this message?',
//                       [
//                         { text: 'Cancel', style: 'cancel' },
//                         {
//                           text: 'Delete',
//                           style: 'destructive',
//                           onPress: async () => {
//                             try {
//                               // TODO: Implement delete message API call
//                               setMessages(prev => prev.filter(msg => msg.id !== item.id));
//                             } catch (error) {
//                               Alert.alert('Error', 'Failed to delete message');
//                             }
//                           },
//                         },
//                       ]
//                     );
//                   }}
//                 >
//                   <MaterialIcons name="delete" size={16} color={colors.taskStatus.expired} />
//                   <Text style={[styles.deleteButtonText, { color: colors.taskStatus.expired }]}>Delete</Text>
//                 </TouchableOpacity>
//               )}
//               <TouchableOpacity
//                 style={styles.replyButton}
//                 onPress={() => setReplyingTo(item)}
//               >
//                 <MaterialIcons name="reply" size={16} color={colors.secondaryText} />
//                 <Text style={[styles.replyButtonText, { color: colors.secondaryText }]}>Reply</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//         {isCurrentUser && (
//           <View style={styles.avatarContainer}>
//             <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
//               <Text style={styles.avatarText}>
//                 {item.senderName.charAt(0).toUpperCase()}
//               </Text>
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderHeader = () => (
//     <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
//       <View style={styles.headerTop}>
//         <TouchableOpacity 
//           style={styles.headerButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialIcons name="arrow-back" size={24} color={colors.text} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
//           {taskTitle}
//         </Text>
//         <TouchableOpacity 
//           style={styles.headerButton}
//           onPress={() => setShowMenu(true)}
//         >
//           <MaterialIcons name="more-vert" size={24} color={colors.text} />
//         </TouchableOpacity>
//       </View>
//       <TouchableOpacity 
//         style={styles.avatarsContainer}
//         onPress={() => setShowParticipantsModal(true)}
//       >
//         {participants.slice(0, 5).map((participant, index) => (
//           <View
//             key={participant.id}
//             style={[
//               styles.avatarWrapper,
//               { marginLeft: index > 0 ? -12 : 0 }
//             ]}
//           >
//             {participant.avatar ? (
//               <Image
//                 source={{ uri: participant.avatar }}
//                 style={styles.headerAvatar}
//               />
//             ) : (
//               <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
//                 <Text style={styles.headerAvatarText}>
//                   {participant.name.charAt(0).toUpperCase()}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ))}
//         {participants.length > 5 && (
//           <View style={[styles.avatarWrapper, { marginLeft: -12 }]}>
//             <View style={[styles.headerAvatar, { backgroundColor: colors.secondaryText }]}>
//               <Text style={styles.headerAvatarText}>
//                 +{participants.length - 5}
//               </Text>
//             </View>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* Menu Modal */}
//       <Modal
//         visible={showMenu}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowMenu(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowMenu(false)}
//         >
//           <View style={[styles.menuModal, { backgroundColor: colors.cardBackground }]}>
//             <TouchableOpacity 
//               style={styles.menuItem}
//               onPress={() => {
//                 setShowMenu(false);
//                 navigation.navigate('TaskDetail', { taskId });
//               }}
//             >
//               <MaterialIcons name="assignment" size={24} color={colors.text} />
//               <Text style={[styles.menuText, { color: colors.text }]}>Go to Task</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.menuItem}
//               onPress={() => {
//                 setShowMenu(false);
//                 // Placeholder for settings
//                 Alert.alert('Settings', 'Settings feature coming soon!');
//               }}
//             >
//               <MaterialIcons name="settings" size={24} color={colors.text} />
//               <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Participants Modal */}
//       <Modal
//         visible={showParticipantsModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowParticipantsModal(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowParticipantsModal(false)}
//         >
//           <View style={[styles.participantsModal, { backgroundColor: colors.cardBackground }]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, { color: colors.text }]}>Participants</Text>
//               <TouchableOpacity onPress={() => setShowParticipantsModal(false)}>
//                 <MaterialIcons name="close" size={24} color={colors.text} />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.participantsList}>
//               {participants.map((participant) => (
//                 <View key={participant.id} style={styles.participantItem}>
//                   {participant.avatar ? (
//                     <Image
//                       source={{ uri: participant.avatar }}
//                       style={styles.participantAvatar}
//                     />
//                   ) : (
//                     <View style={[styles.participantAvatar, { backgroundColor: colors.primary }]}>
//                       <Text style={styles.participantAvatarText}>
//                         {participant.name.charAt(0).toUpperCase()}
//                       </Text>
//                     </View>
//                   )}
//                   <Text style={[styles.participantName, { color: colors.text }]}>
//                     {participant.name}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={[styles.container, styles.centered]}>
//         <ActivityIndicator size="large" color={colors.primary} />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={[styles.container, styles.centered]}>
//         <Text style={[styles.errorText, { color: colors.secondaryText }]}>{error}</Text>
//         <TouchableOpacity
//           style={[styles.retryButton, { backgroundColor: colors.primary }]}
//           onPress={loadChatroomData}
//         >
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor: colors.background }]}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
//     >
//       {renderHeader()}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={item => item.id}
//         contentContainerStyle={styles.messagesList}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//         showsVerticalScrollIndicator={false}
//       />
//       <View style={styles.inputWrapper}>
//         {replyingTo && (
//           <View style={[styles.replyContainer, { backgroundColor: colors.cardBackground }]}>
//             <View style={styles.replyContent}>
//               <View style={[styles.replyHeader, { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: 8 }]}>
//                 <View style={styles.replyInfo}>
//                   <Text style={[styles.replyName, { color: colors.primary }]}>
//                     Replying to {replyingTo.senderName}
//                   </Text>
//                   <Text style={[styles.replyMessage, { color: colors.text }]} numberOfLines={1}>
//                     {replyingTo.content}
//                   </Text>
//                 </View>
//                 <TouchableOpacity 
//                   style={styles.closeButton}
//                   onPress={() => setReplyingTo(null)}
//                 >
//                   <MaterialIcons name="close" size={20} color={colors.secondaryText} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//         <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
//           <TextInput
//             style={[
//               styles.input,
//               {
//                 backgroundColor: colors.background,
//                 color: colors.text,
//                 borderColor: colors.divider,
//               },
//             ]}
//             value={newMessage}
//             onChangeText={setNewMessage}
//             placeholder="Type a message..."
//             placeholderTextColor={colors.secondaryText}
//             multiline
//           />
//           <TouchableOpacity
//             style={[
//               styles.sendButton,
//               { backgroundColor: newMessage.trim() ? colors.primary : colors.secondaryText },
//             ]}
//             onPress={handleSendMessage}
//             disabled={!newMessage.trim()}
//           >
//             <MaterialIcons name="send" size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Message Options Modal */}
//       <Modal
//         visible={showMessageOptions}
//         transparent
//         animationType="none"
//         onRequestClose={hideOptions}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={hideOptions}
//         >
//           <Animated.View
//             style={[
//               styles.optionsModal,
//               {
//                 position: 'absolute',
//                 left: optionsPosition.x,
//                 top: optionsPosition.y,
//                 transform: [
//                   {
//                     scale: modalAnimation.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [0.8, 1],
//                     }),
//                   },
//                 ],
//               },
//             ]}
//           >
//             {selectedMessage && (
//               <>
//                 {selectedMessage.senderId === 'current-user-id' && (
//                   <>
//                     <TouchableOpacity
//                       style={styles.optionItem}
//                       onPress={handleEdit}
//                     >
//                       <MaterialIcons name="edit" size={24} color={colors.text} />
//                       <Text style={[styles.optionText, { color: colors.text }]}>Edit</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.optionItem}
//                       onPress={handleDelete}
//                     >
//                       <MaterialIcons name="delete" size={24} color={colors.taskStatus.expired} />
//                       <Text style={[styles.optionText, { color: colors.taskStatus.expired }]}>Delete</Text>
//                     </TouchableOpacity>
//                   </>
//                 )}
//                 <TouchableOpacity
//                   style={styles.optionItem}
//                   onPress={handleReply}
//                 >
//                   <MaterialIcons name="reply" size={24} color={colors.text} />
//                   <Text style={[styles.optionText, { color: colors.text }]}>Reply</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Edit Message Modal */}
//       <Modal
//         visible={isEditing}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setIsEditing(false)}
//       >
//         <View style={styles.editModalOverlay}>
//           <View style={[styles.editModalContent, { backgroundColor: colors.cardBackground }]}>
//             <TextInput
//               style={[
//                 styles.editInput,
//                 {
//                   backgroundColor: colors.background,
//                   color: colors.text,
//                   borderColor: colors.divider,
//                 },
//               ]}
//               value={editingText}
//               onChangeText={setEditingText}
//               multiline
//               autoFocus
//             />
//             <View style={styles.editModalButtons}>
//               <TouchableOpacity
//                 style={[styles.editButton, { borderColor: colors.divider }]}
//                 onPress={() => setIsEditing(false)}
//               >
//                 <Text style={[styles.editButtonText, { color: colors.text }]}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.editButton, { backgroundColor: colors.primary }]}
//                 onPress={handleSaveEdit}
//               >
//                 <Text style={styles.editButtonText}>Save</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centered: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   header: {
//     padding: 16,
//     paddingTop: 64,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   headerTop: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   headerButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'center',
//     marginHorizontal: 8,
//   },
//   avatarsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarWrapper: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: 'rgba(0,0,0,0.1)',
//     overflow: 'hidden',
//   },
//   headerAvatar: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerAvatarText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   messagesList: {
//     padding: 16,
//     paddingBottom: 24,
//   },
//   messageContainer: {
//     marginBottom: 16,
//     maxWidth: '85%',
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//   },
//   sentMessage: {
//     alignSelf: 'flex-end',
//   },
//   receivedMessage: {
//     alignSelf: 'flex-start',
//   },
//   avatarContainer: {
//     width: 32,
//     height: 32,
//     marginHorizontal: 8,
//   },
//   avatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   messageContent: {
//     flex: 1,
//   },
//   senderName: {
//     fontSize: 12,
//     marginBottom: 4,
//     opacity: 0.7,
//   },
//   messageBubble: {
//     padding: 12,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   messageText: {
//     fontSize: 15,
//     lineHeight: 20,
//   },
//   timestamp: {
//     fontSize: 11,
//     marginTop: 4,
//     opacity: 0.6,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 12,
//     alignItems: 'flex-end',
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(0,0,0,0.1)',
//     paddingBottom: Platform.OS === 'ios' ? 12 : 12,
//   },
//   input: {
//     flex: 1,
//     marginRight: 8,
//     padding: 12,
//     paddingTop: 12,
//     paddingBottom: 12,
//     borderRadius: 20,
//     borderWidth: 1,
//     maxHeight: 100,
//     fontSize: 15,
//   },
//   sendButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     opacity: 0.9,
//   },
//   errorText: {
//     fontSize: 15,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   retryButton: {
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//     opacity: 0.9,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   participantsModal: {
//     width: '80%',
//     maxHeight: '80%',
//     borderRadius: 16,
//     padding: 16,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   participantsList: {
//     maxHeight: '80%',
//   },
//   participantItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   participantAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   participantAvatarText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   participantName: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   menuModal: {
//     position: 'absolute',
//     top: 100,
//     right: 16,
//     borderRadius: 12,
//     padding: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     gap: 12,
//   },
//   menuText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   messagePressed: {
//     opacity: 0.7,
//   },
//   optionsModal: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     minWidth: 150,
//   },
//   optionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     gap: 12,
//   },
//   optionText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   inputWrapper: {
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(0,0,0,0.1)',
//   },
//   replyContainer: {
//     padding: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   replyContent: {
//     flex: 1,
//   },
//   replyHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     backgroundColor: 'rgba(0,0,0,0.05)',
//     padding: 8,
//     borderRadius: 8,
//   },
//   replyInfo: {
//     flex: 1,
//     marginRight: 8,
//   },
//   replyName: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   replyMessage: {
//     fontSize: 13,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   editModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     padding: 16,
//   },
//   editModalContent: {
//     borderRadius: 12,
//     padding: 16,
//   },
//   editInput: {
//     height: 100,
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     textAlignVertical: 'top',
//   },
//   editModalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 12,
//   },
//   editButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   editButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   messageFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 4,
//   },
//   replyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   replyButtonText: {
//     fontSize: 12,
//     opacity: 0.7,
//   },
//   messageActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   deleteButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   deleteButtonText: {
//     fontSize: 12,
//     opacity: 0.7,
//   },
// }); 