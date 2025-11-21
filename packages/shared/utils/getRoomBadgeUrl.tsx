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
import Planet12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/planet.react.svg?url";
import Link12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/link.svg?url";

import SharedLinkIconURL from "PUBLIC_DIR/images/icons/24/shared.svg?url";
import PlanetIconURL from "PUBLIC_DIR/images/icons/24/planet.react.svg?url";

import { RoomsType } from "../enums";
import type { Nullable } from "../types";

type ItemType = {
  shared: boolean;
  roomType?: RoomsType;
  external?: boolean;
};

type SizeIcon = 12 | 24;
type IconsURLType = "link" | "planet";
type IconsType = Record<SizeIcon, Record<IconsURLType, string>>;

const icons: IconsType = {
  12: {
    link: Link12ReactSvgUrl,
    planet: Planet12ReactSvgUrl,
  },
  24: {
    link: SharedLinkIconURL,
    planet: PlanetIconURL,
  },
};

export const getRoomBadgeUrl = (
  item?: Nullable<ItemType>,
  size: SizeIcon = 12,
) => {
  if (!item) return null;

  const { link, planet } = icons[size];

  if (item.external) return link;

  const showPlanetIcon =
    (item.roomType === RoomsType.PublicRoom ||
      item.roomType === RoomsType.FormRoom ||
      item.roomType === RoomsType.CustomRoom) &&
    item.shared;

  if (showPlanetIcon) return planet;

  return null;
};
