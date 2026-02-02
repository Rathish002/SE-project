/**
 * Group Members Component
 * Shows group participants and allows sending friend requests to non-friends
 */

import React, { useState, useEffect } from 'react';
import {
  subscribeToFriends,
  sendFriendRequest,
} from '../services/friendService';
import { leaveGroupChat } from '../services/chatService';
import './GroupMembers.css';

interface GroupMembersProps {
  conversationId: string;
  participants: string[];
  participantNames: string[];
  groupName: string;
  currentUid: string;
  onLeaveGroup?: () => void;
}

interface ParticipantInfo {
  uid: string;
  name: string;
  isFriend: boolean;
  friendRequestSent?: boolean;
}

const GroupMembers: React.FC<GroupMembersProps> = ({
  conversationId,
  participants,
  participantNames,
  groupName,
  currentUid,
  onLeaveGroup,
}) => {
  const [participantInfos, setParticipantInfos] = useState<ParticipantInfo[]>([]);
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Subscribe to user's friends list
  useEffect(() => {
    const unsubscribe = subscribeToFriends(currentUid, (friendList) => {
      setFriends(new Set(friendList.map(f => f.uid)));
    });
    return () => unsubscribe();
  }, [currentUid]);

  // Build participant info
  useEffect(() => {
    const buildParticipantInfo = async () => {
      const infos: ParticipantInfo[] = [];

      for (let i = 0; i < participants.length; i++) {
        const uid = participants[i];
        const name = participantNames[i] || 'User';
        const isFriend = friends.has(uid) || uid === currentUid;

        infos.push({
          uid,
          name,
          isFriend,
        });
      }

      setParticipantInfos(infos);
    };

    buildParticipantInfo();
  }, [participants, participantNames, friends, currentUid]);

  // Handle send friend request
  const handleSendFriendRequest = async (toUid: string) => {
    if (friendRequests.has(toUid)) {
      setMessage({ type: 'error', text: 'Friend request already sent' });
      return;
    }

    try {
      setIsLoading(true);
      await sendFriendRequest(currentUid, toUid);
      const newRequests = new Set(friendRequests);
      newRequests.add(toUid);
      setFriendRequests(newRequests);
      setMessage({ type: 'success', text: 'Friend request sent!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send request';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    try {
      setIsLoading(true);
      await leaveGroupChat(conversationId, currentUid);
      setMessage({ type: 'success', text: 'You left the group' });
      setTimeout(() => {
        if (onLeaveGroup) {
          onLeaveGroup();
        }
      }, 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to leave group';
      setMessage({ type: 'error', text: errorMsg });
      setIsLoading(false);
    }
  };

  return (
    <div className="group-members">
      <div className="members-header">
        <h3>Group Members</h3>
        <span className="member-count">{participants.length}</span>
      </div>

      {message && (
        <div className={`member-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="members-list">
        {participantInfos.map((participant) => (
          <div key={participant.uid} className="member-item">
            <div className="member-info">
              <div className="member-name">{participant.name}</div>
              {participant.uid === currentUid && (
                <span className="you-badge">You</span>
              )}
              {participant.isFriend && participant.uid !== currentUid && (
                <span className="friend-badge">Friend</span>
              )}
            </div>

            {!participant.isFriend && participant.uid !== currentUid && (
              <button
                className="action-btn"
                onClick={() => handleSendFriendRequest(participant.uid)}
                disabled={isLoading || friendRequests.has(participant.uid)}
                title={
                  friendRequests.has(participant.uid)
                    ? 'Friend request sent'
                    : 'Send friend request'
                }
              >
                {friendRequests.has(participant.uid)
                  ? 'Request Sent'
                  : 'Add Friend'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Leave Group Button */}
      <div className="leave-group-section">
        <button
          className="leave-group-btn"
          onClick={handleLeaveGroup}
          disabled={isLoading}
          title="Leave this group chat"
        >
          Leave Group
        </button>
      </div>
    </div>
  );
};

export default GroupMembers;
