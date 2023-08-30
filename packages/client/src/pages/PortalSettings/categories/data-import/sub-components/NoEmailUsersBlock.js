import React from "react";
import { Trans } from "react-i18next";

export const NoEmailUsersBlock = ({ t, users }) => {
  return (
    <p className="users-without-email">
      <Trans t={t} ns="Settings" i18nKey="AccountsWithoutEmails">
        We found <b>{{ users }} users</b> without emails. You can add necessary data to their
        accounts on the next step.
      </Trans>
    </p>
  );
};
