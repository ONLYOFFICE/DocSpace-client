import api from "@docspace/common/api";
import type FilesFilter from "@docspace/common/api/files/filter";
import type FilesStore from "SRC_DIR/store/FilesStore";

class RoleService {
  constructor(private fileStore: FilesStore) {}

  private resetState = (): void => {
    const { setFolder, setBoards, setSelection, setSelected } = this.fileStore;

    setFolder([]);
    setBoards([]);
    setSelection([]);
    setSelected("close");
  };

  public getRoleFiles = async (
    boardId: string,
    roleId: string,
    filter: FilesFilter
  ) => {
    const promise = new Promise((res, rej) => {
      setTimeout(() => {
        res([
          {
            folderId: 2,
            version: 1,
            versionGroup: 1,
            contentLength: "77,63 Кб",
            pureContentLength: 79489,
            fileStatus: 0,
            mute: false,
            viewUrl:
              "http://192.168.1.121:8092/filehandler.ashx?action=download&fileid=5",
            webUrl: "http://192.168.1.121:8092/doceditor?fileid=5&version=1",
            fileType: 9,
            fileExst: ".oform",
            comment: "Создано",
            thumbnailStatus: 0,
            denyDownload: false,
            denySharing: false,
            viewAccessability: {
              ImageView: false,
              MediaView: false,
              WebView: true,
              WebEdit: true,
              WebReview: false,
              WebCustomFilterEditing: false,
              WebRestrictedEditing: true,
              WebComment: false,
              CoAuhtoring: true,
              Convert: false,
            },
            id: 5,
            rootFolderId: 2,
            canShare: true,
            security: {
              Read: true,
              Comment: true,
              FillForms: true,
              Review: true,
              Edit: false,
              Delete: true,
              CustomFilter: true,
              Rename: true,
              ReadHistory: true,
              Lock: false,
              EditHistory: true,
              Copy: true,
              Move: true,
              Duplicate: true,
            },
            title: "ONLYOFFICE Sample Form.oform",
            access: 0,
            shared: false,
            created: "2023-07-17T17:15:12.0000000+05:00",
            createdBy: {
              id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
              displayName: " Administrator",
              avatarSmall:
                "/static/images/default_user_photo_size_32-32.png?hash=1851630527",
              profileUrl:
                "http://192.168.1.121:8092/accounts/view/administrator",
              hasAvatar: false,
            },
            updated: "2023-07-17T17:15:12.0000000+05:00",
            rootFolderType: 5,
            updatedBy: {
              id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
              displayName: " Administrator",
              avatarSmall:
                "/static/images/default_user_photo_size_32-32.png?hash=1851630527",
              profileUrl:
                "http://192.168.1.121:8092/accounts/view/administrator",
              hasAvatar: false,
            },
          },
          {
            folderId: 2,
            version: 1,
            versionGroup: 1,
            contentLength: "77,63 Кб",
            pureContentLength: 79489,
            fileStatus: 0,
            mute: false,
            viewUrl:
              "http://192.168.1.121:8092/filehandler.ashx?action=download&fileid=5",
            webUrl: "http://192.168.1.121:8092/doceditor?fileid=6&version=1",
            fileType: 9,
            fileExst: ".oform",
            comment: "Создано",
            thumbnailStatus: 0,
            denyDownload: false,
            denySharing: false,
            viewAccessability: {
              ImageView: false,
              MediaView: false,
              WebView: true,
              WebEdit: true,
              WebReview: false,
              WebCustomFilterEditing: false,
              WebRestrictedEditing: true,
              WebComment: false,
              CoAuhtoring: true,
              Convert: false,
            },
            id: 6,
            rootFolderId: 2,
            canShare: true,
            security: {
              Read: true,
              Comment: true,
              FillForms: true,
              Review: true,
              Edit: false,
              Delete: true,
              CustomFilter: true,
              Rename: true,
              ReadHistory: true,
              Lock: false,
              EditHistory: true,
              Copy: true,
              Move: true,
              Duplicate: true,
            },
            title: "ONLYOFFICE Sample Form 2.oform",
            access: 0,
            shared: false,
            created: "2023-07-17T17:15:12.0000000+05:00",
            createdBy: {
              id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
              displayName: " Administrator",
              avatarSmall:
                "/static/images/default_user_photo_size_32-32.png?hash=1851630527",
              profileUrl:
                "http://192.168.1.121:8092/accounts/view/administrator",
              hasAvatar: false,
            },
            updated: "2023-07-17T17:15:12.0000000+05:00",
            rootFolderType: 5,
            updatedBy: {
              id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
              displayName: " Administrator",
              avatarSmall:
                "/static/images/default_user_photo_size_32-32.png?hash=1851630527",
              profileUrl:
                "http://192.168.1.121:8092/accounts/view/administrator",
              hasAvatar: false,
            },
          },
        ]);
      }, 1000);
    });

    console.log(await api.files.getFilesByRole(boardId, roleId));
    const result = await promise;

    console.log({ result });

    this.resetState();
    this.fileStore.setFiles(result);

    filter.total = 2;

    this.fileStore.setFilter(filter);

    return result;
  };
}

export default RoleService;
