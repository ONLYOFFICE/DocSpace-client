import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class CollaborationManager {
  activeCollaborators = new Map();
  documentLocks = new Map();
  userPresence = new Map();
  collaborationSessions = new Map();
  cursors = new Map();
  selections = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // Session Management
  joinSession = async (documentId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `join-session-${documentId}`,
        () => api.collaboration.joinSession(documentId)
      );
      
      this.setCollaborationSession(documentId, response.data);
      await this.syncDocument(documentId);
      this.startHeartbeat(documentId);
      
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Join collaboration session");
      throw err;
    }
  };

  leaveSession = async (documentId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `leave-session-${documentId}`,
        () => api.collaboration.leaveSession(documentId)
      );
      
      this.cleanupSession(documentId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Leave collaboration session");
      throw err;
    }
  };

  // Document Synchronization
  syncDocument = async (documentId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `sync-document-${documentId}`,
        () => api.collaboration.syncDocument(documentId)
      );
      
      this.updateCollaborators(documentId, response.data.collaborators);
      this.updateLocks(documentId, response.data.locks);
      this.updatePresence(documentId, response.data.presence);
      
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Sync document");
      throw err;
    }
  };

  // Lock Management
  acquireLock = async (documentId, section) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `acquire-lock-${documentId}-${section}`,
        () => api.collaboration.acquireLock(documentId, section)
      );
      
      this.addLock(documentId, section, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Acquire lock");
      throw err;
    }
  };

  releaseLock = async (documentId, section) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `release-lock-${documentId}-${section}`,
        () => api.collaboration.releaseLock(documentId, section)
      );
      
      this.removeLock(documentId, section);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Release lock");
      throw err;
    }
  };

  // Presence Management
  updatePresenceStatus = async (documentId, status) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `update-presence-${documentId}`,
        () => api.collaboration.updatePresence(documentId, status)
      );
      
      this.setUserPresence(documentId, this.rootStore.authStore.userId, status);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update presence");
      throw err;
    }
  };

  // Cursor and Selection Management
  updateCursor = async (documentId, position) => {
    try {
      await api.collaboration.updateCursor(documentId, position);
      this.setCursor(documentId, this.rootStore.authStore.userId, position);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update cursor");
      throw err;
    }
  };

  updateSelection = async (documentId, range) => {
    try {
      await api.collaboration.updateSelection(documentId, range);
      this.setSelection(documentId, this.rootStore.authStore.userId, range);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update selection");
      throw err;
    }
  };

  // Local State Management
  setCollaborationSession = (documentId, session) => {
    this.collaborationSessions.set(documentId, {
      ...session,
      joined: new Date()
    });
  };

  updateCollaborators = (documentId, collaborators) => {
    this.activeCollaborators.set(documentId, new Map(
      collaborators.map(c => [c.userId, {
        ...c,
        lastActive: new Date(c.lastActive)
      }])
    ));
  };

  addCollaborator = (documentId, collaborator) => {
    const collaborators = this.activeCollaborators.get(documentId) || new Map();
    collaborators.set(collaborator.userId, {
      ...collaborator,
      lastActive: new Date(collaborator.lastActive)
    });
    this.activeCollaborators.set(documentId, collaborators);
  };

  removeCollaborator = (documentId, userId) => {
    const collaborators = this.activeCollaborators.get(documentId);
    if (collaborators) {
      collaborators.delete(userId);
    }
  };

  updateLocks = (documentId, locks) => {
    this.documentLocks.set(documentId, new Map(
      locks.map(l => [l.section, {
        ...l,
        acquired: new Date(l.acquired)
      }])
    ));
  };

  addLock = (documentId, section, lock) => {
    const locks = this.documentLocks.get(documentId) || new Map();
    locks.set(section, {
      ...lock,
      acquired: new Date(lock.acquired)
    });
    this.documentLocks.set(documentId, locks);
  };

  removeLock = (documentId, section) => {
    const locks = this.documentLocks.get(documentId);
    if (locks) {
      locks.delete(section);
    }
  };

  setUserPresence = (documentId, userId, status) => {
    const presence = this.userPresence.get(documentId) || new Map();
    presence.set(userId, {
      ...status,
      timestamp: new Date()
    });
    this.userPresence.set(documentId, presence);
  };

  setCursor = (documentId, userId, position) => {
    const documentCursors = this.cursors.get(documentId) || new Map();
    documentCursors.set(userId, {
      position,
      timestamp: new Date()
    });
    this.cursors.set(documentId, documentCursors);
  };

  setSelection = (documentId, userId, range) => {
    const documentSelections = this.selections.get(documentId) || new Map();
    documentSelections.set(userId, {
      range,
      timestamp: new Date()
    });
    this.selections.set(documentId, documentSelections);
  };

  // Heartbeat Management
  startHeartbeat = (documentId) => {
    const session = this.collaborationSessions.get(documentId);
    if (session && !session.heartbeatInterval) {
      session.heartbeatInterval = setInterval(async () => {
        try {
          await api.collaboration.heartbeat(documentId);
        } catch (err) {
          console.error("Heartbeat failed:", err);
        }
      }, 30000); // 30 seconds
    }
  };

  stopHeartbeat = (documentId) => {
    const session = this.collaborationSessions.get(documentId);
    if (session && session.heartbeatInterval) {
      clearInterval(session.heartbeatInterval);
      session.heartbeatInterval = null;
    }
  };

  // Session Cleanup
  cleanupSession = (documentId) => {
    this.stopHeartbeat(documentId);
    this.activeCollaborators.delete(documentId);
    this.documentLocks.delete(documentId);
    this.userPresence.delete(documentId);
    this.collaborationSessions.delete(documentId);
    this.cursors.delete(documentId);
    this.selections.delete(documentId);
  };

  // Computed Values
  getCollaborators = (documentId) => {
    const collaborators = this.activeCollaborators.get(documentId);
    return collaborators ? Array.from(collaborators.values()) : [];
  };

  getLocks = (documentId) => {
    const locks = this.documentLocks.get(documentId);
    return locks ? Array.from(locks.values()) : [];
  };

  getPresence = (documentId) => {
    const presence = this.userPresence.get(documentId);
    return presence ? Array.from(presence.entries()).map(([userId, status]) => ({
      userId,
      ...status
    })) : [];
  };

  getCursors = (documentId) => {
    const cursors = this.cursors.get(documentId);
    return cursors ? Array.from(cursors.entries()).map(([userId, data]) => ({
      userId,
      ...data
    })) : [];
  };

  getSelections = (documentId) => {
    const selections = this.selections.get(documentId);
    return selections ? Array.from(selections.entries()).map(([userId, data]) => ({
      userId,
      ...data
    })) : [];
  };

  isDocumentLocked = (documentId, section) => {
    const locks = this.documentLocks.get(documentId);
    return locks ? locks.has(section) : false;
  };

  // Cleanup
  clearAll = () => {
    for (const [documentId] of this.collaborationSessions) {
      this.cleanupSession(documentId);
    }
    this.activeCollaborators.clear();
    this.documentLocks.clear();
    this.userPresence.clear();
    this.collaborationSessions.clear();
    this.cursors.clear();
    this.selections.clear();
  };
}

export default CollaborationManager;
