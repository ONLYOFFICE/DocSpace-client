import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
// import { toastr } from "@docspace/shared/components/toast";
// import { RoomsType, RoomsProviderType } from "@docspace/shared/enums";
import { isLockedSharedRoom } from "@docspace/shared/utils/rooms";
import { isPublicRoom } from "@docspace/shared/utils/location";

export class RoomManager {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
    });
  }

  fetchRooms = async () => {
    const { filterState } = this.rootStore;

    try {
      const response = await api.rooms.getRooms(filterState.currentRoomsFilter);
      const { rooms, ...filterData } = response.data;

      filterState.setRoomsFilter(filterData);
      this.rootStore.fileState.setFolders(rooms);
    } catch (err) {
      console.error("Fetch rooms error:", err);
      // toastr.error(err); // TODO: Add toastr
      throw err;
    }
  };

  createRoom = async (roomData) => {
    try {
      const response = await api.rooms.createRoom(roomData);
      const newRoom = response.data;
      this.rootStore.fileState.addFolder(newRoom);
      return newRoom;
    } catch (err) {
      console.error("Create room error:", err);
      // toastr.error(err); // TODO: Add toastr
      throw err;
    }
  };

  updateRoom = async (roomId, updates) => {
    try {
      const response = await api.rooms.updateRoom(roomId, updates);
      const updatedRoom = response.data;
      this.rootStore.fileState.updateFolder(roomId, updatedRoom);
      return updatedRoom;
    } catch (err) {
      console.error("Update room error:", err);
      // toastr.error(err); // TODO: Add toastr
      throw err;
    }
  };

  deleteRoom = async (roomId) => {
    try {
      await api.rooms.deleteRoom(roomId);
      this.rootStore.fileState.removeFolder(roomId);
      this.rootStore.selectionState.clearSelection();
    } catch (err) {
      console.error("Delete room error:", err);
      // toastr.error(err); // TODO: Add toastr
      throw err;
    }
  };

  fetchRoomMembers = async (roomId) => {
    const { filterState } = this.rootStore;

    try {
      const response = await api.rooms.getRoomMembers(
        roomId,
        filterState.currentMembersFilter,
      );
      return response.data;
    } catch (err) {
      console.error("Fetch room members error:", err);
      // toastr.error(err); // TODO: Add toastr
      throw err;
    }
  };

  addRoomMember = async (roomId, userId, access) => {
    try {
      await api.rooms.addMember(roomId, userId, access);
    } catch (err) {
      console.error("Add room member error:", err);
      // toastr.error(err); // TODO: Add toastr
      throw err;
    }
  };

  removeRoomMember = async (roomId, userId) => {
    try {
      await api.rooms.removeMember(roomId, userId);
    } catch (err) {
      console.error("Remove room member error:", err);
      // toastr.error(err); // TODO: Add toastr
      throw err;
    }
  };

  isRoomLocked = (room) => {
    return isLockedSharedRoom(room);
  };

  isPublicRoom = (room) => {
    return isPublicRoom(room);
  };
}

export default RoomManager;
