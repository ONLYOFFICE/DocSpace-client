import React, { useState } from "react";

import { withTranslation, Trans } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { inject, observer } from "mobx-react";
import { deleteSelf } from "@docspace/common/api/people";
import { toastr } from "@docspace/shared/components/toast";
import { StyledPage, StyledBody, StyledContent } from "./StyledConfirm";
import withLoader from "../withLoader";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import DocspaceLogo from "../../../DocspaceLogo";

const ProfileRemoveForm = (props) => {
  const { t, greetingTitle, linkData, legalTerms, currentColorScheme } = props;
  const [isProfileDeleted, setIsProfileDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log(legalTerms);

  const onDeleteProfile = () => {
    setIsLoading(true);

    deleteSelf(linkData.confirmHeader)
      .then((res) => {
        setIsLoading(false);
        setIsProfileDeleted(true);
      })
      .catch((e) => {
        setIsLoading(false);
        toastr.error(e);
      });
  };

  if (isProfileDeleted) {
    return (
      <StyledPage>
        <StyledContent>
          <StyledBody>
            <DocspaceLogo className="docspace-logo" />
            <Text fontSize="23px" fontWeight="700" className="title">
              {t("DeleteProfileSuccessMessage")}
            </Text>
            <Text fontSize="16px" fontWeight="600" className="confirm-subtitle">
              <Trans
                i18nKey="DeleteProfileSuccessMessageInfo"
                ns="Confirm"
                t={t}
              >
                See our
                <Link
                  fontSize="16px"
                  fontWeight="600"
                  type="page"
                  href={legalTerms}
                  color={currentColorScheme?.main?.accent}
                  target="_blank"
                >
                  Privacy policy
                </Link>
                to learn more about deleting your account and the data
                associated with it.
              </Trans>
            </Text>
          </StyledBody>
        </StyledContent>
      </StyledPage>
    );
  }

  return (
    <StyledPage>
      <StyledContent>
        <StyledBody>
          <DocspaceLogo className="docspace-logo" />
          <Text fontSize="23px" fontWeight="700" className="title">
            {greetingTitle}
          </Text>

          <FormWrapper>
            <div className="subtitle">
              <Text
                fontSize="16px"
                fontWeight="600"
                className="delete-profile-confirm"
              >
                {t("DeleteProfileConfirmation")}
              </Text>
              <Text>
                <Trans
                  i18nKey="DeleteProfileConfirmationInfo"
                  ns="Confirm"
                  t={t}
                >
                  By clicking \"Delete my account\" you agree with our Privacy
                  policy
                  <Link
                    type="page"
                    href={legalTerms}
                    color={currentColorScheme?.main?.accent}
                    target="_blank"
                  >
                    Privacy policy.
                  </Link>
                </Trans>
              </Text>
            </div>

            <Button
              primary
              scale
              size="medium"
              label={t("DeleteProfileBtn")}
              tabIndex={1}
              isDisabled={isLoading}
              onClick={onDeleteProfile}
            />
          </FormWrapper>
        </StyledBody>
      </StyledContent>
    </StyledPage>
  );
};

export default inject(({ auth }) => ({
  greetingTitle: auth.settingsStore.greetingSettings,
  theme: auth.settingsStore.theme,
  legalTerms: auth.settingsStore.legalTerms,
  currentColorScheme: auth.settingsStore.currentColorScheme,
}))(withTranslation("Confirm")(withLoader(observer(ProfileRemoveForm))));
