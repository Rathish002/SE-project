/**
 * Group Chat Settings Component
 * Allows adding friends to group and leaving the group
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  subscribeToFriends,
  type Friend,
} from '../services/friendService';
import { leaveGroupChat, addMemberToGroup } from '../services/chatService';
import { subscribeToBlockedUsers } from '../services/blockService';
import './GroupChatSettings.css';

interface GroupChatSettingsProps {
  conversationId: string;
  participants: string[];
  participantNames: string[];
  groupName: string;
  currentUid: string;
  onLeaveGroup?: () => void;
  onMemberAdded?: (addedMembers: Array<{ uid: string; name: string }>) => void;
}

interface AddableFriend {
  uid: string;
  name: string;
  canAdd: boolean;
  reason?: string; // Reason why can't add (blocked, already member)
}

const GroupChatSettings: React.FC<GroupChatSettingsProps> = ({
  conversationId,
  participants,
  participantNames,
  groupName,
  currentUid,
  onLeaveGroup,
  onMemberAdded,
}) => {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [addableFriends, setAddableFriends] = useState<AddableFriend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  // Subscribe to user's friends list
  useEffect(() => {
    const unsubscribe = subscribeToFriends(currentUid, (friendList) => {
      setFriends(friendList);
    });
    return () => unsubscribe();
  }, [currentUid]);

  // Subscribe to blocked users
  useEffect(() => {
    const unsubscribe = subscribeToBlockedUsers(currentUid, (blockedUids) => {
      setBlockedUsers(new Set(blockedUids));
    });
    return () => unsubscribe();
  }, [currentUid]);

  // Build list of addable friends
  useEffect(() => {
    const buildAddableFriends = () => {
      const participantSet = new Set(participants);
      const addable: AddableFriend[] = [];

      for (const friend of friends) {
        if (friend.uid === currentUid) {
          continue; // Skip self
        }

        if (participantSet.has(friend.uid)) {
          addable.push({
            uid: friend.uid,
            name: friend.name || 'User',
            canAdd: false,
            reason: 'Already in group',
          });
          continue;
        }

        if (blockedUsers.has(friend.uid)) {
          addable.push({
            uid: friend.uid,
            name: friend.name || 'User',
            canAdd: false,
            reason: 'Blocked user',
          });
          continue;
        }

        addable.push({
          uid: friend.uid,
          name: friend.name || 'User',
          canAdd: true,
        });
      }

      setAddableFriends(addable);
    };

    buildAddableFriends();
  }, [friends, participants, blockedUsers, currentUid]);

  // Handle add members
  const handleAddMembers = async () => {
    if (selectedFriends.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one friend' });
      return;
    }

    try {
      setIsLoading(true);
      
      // Add each selected friend
      const selectedArray = Array.from(selectedFriends);
      const addedMembers: Array<{ uid: string; name: string }> = [];
      
      for (const uid of selectedArray) {
        await addMemberToGroup(conversationId, uid, currentUid);
        const friendData = addableFriends.find((f) => f.uid === uid);
        if (friendData) {
          addedMembers.push({ uid: friendData.uid, name: friendData.name });
        }
      }

      const count = selectedFriends.size;
      setMessage({
        type: 'success',
        text: `Added ${count} member${count > 1 ? 's' : ''} to the group`,
      });
      
      // Filter out added members from the list immediately
      setAddableFriends((prev) =>
        prev.filter((friend) => !selectedFriends.has(friend.uid))
      );
      setSelectedFriends(new Set());
      // Keep panel open so user can see the updated list
      setTimeout(() => setMessage(null), 3000);
      
      if (onMemberAdded) {
        onMemberAdded(addedMembers);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add member';
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

  // Toggle friend selection
  const toggleFriendSelection = (uid: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(uid)) {
      newSelected.delete(uid);
    } else {
      newSelected.add(uid);
    }
    setSelectedFriends(newSelected);
  };

  // Count addable friends (not already members or blocked)
  const addableCount = addableFriends.filter(f => f.canAdd).length;

  return (
    <div className="group-chat-settings">
      {message && (
        <div className={`settings-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Add Members Button */}
      {addableCount > 0 && (
        <button
          className="add-members-btn"
          onClick={() => setShowAddMembers(!showAddMembers)}
          disabled={isLoading}
          title="Add friends to this group"
        >
          {showAddMembers ? 'Hide Add Members' : `Add Members (${addableCount})`}
        </button>
      )}

      {/* Add Members List */}
      {showAddMembers && (
        <div className="add-members-panel">
          <div className="add-members-header">
            <h4>Add Friends to Group</h4>
            <span className="selected-count">
              {selectedFriends.size > 0 && `${selectedFriends.size} selected`}
            </span>
          </div>

          <div className="add-members-list">
            {addableFriends.length === 0 ? (
              <div className="add-members-empty">
                {t('collaboration.group.noAddableFriends')}
              </div>
            ) : (
              addableFriends.map((friend) => (
                <div
                  key={friend.uid}
                  className={`add-member-item ${!friend.canAdd ? 'disabled' : ''}`}
                >
                  <label className="member-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFriends.has(friend.uid)}
                      onChange={() => toggleFriendSelection(friend.uid)}
                      disabled={!friend.canAdd || isLoading}
                    />
                    <span className="member-label">
                      {friend.name}
                      {friend.reason && (
                        <span className="member-reason">{friend.reason}</span>
                      )}
                    </span>
                  </label>
                </div>
              ))
            )}
          </div>

          {selectedFriends.size > 0 && (
            <button
              className="confirm-add-btn"
              onClick={handleAddMembers}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : `Add ${selectedFriends.size} Member${selectedFriends.size > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}

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

export default GroupChatSettings;
