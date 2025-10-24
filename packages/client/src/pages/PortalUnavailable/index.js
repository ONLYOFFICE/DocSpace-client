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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { Button } from "@docspace/shared/components/button";
import RecoverAccessModalDialog from "@docspace/shared/dialogs/recover-access-modal-dialog/RecoverAccessModalDialog";
import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";
import { Link } from "@docspace/shared/components/link";

const StyledBodyContent = styled.div`
  max-width: 480px;
  text-align: center;
  button {
    margin-top: 24px;
    max-width: 320px;
  }
`;
const StyledBody = styled.div`
  width: 100%;

  .portal-unavailable_container {
    .portal-unavailable_contact-text {
      display: block;
      text-decoration: underline;
      cursor: pointer;
      margin-top: 26px;
    }
  }

  .portal-unavailable_text {
    color: ${(props) => props.theme.portalUnavailable.textDescription};
  }
`;

const PortalUnavailable = ({ onLogoutClick }) => {
  const { t } = useTranslation(["PortalUnavailable", "Common"]);
  const [isVisible, setIsVisible] = useState();

  const onClick = () => {
    onLogoutClick(t);
  };
  const onClickToContact = () => {
    setIsVisible(true);
  };
  const onCloseDialog = () => {
    setIsVisible(false);
  };
  return (
    <StyledBody>
      <RecoverAccessModalDialog
        visible={isVisible}
        t={t}
        emailPlaceholderText={t("Common:RegistrationEmail")}
        textBody={t("PortalUnavailable:AccessingProblem", {
          productName: t("Common:ProductName"),
        })}
        onClose={onCloseDialog}
      />
      <ErrorContainer
        className="portal-unavailable_container"
        headerText={t("Common:ErrorUnavailableText", {
          productName: t("Common:ProductName"),
        })}
      >
        <StyledBodyContent>
          <Text textAlign="center" className="portal-unavailable_text">
            {t("PortalUnavailable:AccessingProblem", {
              productName: t("Common:ProductName"),
            })}
          </Text>
          {!window.navigator.userAgent.includes("ZoomWebKit") &&
          !window.navigator.userAgent.includes("ZoomApps") ? (
            <Button
              scale
              label={t("Common:LogoutButton")}
              size="medium"
              onClick={onClick}
            />
          ) : null}

          <Link
            textAlign="center"
            className="portal-unavailable_contact-text"
            onClick={onClickToContact}
            color="accent"
          >
            {t("PortalUnavailable:ContactAdministrator", {
              productName: t("Common:ProductName"),
            })}
          </Link>
        </StyledBodyContent>
      </ErrorContainer>
    </StyledBody>
  );
};

export const Component = inject(({ profileActionsStore }) => {
  const { onLogoutClick } = profileActionsStore;

  return { onLogoutClick };
})(observer(PortalUnavailable));
