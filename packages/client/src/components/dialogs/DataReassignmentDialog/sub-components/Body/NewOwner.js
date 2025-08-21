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

import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import {
  StyledPeopleSelectorInfo,
  StyledPeopleSelector,
  StyledSelectedOwnerContainer,
  StyledSelectedOwner,
} from "../../../ChangePortalOwnerDialog/StyledDialog";

const ChoiceNewOwner = ({
  t,
  targetUser,
  currentColorScheme,
  onTogglePeopleSelector,
}) => {
  if (targetUser)
    return (
      <StyledSelectedOwnerContainer>
        <StyledSelectedOwner currentColorScheme={currentColorScheme}>
          <Text className="text">
            {targetUser.displayName ? targetUser.displayName : targetUser.label}
          </Text>
        </StyledSelectedOwner>

        <Link
          type="action"
          isHovered
          fontWeight={600}
          onClick={onTogglePeopleSelector}
        >
          {t("ChangePortalOwner:ChangeUser")}
        </Link>
      </StyledSelectedOwnerContainer>
    );

  return (
    <StyledPeopleSelector>
      <SelectorAddButton
        className="selector-add-button"
        onClick={onTogglePeopleSelector}
        label={t("Translations:ChooseFromList")}
        titleText={t("Translations:ChooseFromList")}
        noSelect
      />
    </StyledPeopleSelector>
  );
};

const NewOwner = ({
  t,
  targetUser,
  currentColorScheme,
  onTogglePeopleSelector,
}) => {
  return (
    <>
      <StyledPeopleSelectorInfo>
        <Text className="new-owner">
          {t("DataReassignmentDialog:NewDataOwner")}
        </Text>
        <Text className="description">
          {t("DataReassignmentDialog:UserToWhomTheDataWillBeTransferred")}
        </Text>
      </StyledPeopleSelectorInfo>

      <ChoiceNewOwner
        t={t}
        targetUser={targetUser}
        currentColorScheme={currentColorScheme}
        onTogglePeopleSelector={onTogglePeopleSelector}
      />
    </>
  );
};

export default NewOwner;
