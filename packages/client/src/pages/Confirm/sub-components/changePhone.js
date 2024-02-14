import React, { useState } from "react";

import { withTranslation } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import { TextInput } from "@docspace/shared/components/text-input";
import { Button } from "@docspace/shared/components/button";
import { inject, observer } from "mobx-react";
import { StyledPage, StyledBody, StyledContent } from "./StyledConfirm";
import withLoader from "../withLoader";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import DocspaceLogo from "../../../components/DocspaceLogoWrapper";

const ChangePhoneForm = (props) => {
  const { t, greetingTitle } = props;
  const [currentNumber, setCurrentNumber] = useState("+00000000000");

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
              <Text fontSize="16px" fontWeight="600" className="phone-title">
                {t("EnterPhone")}
              </Text>
              <Text>
                {t("CurrentNumber")}: {currentNumber}
              </Text>
              <Text>{t("PhoneSubtitle")}</Text>
            </div>

            <TextInput
              className="phone-input"
              id="phone"
              name="phone"
              type="phone"
              size="large"
              scale={true}
              isAutoFocussed={true}
              tabIndex={1}
              hasError={false}
              guide={false}
            />

            <Button
              primary
              scale
              size="medium"
              label={t("GetCode")}
              tabIndex={2}
              isDisabled={false}
            />
          </FormWrapper>
        </StyledBody>
      </StyledContent>
    </StyledPage>
  );
};

export default inject(({ settingsStore }) => ({
  greetingTitle: settingsStore.greetingSettings,
}))(withTranslation("Confirm")(withLoader(observer(ChangePhoneForm))));
