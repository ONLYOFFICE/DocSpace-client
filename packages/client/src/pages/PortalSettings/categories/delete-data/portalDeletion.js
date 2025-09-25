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

import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { inject } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { DeletePortalDialog } from "SRC_DIR/components/dialogs";
import { toastr } from "@docspace/shared/components/toast";
import { sendDeletePortalEmail } from "@docspace/shared/api/portal";
import { isDesktop } from "@docspace/shared/utils";
import { EmployeeActivationStatus } from "@docspace/shared/enums";
import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";
import { MainContainer, ButtonWrapper } from "./StyledDeleteData";

const PortalDeletion = (props) => {
  const {
    t,
    tReady,
    owner,
    currentColorScheme,
    sendActivationLink,
    stripeUrl,
  } = props;
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const [isDesktopView, setIsDesktopView] = useState(false);

  const onCheckView = () => {
    if (isDesktop()) setIsDesktopView(true);
    else setIsDesktopView(false);
  };

  useEffect(() => {
    setDocumentTitle(
      t("DeletePortal", { productName: t("Common:ProductName") }),
    );
    onCheckView();
    window.addEventListener("resize", onCheckView);
    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  const onDeleteClick = async () => {
    if (stripeUrl) {
      setIsDialogVisible(true);
    } else {
      try {
        await sendDeletePortalEmail();
        toastr.success(
          t("PortalDeletionEmailSended", { ownerEmail: owner.email }),
        );
      } catch (error) {
        toastr.error(error);
      }
    }
  };

  const requestAgain = () => {
    sendActivationLink && sendActivationLink().then(showEmailActivationToast);
  };

  const notActivatedEmail =
    owner?.activationStatus === EmployeeActivationStatus.NotActivated;

  return (
    <MainContainer>
      <Text fontSize="13px" className="description">
        {t("PortalDeletionDescription")}
      </Text>
      <Text className="helper">{t("PortalDeletionHelper")}</Text>
      <ButtonWrapper>
        <Button
          className="delete-button button"
          label={t("Common:Delete")}
          primary
          size={isDesktopView ? "small" : "normal"}
          onClick={onDeleteClick}
          isDisabled={notActivatedEmail}
          testId="delete_portal_button"
        />
        {notActivatedEmail && tReady ? (
          <Text fontSize="12px" fontWeight="600">
            {t("MainBar:ConfirmEmailHeader", {
              email: owner.email,
              productName: t("Common:ProductName"),
            })}
            <Link
              className="request-again-link"
              color={currentColorScheme?.main?.accent}
              fontSize="12px"
              fontWeight="400"
              onClick={requestAgain}
              testId="request_delete_portal_link"
            >
              {t("MainBar:RequestActivation")}
            </Link>
          </Text>
        ) : null}
      </ButtonWrapper>
      <DeletePortalDialog
        visible={isDialogVisible}
        onClose={() => setIsDialogVisible(false)}
        owner={owner}
        stripeUrl={stripeUrl}
      />
    </MainContainer>
  );
};

export default inject(({ settingsStore, userStore }) => {
  const { owner, currentColorScheme } = settingsStore;
  const { sendActivationLink } = userStore;

  return {
    owner,
    currentColorScheme,
    sendActivationLink,
  };
})(
  withTranslation(["Settings", "MainBar", "People", "Common"])(PortalDeletion),
);
