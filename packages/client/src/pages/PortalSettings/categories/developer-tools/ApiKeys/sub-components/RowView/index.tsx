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

import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import {
  Row,
  RowContent,
  RowContainer,
} from "@docspace/shared/components/rows";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { tablet } from "@docspace/shared/utils";

import { TableViewProps } from "../../types";

const StyledRowContainer = styled(RowContainer)`
  margin-top: 16px;
`;

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

const RowView = (props: TableViewProps) => {
  const {
    items,
    viewAs,
    setViewAs,
    sectionWidth,
    currentDeviceType,
    onChangeApiKeyParams,
    onDeleteApiKey,
    onRenameApiKey,
    onEditApiKey,
  } = props;

  useViewEffect({
    view: viewAs!,
    setView: setViewAs!,
    currentDeviceType: currentDeviceType!,
  });

  const { t } = useTranslation(["Common"]);

  return (
    <StyledRowContainer useReactWindow={false}>
      {items.map((item) => (
        <Row
          key={item.id}
          // sectionWidth={sectionWidth}
          contextOptions={[
            {
              key: "api-key_edit",
              label: t("Common:EditButton"),
              icon: SettingsReactSvgUrl,
              onClick: () => onEditApiKey(item.id),
            },
            {
              key: "api-key_rename",
              label: t("Common:Rename"),
              icon: RenameReactSvgUrl,
              onClick: () => onRenameApiKey(item.id),
            },
            {
              key: "separator",
              isSeparator: true,
            },
            {
              key: "api-key_delete",
              label: t("Common:Delete"),
              icon: CatalogTrashReactSvgUrl,
              onClick: () => onDeleteApiKey(item.id),
            },
          ]}
        >
          <StyledRowContent sectionWidth={sectionWidth}>
            <div>
              <div>
                <Text
                  fontWeight={600}
                  fontSize="14px"
                  style={{ marginInlineEnd: "8px" }}
                >
                  {item.name}
                </Text>
              </div>
              <div>
                <Text
                  fontWeight={600}
                  fontSize="12px"
                  className="row-content_text"
                >
                  {item.key} | {item.createBy.displayName}
                </Text>
              </div>
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
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ setup, settingsStore }: TStore) => {
  const { currentDeviceType } = settingsStore;
  const { viewAs, setViewAs } = setup;

  return {
    viewAs,
    setViewAs,
    currentDeviceType,
  };
})(observer(RowView));
