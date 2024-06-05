import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { ProgressBar } from "@docspace/shared/components/progress-bar";

const ProgressContainer = ({ inProgress, percents, error, source, status }) => {
  const { t } = useTranslation(["Settings", "Common"]);

  let progressStatus = status || source ? `${percents}%` : "";

  if (!!progressStatus) {
    status && (progressStatus += " " + status);
    source && (progressStatus += (!!status ? ": " : " ") + source);
  }

  return (
    inProgress && (
      <Box className="ldap_progress-container">
        <ProgressBar percent={percents} status={progressStatus} error={error} />
      </Box>
    )
  );
};

export default inject(({ ldapStore }, { operation }) => {
  const { progressStatus, inProgress } = ldapStore;

  const {
    percents = 0,
    error = "",
    source = "",
    status = "",
    operationType,
  } = progressStatus;

  return {
    inProgress: (inProgress || error) && operation == operationType,
    percents,
    error,
    source,
    status,
  };
})(observer(ProgressContainer));
