import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getObjectByLocation } from "@docspace/shared/utils/common";
import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";
import Section from "@docspace/shared/components/section";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import SectionWrapper from "SRC_DIR/components/Section";
const ThirdPartyResponsePage = ({ match }) => {
  const { params } = match;
  const { provider } = params;
  const { t } = useTranslation("Errors");
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = getObjectByLocation(window.location);
    const code = urlParams ? urlParams.code || null : null;
    const error = urlParams ? urlParams.error || null : null;
    setDocumentTitle(provider);
    if (error) {
      setError(error);
    } else if (code) {
      localStorage.setItem("code", code);
      window.close();
    } else {
      setError(t("ErrorEmptyResponse"));
    }
  }, [t, provider]);

  return (
    <SectionWrapper>
      <Section.SectionBody>
        {error ? (
          <ErrorContainer bodyText={error} />
        ) : (
          <RectangleSkeleton height="96vh" />
        )}
      </Section.SectionBody>
    </SectionWrapper>
  );
};

export default ThirdPartyResponsePage;
