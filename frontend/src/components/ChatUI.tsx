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
<<<<<<< HEAD
  const [isBlocked, setIsBlocked] = useState(false);
=======
  const [translatedMessages, setTranslatedMessages] = useState<{ [messageId: string]: string }>({});
>>>>>>> collaboration-groupchat-message-translation
  
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

    setSending(true);
    try {
      if (!currentUser?.uid) return;
      const currentLang = i18n.language || 'en';
      await sendMessage(conversationId, currentUser!.uid, messageText, currentLang);
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

<<<<<<< HEAD
  const handleBlockToggle = async () => {
    if (!currentUser?.uid || !conversation || conversation.type !== 'direct') return;

    const otherUid = conversation.participants.find(uid => uid !== currentUser.uid);
    if (!otherUid) return;

    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
=======
  // Mock translation function (in production, use Google Translate API or similar)
  const mockTranslate = async (text: string, fromLang: string, toLang: string): Promise<string> => {
    // Simple mock: just add a prefix to show translation happened
    return `[Translated from ${fromLang} to ${toLang}] ${text}`;
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
>>>>>>> collaboration-groupchat-message-translation
      return;
    }

    try {
<<<<<<< HEAD
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
=======
      const translated = await mockTranslate(text, originalLang, targetLang);
      setTranslatedMessages(prev => ({ ...prev, [messageId]: translated }));
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate message');
>>>>>>> collaboration-groupchat-message-translation
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
        {/* Show block/unblock button for direct chats only */}
        {conversation?.type === 'direct' && (
          <button 
            className="chat-block-button" 
            onClick={handleBlockToggle}
            title={isBlocked ? 'Unblock user' : 'Block user'}
          >
            {isBlocked ? '🔓' : '🚫'}
          </button>
        )}
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
                  role="article"
                  aria-label={`Message from ${message.senderName} at ${formatTimestamp(message.timestamp)}`}
                >
                  <div className="chat-message-header">
                    <span className="chat-message-sender">{message.senderName}</span>
                    <span className="chat-message-time">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  {message.type === 'image' && message.mediaUrl ? (
                    <div className="chat-message-image">
                      <img src={message.mediaUrl} alt={`Shared by ${message.senderName}`} />
                    </div>
                  ) : message.type === 'video' && message.mediaUrl ? (
                    <div className="chat-message-video">
                      <video controls src={message.mediaUrl} aria-label={`Video shared by ${message.senderName}`}>
                        Your browser does not support video playback.
                      </video>
                    </div>
                  ) : message.type === 'voice' && message.mediaUrl ? (
                    <div className="chat-message-voice">
                      <audio controls src={message.mediaUrl} aria-label={`Voice message from ${message.senderName}`}>
                        Your browser does not support audio playback.
                      </audio>
                      {message.mediaDuration && (
                        <span className="voice-duration">{Math.floor(message.mediaDuration)}s</span>
                      )}
                    </div>
                  ) : message.type === 'file' && message.mediaUrl ? (
                    <div className="chat-message-file">
                      <a href={message.mediaUrl} download={message.mediaFilename} target="_blank" rel="noopener noreferrer">
                        <div className="file-icon">📄</div>
                        <div className="file-info">
                          <div className="file-name">{message.mediaFilename}</div>
                          <div className="file-size">{(message.mediaSize! / 1024).toFixed(1)} KB</div>
                        </div>
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="chat-message-text">
                        {translatedMessages[message.id] || message.text}
                      </div>
                      {message.text && message.originalLang && message.originalLang !== i18n.language && (
                        <button
                          className="translate-button"
                          onClick={() => handleTranslateMessage(message.id, message.text!, message.originalLang!)}
                          title={translatedMessages[message.id] ? 'Show original' : 'Translate'}
                        >
                          {translatedMessages[message.id] ? '🔄 Original' : '🌐 Translate'}
                        </button>
                      )}
                    </>
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
        <div className="keyboard-hint" role="note" aria-label="Keyboard shortcuts">
          Press Enter to send, Shift+Enter for new line
        </div>
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <input
          type="file"
          ref={videoInputRef}
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleVideoUpload}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          className="chat-attach-button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImage || uploadingVideo || uploadingVoice || uploadingFile || sending || isRecording}
          title="Upload image"
          aria-label="Upload image"
        >
          🖼️
        </button>
        <button
          className="chat-attach-button"
          onClick={() => videoInputRef.current?.click()}
          disabled={uploadingImage || uploadingVideo || uploadingVoice || uploadingFile || sending || isRecording}
          title="Upload video"
          aria-label="Upload video"
        >
          🎥
        </button>
        <button
          className={`chat-attach-button ${isRecording ? 'recording' : ''}`}
          onClick={handleVoiceRecord}
          disabled={uploadingImage || uploadingVideo || uploadingVoice || uploadingFile || sending}
          title={isRecording ? 'Stop recording' : 'Record voice message'}
          aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>
        <button
          className="chat-attach-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage || uploadingVideo || uploadingVoice || uploadingFile || sending || isRecording}
          title="Upload document"
          aria-label="Upload document"
        >
          📎
        </button>
        <textarea
          className="chat-input"
          placeholder={t('collaboration.chat.inputPlaceholder')}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={sending || uploadingImage || uploadingVideo || uploadingVoice || uploadingFile || isRecording}
          rows={1}
          aria-label="Type a message"
        />
        <button
          className="chat-send-button"
          onClick={handleSendMessage}
          disabled={sending || uploadingImage || uploadingVideo || uploadingVoice || uploadingFile || isRecording || !messageText.trim()}
          aria-label="Send message"
        >
          {uploadingImage || uploadingVideo || uploadingVoice || uploadingFile ? 'Uploading...' : isRecording ? 'Recording...' : sending ? t('collaboration.chat.sending') : t('collaboration.chat.send')}
        </button>
      </div>
    </div>
  );
};

export default ChatUI;
