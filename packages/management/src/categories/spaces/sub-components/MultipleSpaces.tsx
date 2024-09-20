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
import { observer } from "mobx-react";

import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { DeviceType } from "@docspace/shared/enums";
import { SpacesRowContainer } from "./RowView/SpacesRowContainer";
import { StyledMultipleSpaces } from "../StyledSpaces";

import { useStore } from "SRC_DIR/store";
import { TranslationType } from "SRC_DIR/types/spaces";

type TMultipleSpaces = {
  t: TranslationType;
};

const MultipleSpaces = ({ t }: TMultipleSpaces) => {
  const { spacesStore, settingsStore } = useStore();

  const { setChangeDomainDialogVisible, setCreatePortalDialogVisible } =
    spacesStore;

  const { portals, baseDomain, currentDeviceType } = settingsStore;

  const buttonSize =
    currentDeviceType === DeviceType.desktop
      ? ButtonSize.small
      : ButtonSize.normal;

  return (
    <StyledMultipleSpaces>
      <div className="multiple-spaces-section">
        <Button
          size={buttonSize}
          label={t("NewSpace")}
          className="spaces-button"
          primary={true}
          onClick={() => setCreatePortalDialogVisible(true)}
        />
        <SpacesRowContainer portals={portals} />
        <div className="domain-settings-wrapper">
          <Text fontSize="16px" fontWeight={700}>
            {t("DomainSettings")}
          </Text>

          <div className="spaces-input-block">
            <Text
              fontSize="13px"
              className="spaces-input-subheader"
              fontWeight="600"
            >
              {t("Settings:YourCurrentDomain")}
            </Text>
            <TextInput
              isDisabled={true}
              placeholder={baseDomain}
              className="spaces-input"
            />
          </div>

          <Button
            className="spaces-button"
            size={buttonSize}
            label={t("Common:EditButton")}
            primary={true}
            onClick={() => setChangeDomainDialogVisible(true)}
          />
        </div>
      </div>
    </StyledMultipleSpaces>
  );
};

export default observer(MultipleSpaces);
