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
import { RoomsType } from "../../../enums";
import { RectangleSkeleton } from "../../rectangle";

import { StyledBlock, StyledContainer } from "./FilterBlock.styled";
import { FilterBlockProps } from "./FilterBlock.types";

const FilterBlockLoader = ({
  id,
  className,
  style,
  isRooms,
  isAccounts,
  isPeopleAccounts,
  isGroupsAccounts,
  isInsideGroup,

  ...rest
}: FilterBlockProps) => {
  const roomTypeLoader = isRooms ? (
    <>
      <RectangleSkeleton
        key={RoomsType.EditingRoom}
        width="98"
        height="28"
        borderRadius="16"
        className="loader-item tag-item"
      />
      <RectangleSkeleton
        key={RoomsType.CustomRoom}
        width="89"
        height="28"
        borderRadius="16"
        className="loader-item tag-item"
      />
    </>
  ) : null;

  return (
    <StyledContainer id={id} className={className} style={style} {...rest}>
      {!isRooms && !isAccounts && (
        <StyledBlock>
          <RectangleSkeleton
            width="50"
            height="16"
            borderRadius="3"
            className="loader-item"
          />
          <RectangleSkeleton
            width="100%"
            height="32"
            borderRadius="3"
            className="loader-item"
          />
          <div className="row-loader">
            <RectangleSkeleton
              width="16"
              height="16"
              borderRadius="3"
              className="loader-item"
            />
            <RectangleSkeleton
              width="137"
              height="20"
              borderRadius="3"
              className="loader-item"
            />
          </div>
        </StyledBlock>
      )}

      {!isInsideGroup && (
        <StyledBlock isLast={isGroupsAccounts}>
          <RectangleSkeleton
            width="51"
            height="16"
            borderRadius="3"
            className="loader-item"
          />
          <div className="row-loader">
            <RectangleSkeleton
              width={isPeopleAccounts ? "120" : "51"}
              height="28"
              borderRadius="16"
              className="loader-item"
            />
            <RectangleSkeleton
              width="68"
              height="28"
              borderRadius="16"
              className="loader-item"
            />
          </div>
          {(isRooms || isGroupsAccounts) && (
            <div className="row-loader">
              <RectangleSkeleton
                width="16"
                height="16"
                borderRadius="3"
                className="loader-item"
              />
              <RectangleSkeleton
                width={isGroupsAccounts ? "150" : "137"}
                height="20"
                borderRadius="3"
                className="loader-item"
              />
            </div>
          )}
        </StyledBlock>
      )}

      {(isRooms || isPeopleAccounts || isInsideGroup) && (
        <StyledBlock>
          <RectangleSkeleton
            width="50"
            height="16"
            borderRadius="3"
            className="loader-item"
          />
          <div className="row-loader">
            {isPeopleAccounts || isInsideGroup ? (
              <>
                <RectangleSkeleton
                  width="67"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="80"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="83"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
              </>
            ) : isRooms ? (
              roomTypeLoader
            ) : null}
          </div>
        </StyledBlock>
      )}

      {(isPeopleAccounts || isInsideGroup) && (
        <StyledBlock>
          <RectangleSkeleton
            width="50"
            height="16"
            borderRadius="3"
            className="loader-item"
          />
          <div className="row-loader">
            <RectangleSkeleton
              width="114"
              height="28"
              borderRadius="16"
              className="loader-item tag-item"
            />
            <RectangleSkeleton
              width="110"
              height="28"
              borderRadius="16"
              className="loader-item tag-item"
            />
            <RectangleSkeleton
              width="108"
              height="28"
              borderRadius="16"
              className="loader-item tag-item"
            />
            <RectangleSkeleton
              width="59"
              height="28"
              borderRadius="16"
              className="loader-item tag-item"
            />
          </div>
        </StyledBlock>
      )}

      {!isGroupsAccounts && (
        <StyledBlock isLast>
          <RectangleSkeleton
            width="50"
            height="16"
            borderRadius="3"
            className="loader-item"
          />
          <div className="row-loader">
            {isAccounts ? (
              <>
                <RectangleSkeleton
                  width="57"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="57"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
              </>
            ) : isRooms ? (
              <>
                <RectangleSkeleton
                  width="67"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="73"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="67"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="74"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="65"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="72"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
              </>
            ) : (
              <>
                <RectangleSkeleton
                  width="73"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="99"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="114"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="112"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="130"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="66"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="81"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="74"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
                <RectangleSkeleton
                  width="68"
                  height="28"
                  borderRadius="16"
                  className="loader-item tag-item"
                />
              </>
            )}
          </div>
        </StyledBlock>
      )}
    </StyledContainer>
  );
};

export default FilterBlockLoader;
