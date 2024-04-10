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
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";
import { ToggleButton } from "@docspace/shared/components/toggle-button";

import StatusBadge from "../../StatusBadge";

import { isMobile, tablet } from "@docspace/shared/utils";

const StyledRowContent = styled(RowContent)`
  display: flex;
  padding-bottom: 10px;

  .row-main-container-wrapper {
    @media ${tablet} {
      width: 100%;
    }
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .mainIcons {
    min-width: 76px;
    display: flex;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: center;
`;

const ToggleButtonWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-inline-start: -52px;
`;

const FlexWrapper = styled.div`
  display: flex;
`;

export const WebhookRowContent = ({
  sectionWidth,
  webhook,
  isChecked,
  handleToggleEnabled,
}) => {
  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      <ContentWrapper>
        <FlexWrapper>
          <Text
            fontWeight={600}
            fontSize="14px"
            style={{ marginInlineEnd: "8px" }}
          >
            {webhook.name}
          </Text>
          <StatusBadge status={webhook.status} />
        </FlexWrapper>

        {!isMobile() && (
          <Text fontWeight={600} fontSize="12px" color="#A3A9AE">
            {webhook.uri}
          </Text>
        )}
      </ContentWrapper>

      <ToggleButtonWrapper>
        <ToggleButton
          className="toggle toggleButton"
          id="toggle id"
          isChecked={isChecked}
          onChange={handleToggleEnabled}
        />
      </ToggleButtonWrapper>
    </StyledRowContent>
  );
};
