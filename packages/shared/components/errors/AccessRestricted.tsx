import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import ErrorContainer from "../error-container/ErrorContainer";
import { AccessRestrictedWrapper } from "./Errors.styled";

const AccessRestricted = () => {
  const { t, ready } = useTranslation("Common");

  useEffect(() => {
    window.history.replaceState(null, "");
  }, []);

  return (
    ready && (
      <AccessRestrictedWrapper>
        <ErrorContainer
          headerText={t("AccessDenied")}
          bodyText={t("PortalRestriction")}
        />
      </AccessRestrictedWrapper>
    )
  );
};

export default AccessRestricted;
