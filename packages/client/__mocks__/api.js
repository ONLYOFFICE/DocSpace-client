const api = {
  files: {
    getFolder: jest.fn(),
    getList: jest.fn(),
    getFile: jest.fn(),
    createFile: jest.fn(),
    deleteFile: jest.fn(),
    updateFile: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
    terminateAccess: jest.fn(),
    getSelection: jest.fn(),
    setFavorite: jest.fn(),
    getFavorites: jest.fn(),
    getRecentFiles: jest.fn(),
    getTemplate: jest.fn(),
    getProgress: jest.fn(),
    getHistory: jest.fn(),
    getInfo: jest.fn(),
    getUser: jest.fn(),
    getUsers: jest.fn(),
    getRooms: jest.fn(),
    getRoom: jest.fn(),
    createRoom: jest.fn(),
    updateRoom: jest.fn(),
    deleteRoom: jest.fn(),
    getSharedRooms: jest.fn(),
    getSharedLinks: jest.fn(),
    createSharedLink: jest.fn(),
    deleteSharedLink: jest.fn(),
    updateSharedLink: jest.fn(),
    getSharedInfo: jest.fn(),
    getSharedUsers: jest.fn(),
    getSharedGroups: jest.fn(),
    getSharedDepartments: jest.fn(),
    getSharedSettings: jest.fn(),
    updateSharedSettings: jest.fn()
  },
  rooms: {
    getRooms: jest.fn()
  }
};

export default api;
