import { makeAutoObservable } from "mobx";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";

export class SocketHandler {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.socket = new SocketHelper();
    
    makeAutoObservable(this, {
      rootStore: false,
      socket: false,
    });

    this.initSocketEvents();
  }

  initSocketEvents = () => {
    this.socket.on(SocketEvents.FILE_CREATED, this.handleFileCreated);
    this.socket.on(SocketEvents.FILE_UPDATED, this.handleFileUpdated);
    this.socket.on(SocketEvents.FILE_DELETED, this.handleFileDeleted);
    this.socket.on(SocketEvents.FILES_MOVED, this.handleFilesMoved);
    this.socket.on(SocketEvents.FILES_COPIED, this.handleFilesCopied);
  };

  handleFileCreated = (data) => {
    const { file } = data;
    if (file.folderId === this.rootStore.selectedFolderStore.id) {
      this.rootStore.fileState.addFile(file);
    }
  };

  handleFileUpdated = (data) => {
    const { file } = data;
    if (file.folderId === this.rootStore.selectedFolderStore.id) {
      this.rootStore.fileState.updateFile(file.id, file);
    }
  };

  handleFileDeleted = (data) => {
    const { fileId } = data;
    this.rootStore.fileState.removeFile(fileId);
    
    const selectedItem = this.rootStore.selectionState.selection.find(
      (item) => item.id === fileId
    );
    
    if (selectedItem) {
      this.rootStore.selectionState.removeFromSelection(fileId);
    }
  };

  handleFilesMoved = (data) => {
    const { fileIds, destFolderId } = data;
    if (destFolderId !== this.rootStore.selectedFolderStore.id) {
      fileIds.forEach(id => {
        this.rootStore.fileState.removeFile(id);
      });
    }
  };

  handleFilesCopied = async (data) => {
    const { destFolderId } = data;
    if (destFolderId === this.rootStore.selectedFolderStore.id) {
      await this.rootStore.fileOperations.fetchFiles();
    }
  };

  disconnect = () => {
    this.socket.disconnect();
  };

  reconnect = () => {
    this.socket.connect();
    this.initSocketEvents();
  };
}

export default SocketHandler;
