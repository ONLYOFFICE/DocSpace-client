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
import FilterReactSvrUrl from "PUBLIC_DIR/images/filter.react.svg?url";

import { IconButton } from "../../icon-button";

import { FilterButtonProps } from "../Filter.types";
import { StyledButton, StyledIndicator } from "../Filter.styled";

import FilterBlock from "./FilterBlock";

const FilterButton = ({
  onFilter,
  getFilterData,
  selectedFilterValue,
  filterHeader,
  selectorLabel,
  isRooms,
  isContactsPage,
  isContactsPeoplePage,
  isContactsGroupsPage,
  isContactsInsideGroupPage,
  isContactsGuestsPage,
  id,
  title,
  userId,
  disableThirdParty,
}: FilterButtonProps) => {
  const [showFilterBlock, setShowFilterBlock] = React.useState(false);

  const changeShowFilterBlock = React.useCallback(() => {
    setShowFilterBlock((value) => !value);
  }, [setShowFilterBlock]);

  return (
    <>
      <StyledButton
        id={id}
        isOpen={showFilterBlock}
        onClick={changeShowFilterBlock}
        title={title}
      >
        <IconButton iconName={FilterReactSvrUrl} size={16} />
        {selectedFilterValue && selectedFilterValue.size > 0 ? (
          <StyledIndicator />
        ) : null}
      </StyledButton>

      {showFilterBlock ? (
        <FilterBlock
          filterHeader={filterHeader}
          selectedFilterValue={selectedFilterValue}
          hideFilterBlock={changeShowFilterBlock}
          getFilterData={getFilterData}
          onFilter={onFilter}
          selectorLabel={selectorLabel}
          isRooms={isRooms}
          isContactsPage={isContactsPage}
          isContactsPeoplePage={isContactsPeoplePage}
          isContactsGroupsPage={isContactsGroupsPage}
          isContactsInsideGroupPage={isContactsInsideGroupPage}
          isContactsGuestsPage={isContactsGuestsPage}
          userId={userId}
          disableThirdParty={disableThirdParty}
        />
      ) : null}
    </>
  );
};

export default React.memo(FilterButton);
