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
  sendVideoMessage,
  sendVoiceMessage,
  sendFileMessage,
  type Message,
  type Conversation,
} from '../services/chatService';
import GroupChatSettings from './GroupChatSettings';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatLastActive } from '../utils/timeUtils';
import { blockUser, unblockUser, isUserBlocked } from '../services/blockService';
import './ChatUI.css';

interface ChatUIProps {
  conversationId: string;
  currentUser: User | null;
  onBack: () => void;
}

interface LocalMessageState {
  [messageId: string]: 'sending' | 'sent' | 'failed';
}

const ChatUI: React.FC<ChatUIProps> = ({ conversationId, currentUser, onBack }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
  const [participants, setParticipants] = useState<Array<{ uid: string; name: string; online: boolean; lastActive?: any }>>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [messageStates, setMessageStates] = useState<LocalMessageState>({});
  const [translatedMessages, setTranslatedMessages] = useState<{ [messageId: string]: string }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);
  const unsubscribeConversationRef = useRef<(() => void) | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to messages
  useEffect(() => {
    if (!currentUser?.uid) return;

    unsubscribeMessagesRef.current = subscribeToMessages(conversationId, currentUser.uid, (newMessages: Message[]) => {
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
      async (snap: any) => {
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
      (error: any) => {
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

  // Check if other user is blocked (for direct chats only)
  useEffect(() => {
    if (!currentUser?.uid || !conversation || conversation.type !== 'direct') {
      setIsBlocked(false);
      return;
    }

    const otherUid = conversation.participants.find(uid => uid !== currentUser.uid);
    if (!otherUid) return;

    isUserBlocked(currentUser.uid, otherUid).then(blocked => {
      setIsBlocked(blocked);
    });
  }, [currentUser?.uid, conversation]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || uploadingImage) return;

    try {
      setUploadingImage(true);
      await sendImageMessage(conversationId, currentUser.uid, file);
      // Clear file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || uploadingVideo) return;

    try {
      setUploadingVideo(true);
      await sendVideoMessage(conversationId, currentUser.uid, file);
      // Clear file input
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading video:', error);
      alert(error.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || uploadingFile) return;

    try {
      setUploadingFile(true);
      await sendFileMessage(conversationId, currentUser.uid, file);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording && mediaRecorder) {
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        const startTime = Date.now();

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });

          // Upload the voice message
          try {
            setUploadingVoice(true);
            await sendVoiceMessage(conversationId, currentUser!.uid, file, duration);
          } catch (error: any) {
            console.error('Error uploading voice:', error);
            alert(error.message || 'Failed to upload voice message');
          } finally {
            setUploadingVoice(false);
          }

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please grant permission.');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const tempId = `temp_${Date.now()}`;
    const textToSend = messageText;
    setMessageText('');
    setSending(true);

    // Add temporary message with 'sending' state
    setMessageStates(prev => ({ ...prev, [tempId]: 'sending' }));

    try {
      if (!currentUser?.uid) return;
      const currentLang = i18n.language || 'en';
      await sendMessage(conversationId, currentUser!.uid, textToSend, currentLang);

      // Mark as sent
      setMessageStates(prev => ({ ...prev, [tempId]: 'sent' }));
      setTimeout(() => {
        setMessageStates(prev => {
          const newState = { ...prev };
          delete newState[tempId];
          return newState;
        });
      }, 2000);

      // update lastActive on user action
      try {
        const { updateLastActive } = await import('../services/presenceService');
        await updateLastActive(currentUser!.uid);
      } catch (e) {
        // ignore
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessageStates(prev => ({ ...prev, [tempId]: 'failed' }));
      setMessageText(textToSend); // Restore message for retry
    } finally {
      setSending(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!currentUser?.uid || !conversation || conversation.type !== 'direct') return;

    const otherUid = conversation.participants.find(uid => uid !== currentUser.uid);
    if (!otherUid) return;

    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      if (isBlocked) {
        await unblockUser(currentUser.uid, otherUid);
        setIsBlocked(false);
      } else {
        await blockUser(currentUser.uid, otherUid);
        setIsBlocked(true);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Failed to ${action} user: ` + error.message);
    }
  };

  // Mock translation function (in production, use Google Translate API or similar)
  const mockTranslate = async (text: string, fromLang: string, toLang: string): Promise<string> => {
    if (!text) return text;
    if (fromLang === toLang) return text;
    return `[${toLang}] ${text}`;
  };

  const handleTranslateMessage = async (messageId: string, text: string, originalLang: string) => {
    const targetLang = i18n.language || 'en';

    // Don't translate if already in target language
    if (originalLang === targetLang) {
      alert('Message is already in your current language');
      return;
    }

    // Check if already translated
    if (translatedMessages[messageId]) {
      // Toggle back to original
      setTranslatedMessages(prev => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
      return;
    }

    try {
      const translated = await mockTranslate(text, originalLang, targetLang);
      setTranslatedMessages(prev => ({ ...prev, [messageId]: translated }));
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate message');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-ui-v2">
      <div className="chat-header-v2">
        <div className="header-left">
          <button className="chat-close-btn" onClick={onBack} title="Close chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="chat-header-info-v2">
            <h2 className="chat-title-v2">
              {conversation?.type === 'group'
                ? (conversation.groupName || conversation.participantNames.join(', '))
                : conversation?.participantNames.find((name, idx) =>
                  conversation.participants[idx] !== currentUser!.uid
                ) || t('collaboration.chat.unknownUser')
              }
            </h2>
            <div className="chat-header-status">
              <span className={`status-dot ${connectionStatus}`}></span>
              {connectionStatus === 'connected' ? t('collaboration.chat.connected') : t('collaboration.chat.reconnecting')}
            </div>
          </div>
        </div>

        <div className="header-actions">
          {conversation?.type === 'direct' && (
            <button
              className="action-icon-btn"
              onClick={handleBlockToggle}
              title={isBlocked ? 'Unblock user' : 'Block user'}
            >
              {isBlocked ? '🔓' : '🚫'}
            </button>
          )}
        </div>
      </div>

      <div className="chat-body-v2">
        <div className="chat-messages-container">
          <div className="messages-scroll-area">
            {messages.length === 0 ? (
              <div className="chat-empty-v2">
                <div className="empty-icon">✉️</div>
                <p>{t('collaboration.chat.noMessages')}</p>
              </div>
            ) : (
              messages.map((message) => {
                if (message.type === 'system') {
                  let systemText = message.text;
                  if (message.i18nKey) {
                    const interpolation: Record<string, string> = {};
                    if (message.actorUsername) interpolation.actor = message.actorUsername;
                    if (message.targetUsername) interpolation.target = message.targetUsername;
                    systemText = t(message.i18nKey, interpolation);
                  }
                  return (
                    <div key={message.id} className="system-msg-v2">
                      <span>{systemText}</span>
                    </div>
                  );
                }

                const isOwn = message.senderUid === currentUser!.uid;
                return (
                  <div
                    key={message.id}
                    className={`message-bubble-row ${isOwn ? 'own' : 'other'}`}
                  >
                    {!isOwn && <div className="message-avatar-small">{message.senderName[0]}</div>}
                    <div className="message-bubble-content">
                      {!isOwn && <div className="message-sender-name">{message.senderName}</div>}
                      <div className="message-bubble">
                        {message.type === 'image' && message.mediaUrl ? (
                          <div className="bubble-image">
                            <img src={message.mediaUrl} alt="Shared" />
                          </div>
                        ) : message.type === 'video' && message.mediaUrl ? (
                          <div className="bubble-video">
                            <video controls src={message.mediaUrl} />
                          </div>
                        ) : message.type === 'voice' && message.mediaUrl ? (
                          <div className="bubble-voice">
                            <audio controls src={message.mediaUrl} />
                          </div>
                        ) : message.type === 'file' && message.mediaUrl ? (
                          <div className="bubble-file">
                            <a href={message.mediaUrl} download={message.mediaFilename} target="_blank" rel="noopener noreferrer">
                              <span className="file-icon">📄</span>
                              <div className="file-meta">
                                <div className="file-name">{message.mediaFilename}</div>
                                <div className="file-size">{(message.mediaSize! / 1024).toFixed(1)} KB</div>
                              </div>
                            </a>
                          </div>
                        ) : (
                          <div className="bubble-text">
                            {translatedMessages[message.id] || message.text}
                          </div>
                        )}
                        
                        <div className="bubble-footer">
                          <span className="bubble-time">{formatTimestamp(message.timestamp)}</span>
                          {isOwn && messageStates[message.id] && (
                            <span className={`msg-status ${messageStates[message.id]}`}>
                              {messageStates[message.id] === 'sent' ? '✓' : '⏳'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {message.text && message.originalLang && message.originalLang !== i18n.language && (
                        <button
                          className="msg-translate-btn"
                          onClick={() => handleTranslateMessage(message.id, message.text!, message.originalLang!)}
                        >
                          {translatedMessages[message.id] ? 'Original' : 'Translate'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <aside className="chat-info-sidebar">
          {conversation?.type === 'group' ? (
            <GroupChatSettings
              conversationId={conversationId}
              participants={conversation.participants}
              participantNames={conversation.participantNames}
              groupName={conversation.groupName || 'Group'}
              currentUid={currentUser!.uid}
              onLeaveGroup={onBack}
              onMemberAdded={() => {}}
            />
          ) : (
            <div className="participants-v2">
              <h3>{t('collaboration.chat.participants')}</h3>
              <div className="participants-list-v2">
                {participants.map((p) => (
                  <div key={p.uid} className="participant-item-v2">
                    <div className={`participant-avatar ${p.online ? 'online' : ''}`}>
                      {p.name[0]}
                    </div>
                    <div className="participant-info-v2">
                      <div className="participant-name-v2">{p.name} {p.uid === currentUser?.uid && `(${t('collaboration.chat.you')})`}</div>
                      <div className="participant-status-v2">
                        {p.online ? 'Online' : formatLastActive(p.lastActive)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="chat-footer-v2">
        <div className="input-toolbar">
          <input type="file" ref={imageInputRef} accept="image/*" className="hidden-input" onChange={handleImageUpload} />
          <input type="file" ref={videoInputRef} accept="video/*" className="hidden-input" onChange={handleVideoUpload} />
          <input type="file" ref={fileInputRef} className="hidden-input" onChange={handleFileUpload} />
          
          <button className="toolbar-btn" onClick={() => imageInputRef.current?.click()} title="Image">🖼️</button>
          <button className="toolbar-btn" onClick={() => videoInputRef.current?.click()} title="Video">🎥</button>
          <button className={`toolbar-btn ${isRecording ? 'recording' : ''}`} onClick={handleVoiceRecord} title="Voice">🎤</button>
          <button className="toolbar-btn" onClick={() => fileInputRef.current?.click()} title="File">📎</button>
        </div>

        <div className="input-area-v2">
          <textarea
            className="chat-textarea-v2"
            placeholder={t('collaboration.chat.inputPlaceholder')}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
          />
          <button
            className="send-btn-v2"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? '...' : '▶'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
