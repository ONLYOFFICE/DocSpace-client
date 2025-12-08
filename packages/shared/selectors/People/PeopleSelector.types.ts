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

import { TUser } from "../../api/people/types";
import PeopleFilter from "../../api/people/filter";
import {
  TSelectorAccessRights,
  TSelectorCancelButton,
  TSelectorCheckbox,
  TSelectorHeader,
  TSelectorInfo,
  TSelectorSubmitButton,
  TSelectorWithAside,
} from "../../components/selector/Selector.types";

import type Filter from "../../api/people/filter";

export type UserTooltipProps = {
  avatarUrl: string;
  label: string;
  email: string;
  position: string;
  className?: string;

  // Accessibility attributes
  "aria-label"?: string;
};

export type ContactsSelectorGroups =
  | { withGroups: true; isGroupsOnly?: boolean }
  | { withGroups?: never; isGroupsOnly?: never };

export type ContactsSelectorGuests =
  | { withGuests: boolean; isGuestsOnly?: boolean }
  | { withGuests?: never; isGuestsOnly?: never };

export type PeopleSelectorProps = TSelectorHeader &
  TSelectorInfo &
  TSelectorCancelButton &
  TSelectorCheckbox &
  TSelectorAccessRights &
  TSelectorWithAside &
  TSelectorSubmitButton & {
    targetEntityType?: "file" | "folder" | "room";
    disabledInvitedText?: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;

    filter?: PeopleFilter | (() => Filter);

    isMultiSelect?: boolean;

    currentUserId?: string;
    filterUserId?: string;
    withOutCurrentAuthorizedUser?: boolean;

    excludeItems?: string[];
    disableInvitedUsers?: string[];
    disableDisabledUsers?: boolean;

    emptyScreenHeader?: string;
    emptyScreenDescription?: string;

    roomId?: string | number;
    setActiveTab?: (id: string) => void;

    checkIfUserInvited?: (user: TUser) => boolean;
    injectedElement?: React.ReactElement;
    alwaysShowFooter?: boolean;
    onlyRoomMembers?: boolean;
    isAgent?: boolean;
    // Accessibility attributes
    "aria-label"?: string;
    "data-selector-type"?: string;
    "data-test-id"?: string;
  } & ContactsSelectorGroups &
  ContactsSelectorGuests;
