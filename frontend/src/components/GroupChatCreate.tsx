/**
 * Group Chat Create Component
 * Allows users to create a new group conversation by selecting friends and non-friends
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createGroupConversation } from '../services/chatService';
import { subscribeToFriends, type Friend } from '../services/friendService';
import { searchUsersByEmail } from '../services/friendService';
import './GroupChatCreate.css';

interface GroupChatCreateProps {
  currentUid: string;
  onGroupCreated: (conversationId: string) => void;
  onCancel: () => void;
}

const GroupChatCreate: React.FC<GroupChatCreateProps> = ({
  currentUid,
  onGroupCreated,
  onCancel,
}) => {
  const { t } = useTranslation();

  // State
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [addedNonFriends, setAddedNonFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Subscribe to friends
  useEffect(() => {
    const unsubscribe = subscribeToFriends(currentUid, (friendList) => {
      setFriends(friendList);
    });
    return () => unsubscribe();
  }, [currentUid]);

  // Handle search for non-friends
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await searchUsersByEmail(searchQuery, currentUid);
      
      // Filter out friends and already added non-friends
      const friendUids = new Set(friends.map(f => f.uid));
      const nonFriendUids = new Set(addedNonFriends.map(nf => nf.uid));
      
      const filtered = results.filter(
        result => !friendUids.has(result.uid) && !nonFriendUids.has(result.uid)
      );
      
      setSearchResults(filtered);
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle friend selection
  const toggleFriend = (friendUid: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendUid)) {
      newSelected.delete(friendUid);
    } else {
      newSelected.add(friendUid);
    }
    setSelectedFriends(newSelected);
  };

  // Add non-friend to group
  const addNonFriend = (user: any) => {
    setAddedNonFriends([...addedNonFriends, user]);
    setSearchResults(searchResults.filter(r => r.uid !== user.uid));
    setSearchQuery('');
  };

  // Remove non-friend from group
  const removeNonFriend = (uid: string) => {
    setAddedNonFriends(addedNonFriends.filter(nf => nf.uid !== uid));
  };

  // Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedFriends.size + addedNonFriends.length === 0) {
      setError('Add at least one person to the group');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const participantUids = [
        ...Array.from(selectedFriends),
        ...addedNonFriends.map(nf => nf.uid),
      ];

      const conversationId = await createGroupConversation(
        currentUid,
        participantUids,
        groupName
      );

      onGroupCreated(conversationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create group';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalParticipants = selectedFriends.size + addedNonFriends.length + 1; // +1 for current user

  return (
    <div className="group-chat-create">
      <div className="group-create-modal">
        <div className="create-header">
          <h2>Create Group Chat</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="create-body">
          {/* Group Name */}
          <div className="form-group">
            <label htmlFor="group-name">Group Name</label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="form-input"
              disabled={isLoading}
            />
            <small>Name visible to all participants</small>
          </div>

          {/* Friends Section */}
          <div className="form-group">
            <label>Select Friends</label>
            <div className="participants-list">
              {friends.length === 0 ? (
                <p className="no-items">No friends yet. Add friends to create a group!</p>
              ) : (
                friends.map(friend => (
                  <div
                    key={friend.uid}
                    className={`participant-item ${selectedFriends.has(friend.uid) ? 'selected' : ''}`}
                    onClick={() => toggleFriend(friend.uid)}
                  >
                    <div className="participant-info">
                      <div className="participant-name">{friend.name}</div>
                      <div className="participant-email">{friend.email}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedFriends.has(friend.uid)}
                      onChange={() => {}}
                      aria-label={`Select ${friend.name}`}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Non-Friends Section */}
          <div className="form-group">
            <label>Add Non-Friends</label>
            <div className="search-section">
              {!showSearch ? (
                <button
                  className="add-btn"
                  onClick={() => setShowSearch(true)}
                  disabled={isLoading}
                >
                  + Add by Email
                </button>
              ) : (
                <div className="search-box">
                  <input
                    type="email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email..."
                    className="form-input"
                    disabled={isLoading}
                  />
                  <button
                    className="search-btn"
                    onClick={handleSearch}
                    disabled={isLoading || !searchQuery.trim()}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div key={user.uid} className="search-result-item">
                      <div className="result-info">
                        <div className="result-name">{user.name}</div>
                        <div className="result-email">{user.email}</div>
                      </div>
                      <button
                        className="add-user-btn"
                        onClick={() => addNonFriend(user)}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Added Non-Friends */}
              {addedNonFriends.length > 0 && (
                <div className="added-users">
                  <p className="added-label">Added (will receive group invitation):</p>
                  {addedNonFriends.map(user => (
                    <div key={user.uid} className="added-user-item">
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <span className="invitation-badge">Invited</span>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeNonFriend(user.uid)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Participants Summary */}
          <div className="participants-summary">
            <p>
              Total participants: <strong>{totalParticipants}</strong>
              {totalParticipants > 0 && (
                <small> (You + {totalParticipants - 1})</small>
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="create-footer">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn-create"
            onClick={handleCreateGroup}
            disabled={
              isLoading ||
              !groupName.trim() ||
              selectedFriends.size + addedNonFriends.length === 0
            }
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatCreate;
