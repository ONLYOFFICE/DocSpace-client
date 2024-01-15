import React from "react";
import styled from "styled-components";
import { Badge } from "@docspace/shared/components/badge";

import { useTranslation } from "react-i18next";

import { inject, observer } from "mobx-react";

const StyledBadge = styled(Badge)`
  p {
    background-color: transparent;
  }
`;

const StatusBadge = (props) => {
  const { status, theme } = props;

  const badgeColorScheme =
    status >= 200 && status < 300
      ? theme.isBase
        ? {
            backgroundColor: "rgba(53, 173, 23, 0.1)",
            color: "#35AD17",
          }
        : {
            backgroundColor: "rgba(59, 164, 32, 0.1)",
            color: "#3BA420",
          }
      : theme.isBase
        ? {
            backgroundColor: "rgba(242, 28, 14, 0.1)",
            color: "#F21C0E",
          }
        : {
            backgroundColor: "rgba(224, 100, 81, 0.1)",
            color: "#E06451",
          };
  const { t } = useTranslation(["Webhooks"]);

  if (status === undefined) {
    return;
  }

  return (
    <StyledBadge
      id="webhook-status"
      backgroundColor={badgeColorScheme.backgroundColor}
      color={badgeColorScheme.color}
      label={status === 0 ? t("NotSent") : status.toString()}
      fontSize="9px"
      maxWidth="80px"
      fontWeight={700}
      noHover
    />
  );
};

export default inject(({ auth }) => {
  const { settingsStore } = auth;

  const { theme } = settingsStore;

  return {
    theme,
  };
})(observer(StatusBadge));
