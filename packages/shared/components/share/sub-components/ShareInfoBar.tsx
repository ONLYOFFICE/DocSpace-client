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

import { useMemo } from "react";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import FolderIcon from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";

import { useLocalStorage } from "../../../hooks/useLocalStorage";

import PublicRoomBar from "../../public-room-bar";

import type { TShareBarProps } from "../Share.types";

const ShareInfoBar = ({
  t,
  selfId,
  parentShared,
  isFolder,
}: TShareBarProps) => {
  const [visibleBar, setVisibleBar] = useLocalStorage(
    `document-bar-${selfId}`,
    true,
  );

  const barData = useMemo(() => {
    if (parentShared) {
      return {
        headerText: isFolder
          ? t("Common:FolderAvailableViaParentFolderLinkTitle")
          : t("Common:FileAvailableViaParentFolderLinkTitle"),
        bodyText: isFolder
          ? t("Common:FolderAvailableViaParentFolderLinkDescription")
          : t("Common:FileAvailableViaParentFolderLinkDescription"),
        iconName: FolderIcon,
      };
    }

    return {
      headerText: isFolder
        ? t("Common:ShareFolder")
        : t("Common:ShareDocument"),
      bodyText: isFolder
        ? t("Common:ShareFolderDescription")
        : t("Common:ShareDocumentDescription"),
      iconName: InfoIcon,
      onClose: () => setVisibleBar(false),
    };
  }, [parentShared, isFolder, t, setVisibleBar]);

  const barIsVisible = visibleBar || parentShared;

  if (!barIsVisible) return null;

  return (
    <PublicRoomBar {...barData} dataTestId="info_panel_share_public_room_bar" />
  );
};

export default ShareInfoBar;
