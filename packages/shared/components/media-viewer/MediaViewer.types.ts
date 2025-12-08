// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import type { TFunction } from "i18next";

import type { TFile } from "../../api/files/types";
import type { DeviceType } from "../../enums";

export type ContextMenuAction = (file: TFile, t: TranslationType) => void;

export type OmitSecondArg<F> = F extends (x: infer P, ...arg: never) => infer R
  ? (file: P) => R
  : F;

export type TranslationType = TFunction;

export type NumberOrString = number | string;

export type NullOrUndefined = null | undefined;

export type DevicesType = {
  isMobile: boolean;
  isMobileOnly: boolean;
  isDesktop: boolean;
};

export type ContextFunctions = {
  onClickDownloadAs?: VoidFunction;
  onMoveAction?: VoidFunction;
  onCopyAction?: VoidFunction;
  onCopyLink?: ContextMenuAction;
  onClickDelete?: ContextMenuAction;
  onClickDownload?: ContextMenuAction;
  onClickRename?: OmitSecondArg<ContextMenuAction>;
  onDuplicate?: ContextMenuAction;
  onClickLinkEdit?: OmitSecondArg<ContextMenuAction>;
  onPreviewClick?: OmitSecondArg<ContextMenuAction>;
  onShowInfoPanel?: OmitSecondArg<ContextMenuAction>;
};

export type PlaylistType = {
  id: number;
  canShare: boolean;
  fileExst: string;
  fileId: number;
  fileStatus: number;
  src: string;
  title: string;
  thumbnailUrl: string;
  version: number;
};

export type BoundsType = {
  top: number;
  bottom: number;
  right: number;
  left: number;
};

export type Point = {
  x: number;
  y: number;
};

export type PluginContextMenuItem = {
  key: string;
  label: string;
  onClick: (id: number) => Promise<void>;
  icon: string;
  fileType?: ["video", "image"];
  withActiveItem?: boolean;
  items?: PluginContextMenuItem[];
};

export type MediaViewerProps = {
  /** Function for translating text. */
  t: TranslationType;
  /** List of media files to be displayed. */
  files: TFile[];
  /** Specifies whether the media viewer is visible. */
  visible: boolean;
  /** Position of the current file in the playlist. */
  playlistPos: number;
  /** Indicates if the current file is a preview. */
  isPreviewFile?: boolean;

  autoPlay?: boolean;

  isPublicFile?: boolean;
  /** List of playlists. */
  playlist: PlaylistType[];
  /** List of file extensions that can be previewed as images. */
  extsImagePreviewed: string[];
  /** ID of the current file. */
  currentFileId: NumberOrString;
  /** Function to get the icon for a file based on its size and extension. */
  getIcon: (size: number, ext: string, ...arg: unknown[]) => string;
  /** Type of the current device. */
  currentDeviceType?: DeviceType;
  /** Specifies whether the delete dialog is visible. */
  deleteDialogVisible?: boolean;
  /** Specifies whether the user has access. */
  userAccess?: boolean;
  /** ID of the archive room. */
  archiveRoomsId?: number;
  /** Context menu items for plugins. */
  pluginContextMenuItems?: PluginContextMenuItem[];
  /** Callback function called when the media viewer is closed. */
  onClose?: VoidFunction;
  /** Callback function called when an error occurs. */
  onError?: VoidFunction;
  /** Callback function to view the next media file. */
  nextMedia?: VoidFunction;
  /** Callback function to view the previous media file. */
  prevMedia?: VoidFunction;
  /** Callback function called on move action. */
  onMoveAction?: VoidFunction;
  /** Callback function called on copy action. */
  onCopyAction?: VoidFunction;
  /** Callback function called on copy link action. */
  onCopyLink?: ContextMenuAction;
  /** Callback function called on duplicate action. */
  onDuplicate?: ContextMenuAction;
  /** Callback function called on "Download As" action. */
  onClickDownloadAs?: VoidFunction;
  /** Callback function called on delete action. */
  onClickDelete?: ContextMenuAction;
  /** Callback function called on download action. */
  onClickDownload?: ContextMenuAction;
  /** Callback function called on an error when the playlist is empty. */
  onEmptyPlaylistError?: VoidFunction;
  /** Callback function called on delete action for a specific file. */
  onDelete?: (id: NumberOrString) => void;
  /** Callback function called on download action for a specific file. */
  onDownload?: (id: NumberOrString) => void;
  /** Callback function called when the URL changes for a specific file. */
  onChangeUrl?: (id: NumberOrString) => void;
  /** Callback function called on rename action. */
  onClickRename?: OmitSecondArg<ContextMenuAction>;
  /** Callback function called on preview click action. */
  onPreviewClick?: OmitSecondArg<ContextMenuAction>;
  /** Callback function called on link edit action. */
  onClickLinkEdit?: OmitSecondArg<ContextMenuAction>;
  /** Callback function called on show info panel action. */
  onShowInfoPanel?: OmitSecondArg<ContextMenuAction>;
  /** Function to set the buffer selection for a file. */
  setBufferSelection?: (file?: TFile | null) => void;
  /** Function to set the active files based on their IDs. */
  setActiveFiles?: (files: number[], destId?: number) => void;
};
