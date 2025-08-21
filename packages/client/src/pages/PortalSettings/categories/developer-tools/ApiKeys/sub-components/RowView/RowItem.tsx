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

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Row, RowContent } from "@docspace/shared/components/rows";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { isMobile, tablet } from "@docspace/shared/utils";

import { useContextOptions } from "../useContextOptions";
import { RowItemType } from "../../types";
import { ApiKeysLifetimeIcon } from "../ApiKeysLifetimeIcon";
import { getStatusByDate } from "../../utils";

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

  .row-content_text {
    color: ${(props) => props.theme.filesSection.rowView.sideColor};
  }

  .api-keys_name {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ToggleButtonWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-inline-start: -52px;

  .toggleButton {
    display: flex;
    align-items: center;
  }
`;

const RowItem = (props: RowItemType) => {
  const {
    item,
    culture,
    sectionWidth,
    onChangeApiKeyParams,
    onDeleteApiKey,
    onEditApiKey,
  } = props;

  const { t } = useTranslation(["Common"]);
  const { contextOptions } = useContextOptions(
    t,
    item,
    onEditApiKey,
    onDeleteApiKey,
  );

  const expiresAtDate = item.expiresAt
    ? getStatusByDate(item.expiresAt, culture)
    : "";

  return (
    <Row contextOptions={contextOptions}>
      <StyledRowContent sectionWidth={sectionWidth}>
        <div>
          <div className="api-keys_name">
            <Text fontWeight={600} fontSize="14px">
              {item.name}
            </Text>
            <ApiKeysLifetimeIcon
              t={t}
              item={item}
              expiresAtDate={expiresAtDate}
            />
          </div>
          {!isMobile() ? (
            <div>
              <Text
                fontWeight={600}
                fontSize="12px"
                className="row-content_text"
              >
                {item.key} | {item.createBy.displayName}
              </Text>
            </div>
          ) : null}
        </div>

        <ToggleButtonWrapper>
          <ToggleButton
            className="toggleButton"
            isChecked={item.isActive}
            onChange={() =>
              onChangeApiKeyParams(item.id, { isActive: !item.isActive })
            }
          />
        </ToggleButtonWrapper>
      </StyledRowContent>
    </Row>
  );
};

export default RowItem;
