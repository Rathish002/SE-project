/**
 * Chat UI Component
 * Real-time chat interface for conversations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { 
  subscribeToMessages, 
  sendMessage,
  sendImageMessage,
  type Message,
  type Conversation,
} from '../services/chatService';
import GroupChatSettings from './GroupChatSettings';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatLastActive } from '../utils/timeUtils';
import './ChatUI.css';

interface ChatUIProps {
  conversationId: string;
  currentUser: User | null;
  onBack: () => void;
}

const ChatUI: React.FC<ChatUIProps> = ({ conversationId, currentUser, onBack }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
  const [participants, setParticipants] = useState<Array<{ uid: string; name: string; online: boolean; lastActive?: any }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);
  const unsubscribeConversationRef = useRef<(() => void) | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to messages
  useEffect(() => {
    unsubscribeMessagesRef.current = subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      setConnectionStatus('connected');
    });

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
    };
  }, [conversationId]);

  // Subscribe to conversation
  useEffect(() => {
    const conversationRef = doc(db, 'conversations', conversationId);
    unsubscribeConversationRef.current = onSnapshot(
      conversationRef,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setConversation({
            id: snap.id,
            type: data.type,
            participants: data.participants,
            participantNames: data.participantNames || [],
            groupName: data.groupName,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });

          // Get presence for participants
          const participantData = await Promise.all(
            data.participants.map(async (uid: string) => {
              const presenceRef = doc(db, 'presence', uid);
              const presenceSnap = await getDoc(presenceRef);
              const presence = presenceSnap.data();
              return {
                uid,
                name: data.participantNames?.[data.participants.indexOf(uid)] || 'User',
                online: presence?.online || false,
                lastActive: presence?.lastActive,
              };
            })
          );
          setParticipants(participantData);
        }
      },
      (error) => {
        console.error('Conversation subscription error:', error);
        setConnectionStatus('reconnecting');
      }
    );

    return () => {
      if (unsubscribeConversationRef.current) {
        unsubscribeConversationRef.current();
      }
    };
  }, [conversationId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || uploadingImage) return;

    try {
      setUploadingImage(true);
      await sendImageMessage(conversationId, currentUser.uid, file);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      if (!currentUser?.uid) return;
      await sendMessage(conversationId, currentUser!.uid, messageText);
      setMessageText('');
      // update lastActive on user action
      try {
        const { updateLastActive } = await import('../services/presenceService');
        await updateLastActive(currentUser!.uid);
      } catch (e) {
        // ignore
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(t('collaboration.chat.sendError'));
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-ui">
      <div className="chat-header">
        <button className="chat-back-button" onClick={onBack}>
          ??? {t('app.back')}
        </button>
        <div className="chat-header-info">
          <h2 className="chat-title">
            {conversation?.type === 'group' 
              ? (conversation.groupName || conversation.participantNames.join(', '))
              : conversation?.participantNames.find((name, idx) => 
                  conversation.participants[idx] !== currentUser!.uid
                ) || t('collaboration.chat.unknownUser')
            }
          </h2>
          <div className="chat-status">
            <span className={`chat-status-indicator ${connectionStatus === 'connected' ? 'connected' : 'reconnecting'}`}></span>
            {connectionStatus === 'connected' 
              ? t('collaboration.chat.connected')
              : t('collaboration.chat.reconnecting')
            }
          </div>
        </div>
      </div>

      <div className="chat-content">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <p>{t('collaboration.chat.noMessages')}</p>
            </div>
          ) : (
            messages.map((message) => {
              // System messages (joins, leaves) have distinct styling
              if (message.type === 'system') {
                // Render system message with i18n key and interpolation
                let systemText = message.text;
                if (message.i18nKey) {
                  const interpolation: Record<string, string> = {};
                  if (message.actorUsername) {
                    interpolation.actor = message.actorUsername;
                  }
                  if (message.targetUsername) {
                    interpolation.target = message.targetUsername;
                  }
                  systemText = t(message.i18nKey, interpolation);
                }
                return (
                  <div key={message.id} className="chat-message system-message">
                    <div className="system-message-content">{systemText}</div>
                  </div>
                );
              }

              // Regular user messages (text or image)
              return (
                <div
                  key={message.id}
                  className={`chat-message ${message.senderUid === currentUser!.uid ? 'own' : 'other'}`}
                >
                  <div className="chat-message-header">
                    <span className="chat-message-sender">{message.senderName}</span>
                    <span className="chat-message-time">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  {message.type === 'image' && message.mediaUrl ? (
                    <div className="chat-message-image">
                      <img src={message.mediaUrl} alt="" />
                    </div>
                  ) : (
                    <div className="chat-message-text">{message.text}</div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-sidebar">
          {/* For group chats, show GroupChatSettings component */}
          {conversation?.type === 'group' ? (
            <GroupChatSettings
              conversationId={conversationId}
              participants={conversation.participants}
              participantNames={conversation.participantNames}
              groupName={conversation.groupName || 'Group'}
              currentUid={currentUser!.uid}
              onLeaveGroup={onBack}
              onMemberAdded={() => {
                // Refresh conversation to get updated participants
                if (conversationId) {
                  const ref = doc(db, 'conversations', conversationId);
                  onSnapshot(ref, (snap) => {
                    if (snap.exists()) {
                      setConversation({
                        id: snap.id,
                        ...snap.data() as Omit<typeof conversation, 'id'>,
                      });
                    }
                  });
                }
              }}
            />
          ) : (
            <>
              <h3 className="chat-sidebar-title">{t('collaboration.chat.participants')}</h3>
              <div className="chat-participants">
                {participants.map((participant) => (
                  <div key={participant.uid} className="chat-participant">
                    <span className={`chat-participant-status ${participant.online ? 'online' : 'offline'}`}></span>
                    <div className="chat-participant-info">
                      <span className="chat-participant-name">{participant.name}</span>
                      {!participant.online && participant.lastActive && (
                        <span className="chat-participant-lastactive">
                          {formatLastActive(participant.lastActive)}
                        </span>
                      )}
                      {participant.uid === currentUser!.uid && (
                        <span className="chat-participant-you">({t('collaboration.chat.you')})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="chat-input-container">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          className="chat-attach-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage || sending}
          title="Upload image"
        >
          📎
        </button>
        <input
          type="text"
          className="chat-input"
          placeholder={t('collaboration.chat.inputPlaceholder')}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={sending || uploadingImage}
        />
        <button
          className="chat-send-button"
          onClick={handleSendMessage}
          disabled={sending || uploadingImage || !messageText.trim()}
        >
          {uploadingImage ? 'Uploading...' : sending ? t('collaboration.chat.sending') : t('collaboration.chat.send')}
        </button>
      </div>
    </div>
  );
};

export default ChatUI;
