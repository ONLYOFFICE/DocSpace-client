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

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { FieldContainer } from "@docspace/shared/components/field-container";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";

interface InjectedProps {
  hideAuthPage: boolean;
  enableSso: boolean;
  isLoadingXml: boolean;
  setCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StyledWrapper = styled.div`
  .advanced-block {
    margin: 24px 0;

    .field-label {
      font-size: 15px;
      font-weight: 600;
    }
  }

  .checkbox-input {
    width: fit-content;
    margin-block: 10px 6px;
    margin-inline: 0 8px;
  }
`;

const AdvancedSettings = (props: InjectedProps) => {
  const { hideAuthPage, enableSso, isLoadingXml, setCheckbox } = props;
  const { t } = useTranslation("SingleSignOn");
  return (
    <StyledWrapper>
      <FieldContainer
        className="advanced-block"
        inlineHelpButton
        isVertical
        labelText={t("AdvancedSettings")}
        place="top"
        tooltipContent={
          <Text fontSize="12px">{t("AdvancedSettingsTooltip")}</Text>
        }
        tooltipClass="advanced-settings-tooltip icon-button"
        labelVisible
      >
        <Checkbox
          id="hide-auth-page"
          className="checkbox-input"
          label={t("HideAuthPage")}
          name="hideAuthPage"
          tabIndex={22}
          isChecked={hideAuthPage}
          isDisabled={!enableSso || isLoadingXml}
          onChange={setCheckbox}
        />
      </FieldContainer>
    </StyledWrapper>
  );
};

export default inject(({ ssoStore }) => {
  const { hideAuthPage, enableSso, isLoadingXml, setCheckbox } = ssoStore;

  return {
    hideAuthPage,
    enableSso,
    isLoadingXml,
    setCheckbox,
  };
})(observer(AdvancedSettings));
