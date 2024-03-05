# MediaViewer Component

The `MediaViewer` component is used for viewing media files with additional functionality.

## Properties

| Property                 | Type                                                                                                                                                          | Required | Default | Description                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------------- |
| `t`                      | `TranslationType`                                                                                                                                             | Yes      | -       | Function for translating text.                                       |
| `files`                  | `TFile[]`                                                                                                                                                     | Yes      | -       | List of media files to be displayed.                                 |
| `visible`                | `boolean`                                                                                                                                                     | Yes      | -       | Specifies whether the media viewer is visible.                       |
| `playlistPos`            | `number`                                                                                                                                                      | Yes      | -       | Position of the current file in the playlist.                        |
| `isPreviewFile`          | `boolean`                                                                                                                                                     | Yes      | -       | Indicates if the current file is a preview.                          |
| `playlist`               | `PlaylistType[]`                                                                                                                                              | Yes      | -       | List of playlists.                                                   |
| `extsImagePreviewed`     | `string[]`                                                                                                                                                    | Yes      | -       | List of file extensions that can be previewed as images.             |
| `currentFileId`          | `NumberOrString`                                                                                                                                              | Yes      | -       | ID of the current file.                                              |
| `getIcon`                | `(size: number, ext: string, ...arg: unknown[]) => string`                                                                                                    | Yes      | -       | Function to get the icon for a file based on its size and extension. |
| `currentDeviceType`      | `DeviceType`                                                                                                                                                  | No       | -       | Type of the current device.                                          |
| `deleteDialogVisible`    | `boolean`                                                                                                                                                     | No       | -       | Specifies whether the delete dialog is visible.                      |
| `userAccess`             | `boolean`                                                                                                                                                     | No       | -       | Specifies whether the user has access.                               |
| `archiveRoomsId`         | `number`                                                                                                                                                      | No       | -       | ID of the archive room.                                              |
| `pluginContextMenuItems` | `{ key: string; value: { label: string; onClick: (id: number) => Promise<void>; icon: string; fileType?: ["video", "image"]; withActiveItem?: boolean; }[] }` | No       | -       | Context menu items for plugins.                                      |
| `onClose`                | `VoidFunction`                                                                                                                                                | No       | -       | Callback function called when the media viewer is closed.            |
| `onError`                | `VoidFunction`                                                                                                                                                | No       | -       | Callback function called when an error occurs.                       |
| `nextMedia`              | `VoidFunction`                                                                                                                                                | No       | -       | Callback function to view the next media file.                       |
| `prevMedia`              | `VoidFunction`                                                                                                                                                | No       | -       | Callback function to view the previous media file.                   |
| `onMoveAction`           | `VoidFunction`                                                                                                                                                | No       | -       | Callback function called on move action.                             |
| `onCopyAction`           | `VoidFunction`                                                                                                                                                | No       | -       | Callback function called on copy action.                             |
| `onCopyLink`             | `ContextMenuAction`                                                                                                                                           | No       | -       | Callback function called on copy link action.                        |
| `onDuplicate`            | `ContextMenuAction`                                                                                                                                           | No       | -       | Callback function called on duplicate action.                        |
| `onClickDownloadAs`      | `VoidFunction`                                                                                                                                                | No       | -       | Callback function called on "Download As" action.                    |
| `onClickDelete`          | `ContextMenuAction`                                                                                                                                           | No       | -       | Callback function called on delete action.                           |
| `onClickDownload`        | `ContextMenuAction`                                                                                                                                           | No       | -       | Callback function called on download action.                         |
| `onEmptyPlaylistError`   | `VoidFunction`                                                                                                                                                | No       | -       | Callback function called on an error when the playlist is empty.     |
| `onDelete`               | `(id: NumberOrString) => void`                                                                                                                                | No       | -       | Callback function called on delete action for a specific file.       |
| `onDownload`             | `(id: NumberOrString) => void`                                                                                                                                | No       | -       | Callback function called on download action for a specific file.     |
| `onChangeUrl`            | `(id: NumberOrString) => void`                                                                                                                                | No       | -       | Callback function called when the URL changes for a specific file.   |
| `onClickRename`          | `OmitSecondArg<ContextMenuAction>`                                                                                                                            | No       | -       | Callback function called on rename action.                           |
| `onPreviewClick`         | `OmitSecondArg<ContextMenuAction>`                                                                                                                            | No       | -       | Callback function called on preview click action.                    |
| `onClickLinkEdit`        | `OmitSecondArg<ContextMenuAction>`                                                                                                                            | No       | -       | Callback function called on link edit action.                        |
| `onShowInfoPanel`        | `OmitSecondArg<ContextMenuAction>`                                                                                                                            | No       | -       | Callback function called on show info panel action.                  |
| `setBufferSelection`     | `(file?: TFile\| null) => void`                                                                                                                               | No       | -       | Function to set the buffer selection for a file.                     |
| `setActiveFiles`         | `(files: number[], destId?: number) => void`                                                                                                                  | No       | -       | Function to set the active files based on their IDs.                 |

## Usage Example

```jsx
import React from "react";
import MediaViewer from "path/to/MediaViewer";

const MyComponent = () => {
  // Define required callback functions and other necessary data
  const handleNextMedia = () => {
    /* ... */
  };
  const handlePrevMedia = () => {
    /* ... */
  };
  // ...

  return (
    <MediaViewer
      t={translationTypeInstance}
      files={mediaFiles}
      visible={true}
      playlistPos={0}
      isPreviewFile={false}
      playlist={playlists}
      extsImagePreviewed={["jpg", "png"]}
      currentFileId={currentFileId}
      getIcon={getIconFunction}
      // ... (other properties)
      onClose={handleClose}
      onError={handleError}
      nextMedia={handleNextMedia}
      prevMedia={handlePrevMedia}
      // ... (other callbacks)
    />
  );
};

export default MyComponent;
```
