# media-viewer Specification

## Purpose

Defines how the web client opens images, video, audio and, where the portal enables it, PDF files in the media viewer:
which files the viewer shows, how it pages through the open folder, the address and browser history it keeps, what
happens when it closes, how it is opened from a link, the file actions it offers, and how a plugin's own viewer takes
its place.

Server counterpart: none of its own; the server decides which files can be viewed (`viewAccessibility`) and serves them
(`../server/openspec/specs/file-operations`). Operations called: `getFileInfo`, `createThumbnails`.

Out of scope: the viewer's own controls — zoom, rotation, the video and audio player — which ui-kit implements; the
file actions themselves (`file-operations`, `file-sharing`); encrypted files (`private-rooms/file-operations`);
the media viewer API for plugins as a whole (`plugins`).

Implementation: the media viewer page of the Home section, the media viewer data store, and ui-kit's media viewer.

## Requirements

### Requirement: Files the viewer opens

Opening a file whose `viewAccessibility` allows image or media viewing SHALL show it in the media viewer instead of an
editor; a PDF SHALL open there too when the portal turns the PDF viewer on. A file of an expired link SHALL NOT open in
the viewer.

#### Scenario: Image

- **WHEN** a user opens a JPG file from the list
- **THEN** the media viewer opens on it over the list

### Requirement: Paging through the folder

The viewer SHALL page through the viewable files of the open folder in list order. Next on the last file and Previous
on the first SHALL do nothing. Moving to a file SHALL select it in the list behind the viewer.

#### Scenario: Next file

- **WHEN** the user presses Next on the second of three images
- **THEN** the third image is shown and selected in the list

### Requirement: Address and history

While open, the address SHALL name the shown file under `/media/view/`, in a public room under the room's shared address
with its key. Opening SHALL add one history entry and paging SHALL replace it; closing SHALL step back over it, or, for a
viewer opened by its address, put the folder's address in its place.

#### Scenario: Back button

- **WHEN** the user pages through two images and presses the browser's Back
- **THEN** the viewer closes and the folder address is shown

### Requirement: Closing the viewer

Closing the viewer SHALL select the last shown file in the list and scroll to it. A viewer opened from a row with the
keyboard SHALL give the focus back to that row on Escape, and while open SHALL keep the focus inside itself.

#### Scenario: Escape

- **WHEN** a user opens an image with Enter on its row and presses Escape
- **THEN** the viewer closes, the address leaves `/media/view/` and the row has the focus

### Requirement: Opening from a link

Opening a viewer address, or a folder address with the `preview` parameter, SHALL load that file on its own and show it
in the viewer when the folder's list is not loaded. A failure SHALL be shown as an error and the folder opened instead.
When the playlist becomes empty while the viewer is open, it SHALL close.

#### Scenario: Link to a deleted file

- **WHEN** a user opens the viewer address of a file that no longer exists
- **THEN** an error toast is shown and the folder list opens

### Requirement: File actions in the viewer

The viewer SHALL offer for the shown file the actions of the file list — info, download, download as, rename, move, copy,
duplicate, copy link, edit, favorite and delete — as the file's rights allow, and SHALL carry them out the same way. A
file being processed by another operation SHALL NOT be deleted from the viewer.

#### Scenario: Delete from the viewer

- **WHEN** a user deletes the shown image from the viewer
- **THEN** the image is deleted as it would be from the list and leaves the playlist

### Requirement: Downloading from the viewer

Downloading SHALL fetch the shown file by its address, also for a file opened by link that is not in the list; a file
that cannot be found SHALL be refused with an error.

#### Scenario: Previewed file

- **WHEN** the user downloads a file opened by its link
- **THEN** the file is downloaded although it is not in the folder list

### Requirement: Thumbnails for the viewer

When the viewer lists images or videos whose thumbnails are not made yet, the client SHALL ask the server to make them.

#### Scenario: Missing thumbnails

- **WHEN** the viewer opens in a folder with images whose thumbnails are still waiting
- **THEN** the client requests thumbnails for those images

### Requirement: A plugin's viewer

A plugin that opens its own media viewer SHALL get the files of the open folder that its filter keeps, including by
the user's role, SHALL be told of Next, Previous and each file change, and MAY switch the shown file. Its viewer SHALL
have a history entry of its own and, once closed, SHALL NOT hand the viewer over to the portal's.

#### Scenario: Plugin navigation

- **WHEN** a plugin's viewer is open and the user presses Next
- **THEN** the plugin is told of the next step and of the file change
