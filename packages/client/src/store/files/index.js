import FilesStore from "./core/FilesStore";

// Re-export everything from the core store to maintain backward compatibility
export default FilesStore;

// Export individual modules for direct usage if needed
export { FileState } from "./modules/state/fileState";
export { SelectionState } from "./modules/state/selectionState";
export { ViewState } from "./modules/state/viewState";
export { FilterState } from "./modules/filtering/filters";
export { FileOperations } from "./modules/operations/fileOperations";
export { SocketHandler } from "./modules/socket/socketHandler";
export { RoomManager } from "./modules/rooms/roomManager";
export { ErrorHandler } from "./modules/error/errorHandler";
export { ThumbnailManager } from "./modules/thumbnails/thumbnailManager";
export { AccessManager } from "./modules/access/accessManager";
export { LoadingManager } from "./modules/loading/loadingManager";
export { HistoryManager } from "./modules/history/historyManager";
export { PluginManager } from "./modules/plugins/pluginManager";
export { SearchManager } from "./modules/search/searchManager";
export { MetadataManager } from "./modules/metadata/metadataManager";
export { SharingManager } from "./modules/sharing/sharingManager";
export { default as NotificationManager } from "./modules/notifications/notificationManager";
export { default as BatchManager } from "./modules/batch/batchManager";
export { default as QuotaManager } from "./modules/quota/quotaManager";
export { default as SettingsManager } from "./modules/settings/settingsManager";
export { default as FolderManager } from "./modules/folders/folderManager";
export { default as AuthManager } from "./modules/auth/authManager";
export { default as TrashManager } from "./modules/trash/trashManager";
export { default as TagManager } from "./modules/tags/tagManager";
export { default as VersionManager } from "./modules/versions/versionManager";
export { default as SecurityManager } from "./modules/security/securityManager";
export { default as TemplateManager } from "./modules/templates/templateManager";
export { default as WorkflowManager } from "./modules/workflow/workflowManager";
export { default as CommentManager } from "./modules/comments/commentManager";
export { default as StateManager } from "./modules/state/stateManager";
export { default as PreviewManager } from "./modules/preview/previewManager";
export { default as CacheManager } from "./modules/cache/cacheManager";
export { default as CollaborationManager } from "./modules/collaboration/collaborationManager";
export { default as IndexingManager } from "./modules/indexing/indexingManager";
