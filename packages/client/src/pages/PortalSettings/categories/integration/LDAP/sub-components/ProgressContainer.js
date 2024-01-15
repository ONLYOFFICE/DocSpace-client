import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {Box} from "@docspace/shared/components/box";
import {ProgressBar} from "@docspace/shared/components/progress-bar";

const ProgressContainer = ({
  inProgress,
  percents,
  completed,
  error,
  source,
}) => {
  const { t } = useTranslation(["Settings", "Common"]);

  return (
    inProgress && (
      <Box className="ldap_progress-container">
        <ProgressBar percent={percents} label={source || error} />
      </Box>
    )
  );
};

export default inject(({ ldapStore }) => {
  const { progressStatus, inProgress } = ldapStore;

  const {
    percents = 0,
    completed = false,
    error = "",
    source = "",
  } = progressStatus;

  return {
    inProgress,
    percents,
    completed,
    error,
    source,
  };
})(observer(ProgressContainer));
