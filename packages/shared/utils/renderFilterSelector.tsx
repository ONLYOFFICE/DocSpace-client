// (c) Copyright Ascensio System SIA 2009-2026
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

import { FilterSelectorTypes } from "../enums";
import type { SelectorRenderProps } from "@docspace/ui-kit/components/filter/Filter.types";

import GroupsSelector from "@docspace/ui-kit/selectors/Groups";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import RoomSelector from "@docspace/ui-kit/selectors/Room";

const renderFilterSelector = ({
  selectorType,
  onSubmit,
  onBackClick,
  onCloseClick,
  selectorLabel,
  isRooms,
  userId,
  disableThirdParty,
}: SelectorRenderProps): React.ReactNode => {
  if (selectorType === FilterSelectorTypes.people) {
    return (
      <PeopleSelector
        withOutCurrentAuthorizedUser
        className="people-selector"
        onSubmit={onSubmit}
        submitButtonLabel=""
        disableSubmitButton={false}
        withHeader
        headerProps={{
          onBackClick,
          onCloseClick,
          headerLabel: selectorLabel,
          withoutBackButton: false,
          withoutBorder: !!isRooms,
        }}
        currentUserId={userId}
        withGuests={!!isRooms}
      />
    );
  }

  if (selectorType === FilterSelectorTypes.groups) {
    return (
      <GroupsSelector
        className="group-selector"
        onSubmit={onSubmit}
        withHeader
        headerProps={{
          onBackClick,
          onCloseClick,
          headerLabel: selectorLabel,
          withoutBackButton: false,
          withoutBorder: false,
        }}
      />
    );
  }

  return (
    <RoomSelector
      className="room-selector"
      onSubmit={onSubmit}
      withHeader
      headerProps={{
        onBackClick,
        onCloseClick,
        headerLabel: selectorLabel,
        withoutBackButton: false,
        withoutBorder: false,
      }}
      isMultiSelect={false}
      withSearch
      disableThirdParty={disableThirdParty}
    />
  );
};

export default renderFilterSelector;
