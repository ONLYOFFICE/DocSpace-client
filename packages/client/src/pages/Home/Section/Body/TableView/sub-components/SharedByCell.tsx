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
import React, { FC } from "react";
import { decode } from "he";

import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";

import { StyledText, StyledAuthorCell } from "./CellStyles";
import { TFile, TFolder } from "@docspace/shared/api/files/types";

interface SharedByCellProps {
  sideColor: string;
  item: TFolder | TFile;
}

const SharedByCell: FC<SharedByCellProps> = ({
  sideColor,
  item,
}: SharedByCellProps) => {
  const { avatarSmall, hasAvatar, displayName } = item.sharedBy ?? {};

  const avatarSource = hasAvatar ? avatarSmall : DefaultUserPhotoSize32PngUrl;

  const name = React.useMemo(() => decode(displayName ?? ""), [displayName]);

  return (
    <StyledAuthorCell className="author-cell">
      <Avatar
        source={avatarSource}
        className="author-avatar-cell"
        role={AvatarRole.user}
        size={AvatarSize.small}
      />
      <StyledText
        color={sideColor}
        fontSize="12px"
        fontWeight={600}
        title={name}
        truncate
      >
        {name}
      </StyledText>
    </StyledAuthorCell>
  );
};

export default SharedByCell;
