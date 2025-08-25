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

import type { Key } from "react";
import type { NavigateFunction } from "react-router";

/**
 * Minimal representation of a file inside the Templates Gallery.
 * Currently only the `id` field is required by the UI layer but we keep the
 * interface extensible for future use.
 */
export interface TOformFile {
  id: Key | null | undefined;
  // You can add other fields here when they become required by the UI
}

export interface TilesProps {
  /** Flag returned by `react-i18next` hook that indicates that translations are ready. */
  tReady: boolean;
  /** Array with files that should be rendered in the gallery. */
  oformFiles: TOformFile[];

  /**
   * Callback that informs mobx store whether the `oformFiles` have been fetched and can be displayed.
   */
  setOformFilesLoaded: (loaded: boolean) => void;
  isShowOneTile?: boolean;
  smallPreview: boolean;
  setIsVisible: (isVisible: boolean) => void;
  setGallerySelected: (item: { id: Key | null | undefined } | null) => void;
  submitToGalleryTileIsVisible: boolean;
  canSubmitToFormGallery: () => boolean;
  viewMobile: boolean;
  onCreateOform: (navigate: NavigateFunction) => void;
  setTemplatesGalleryVisible: (isVisible: boolean) => void;
}

export interface TileProps {
  // Tile component currently receives everything via MobX inject and therefore
  // has no own props. We leave an empty interface to keep API consistent and
  // make future extension easier.
}
