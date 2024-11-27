import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class CommentManager {
  comments = new Map();
  threadedComments = new Map();
  commentDrafts = new Map();
  commentReactions = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // Comment Management
  fetchComments = async (entityId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-comments",
        () => api.comments.getComments(entityId)
      );
      this.setComments(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch comments");
      throw err;
    }
  };

  createComment = async (entityId, commentData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-comment",
        () => api.comments.createComment(entityId, commentData)
      );
      this.addComment(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create comment");
      throw err;
    }
  };

  updateComment = async (entityId, commentId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-comment",
        () => api.comments.updateComment(entityId, commentId, updates)
      );
      this.updateCommentInStore(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update comment");
      throw err;
    }
  };

  deleteComment = async (entityId, commentId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-comment",
        () => api.comments.deleteComment(entityId, commentId)
      );
      this.removeComment(entityId, commentId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete comment");
      throw err;
    }
  };

  // Comment Thread Management
  createThread = async (entityId, threadData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-thread",
        () => api.comments.createThread(entityId, threadData)
      );
      this.addThread(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create thread");
      throw err;
    }
  };

  replyToThread = async (entityId, threadId, replyData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "reply-thread",
        () => api.comments.replyToThread(entityId, threadId, replyData)
      );
      this.addReplyToThread(entityId, threadId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Reply to thread");
      throw err;
    }
  };

  // Comment Reactions
  addReaction = async (entityId, commentId, reactionData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "add-reaction",
        () => api.comments.addReaction(entityId, commentId, reactionData)
      );
      this.updateCommentReactions(entityId, commentId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Add reaction");
      throw err;
    }
  };

  removeReaction = async (entityId, commentId, reactionId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "remove-reaction",
        () => api.comments.removeReaction(entityId, commentId, reactionId)
      );
      this.deleteCommentReaction(entityId, commentId, reactionId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Remove reaction");
      throw err;
    }
  };

  // Comment Draft Management
  saveDraft = async (entityId, draftData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "save-draft",
        () => api.comments.saveDraft(entityId, draftData)
      );
      this.setCommentDraft(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Save draft");
      throw err;
    }
  };

  deleteDraft = async (entityId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-draft",
        () => api.comments.deleteDraft(entityId)
      );
      this.removeCommentDraft(entityId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete draft");
      throw err;
    }
  };

  // Local state management
  setComments = (entityId, comments) => {
    const commentMap = new Map();
    comments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        created: new Date(comment.created),
        modified: new Date(comment.modified)
      });
    });
    this.comments.set(entityId, commentMap);
  };

  addComment = (entityId, comment) => {
    const entityComments = this.comments.get(entityId) || new Map();
    entityComments.set(comment.id, {
      ...comment,
      created: new Date(comment.created),
      modified: new Date(comment.modified)
    });
    this.comments.set(entityId, entityComments);
  };

  updateCommentInStore = (entityId, comment) => {
    const entityComments = this.comments.get(entityId);
    if (entityComments) {
      entityComments.set(comment.id, {
        ...comment,
        created: new Date(comment.created),
        modified: new Date(comment.modified)
      });
    }
  };

  removeComment = (entityId, commentId) => {
    const entityComments = this.comments.get(entityId);
    if (entityComments) {
      entityComments.delete(commentId);
      if (entityComments.size === 0) {
        this.comments.delete(entityId);
      }
    }
  };

  addThread = (entityId, thread) => {
    const entityThreads = this.threadedComments.get(entityId) || new Map();
    entityThreads.set(thread.id, {
      ...thread,
      created: new Date(thread.created),
      replies: []
    });
    this.threadedComments.set(entityId, entityThreads);
  };

  addReplyToThread = (entityId, threadId, reply) => {
    const entityThreads = this.threadedComments.get(entityId);
    if (entityThreads) {
      const thread = entityThreads.get(threadId);
      if (thread) {
        thread.replies.push({
          ...reply,
          created: new Date(reply.created)
        });
      }
    }
  };

  updateCommentReactions = (entityId, commentId, reactions) => {
    const entityReactions = this.commentReactions.get(entityId) || new Map();
    entityReactions.set(commentId, reactions);
    this.commentReactions.set(entityId, entityReactions);
  };

  deleteCommentReaction = (entityId, commentId, reactionId) => {
    const entityReactions = this.commentReactions.get(entityId);
    if (entityReactions) {
      const commentReactions = entityReactions.get(commentId);
      if (commentReactions) {
        const updatedReactions = commentReactions.filter(r => r.id !== reactionId);
        entityReactions.set(commentId, updatedReactions);
      }
    }
  };

  setCommentDraft = (entityId, draft) => {
    this.commentDrafts.set(entityId, {
      ...draft,
      lastSaved: new Date(draft.lastSaved)
    });
  };

  removeCommentDraft = (entityId) => {
    this.commentDrafts.delete(entityId);
  };

  // Computed values
  getComments = (entityId) => {
    const entityComments = this.comments.get(entityId);
    return entityComments ? Array.from(entityComments.values()) : [];
  };

  getThreadedComments = (entityId) => {
    const entityThreads = this.threadedComments.get(entityId);
    return entityThreads ? Array.from(entityThreads.values()) : [];
  };

  getCommentReactions = (entityId, commentId) => {
    const entityReactions = this.commentReactions.get(entityId);
    return entityReactions ? (entityReactions.get(commentId) || []) : [];
  };

  getCommentDraft = (entityId) => {
    return this.commentDrafts.get(entityId);
  };

  clearAll = () => {
    this.comments.clear();
    this.threadedComments.clear();
    this.commentDrafts.clear();
    this.commentReactions.clear();
  };
}

export default CommentManager;
