import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { inject } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { MainContainer, ButtonWrapper } from "./StyledDeleteData";
import { setDocumentTitle } from "../../../../helpers/utils";
import { DeletePortalDialog } from "SRC_DIR/components/dialogs";
import { toastr } from "@docspace/shared/components/toast";
import {
  getPaymentAccount,
  sendDeletePortalEmail,
} from "@docspace/shared/api/portal";
import { isDesktop } from "@docspace/shared/utils";
import { EmployeeActivationStatus } from "@docspace/shared/enums";
import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";

const PortalDeletion = (props) => {
  const { t, getPortalOwner, owner, currentColorScheme, sendActivationLink } =
    props;
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [stripeUrl, setStripeUrl] = useState(null);
  const [isDesktopView, setIsDesktopView] = useState(false);

  const fetchData = async () => {
    await getPortalOwner();
    const res = await getPaymentAccount();
    setStripeUrl(res);
  };

  useEffect(() => {
    setDocumentTitle(t("DeleteDocSpace"));
    fetchData();
    onCheckView();
    window.addEventListener("resize", onCheckView);
    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  const onCheckView = () => {
    if (isDesktop()) setIsDesktopView(true);
    else setIsDesktopView(false);
  };

  const onDeleteClick = async () => {
    if (stripeUrl) {
      setIsDialogVisible(true);
    } else {
      try {
        await sendDeletePortalEmail();
        toastr.success(
          t("PortalDeletionEmailSended", { ownerEmail: owner.email })
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
    owner.activationStatus === EmployeeActivationStatus.NotActivated;

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
        />
        {notActivatedEmail && (
          <Text fontSize="12px" fontWeight="600">
            {t("MainBar:ConfirmEmailHeader", { email: owner.email })}
            <Link
              className="request-again-link"
              color={currentColorScheme?.main?.accent}
              fontSize="12px"
              fontWeight="400"
              onClick={requestAgain}
            >
              {t("MainBar:RequestActivation")}
            </Link>
          </Text>
        )}
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
  const { getPortalOwner, owner, currentColorScheme } = settingsStore;
  const { sendActivationLink } = userStore;

  return {
    getPortalOwner,
    owner,
    currentColorScheme,
    sendActivationLink,
  };
})(
  withTranslation(["Settings", "MainBar", "People", "Common"])(PortalDeletion)
);
