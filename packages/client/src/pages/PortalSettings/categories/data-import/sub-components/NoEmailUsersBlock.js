import React from "react";
import { Trans } from "react-i18next";

export const NoEmailUsersBlock = ({ t, users, isCurrentStep }) => {
  return isCurrentStep ? (
    <p className="users-without-email">
      <Trans t={t} ns="Settings" i18nKey="AccountsWithoutEmails">
        We found <b>{{ users }} users</b> without emails. You can fill their emails or continue
        without this action.
      </Trans>
    </p>
  ) : (
    <p className="users-without-email">
      <Trans t={t} ns="Settings" i18nKey="AccountsWithoutEmailsNextStep">
        We found <b>{{ users }} users</b> without emails. You can add necessary data to their
        accounts on the next step.
      </Trans>
    </p>
  );
};
