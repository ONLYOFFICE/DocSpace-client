// (c) Copyright Ascensio System SIA 2009-2024
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

import React from "react";
import { withTranslation } from "react-i18next";
import NoGalleryItem from "./NoGalleryItem";
import NoRoomItem from "./NoRoomItem";
import NoFileOrFolderItem from "./NoFileOrFolderItem";
import NoAccountsItem from "./NoAccountsItem";
import NoGroupsItem from "./NoGroupsItem";
import LockedItem from "./LockedItem";
import ExpiredItem from "./ExpiredItem";

const NoItem = ({
  t,
  isPeople,
  isGroups,
  isGallery,
  isRooms,
  isFiles,
  isLockedSharedRoom,
  infoPanelSelection,
}) => {
  if (infoPanelSelection?.expired) return <ExpiredItem />;
  if (isLockedSharedRoom) return <LockedItem t={t} item={infoPanelSelection} />;
  if (isPeople) return <NoAccountsItem t={t} />;
  if (isGroups) return <NoGroupsItem t={t} />;
  if (isGallery) return <NoGalleryItem t={t} />;
  if (isFiles) return <NoFileOrFolderItem t={t} />;
  if (isRooms) return <NoRoomItem t={t} />;
  return null;
};
export default withTranslation(["InfoPanel", "FormGallery"])(
  NoItem,
  // withLoader(NoItem)(<Loaders.InfoPanelViewLoader view="noItem" />)
);
