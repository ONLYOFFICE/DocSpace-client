import { Trans } from "react-i18next";
import { NoEmailUsersProps } from "../types";
import { Text } from "@docspace/shared/components/text";

export const NoEmailUsersBlock = ({
  t,
  users,
  isSelectUsersStep,
}: NoEmailUsersProps) => {
  return (
    <p className="users-without-email">
      {isSelectUsersStep ? (
        <Trans
          t={t}
          ns="Settings"
          i18nKey="AccountsUsersWithoutEmails"
          values={{ users }}
          components={{ 1: <Text as="span" fontWeight="600" /> }}
        />
      ) : (
        <Trans
          t={t}
          ns="Settings"
          i18nKey="AccountsWithoutEmails"
          values={{ users }}
          components={{ 1: <Text as="span" fontWeight="600" /> }}
        />
      )}
    </p>
  );
};
