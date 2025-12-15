import { Trans } from "react-i18next";
import { NoEmailUsersProps } from "../types";
import { Text } from "@docspace/shared/components/text";

export const NoEmailUsersBlock = ({
  t,
  users,
  isSelectUsersStep,
}: NoEmailUsersProps) => {
  const kepProps = isSelectUsersStep
    ? { tKey: "AccountsUsersWithoutEmails" }
    : { tKey: "AccountsWithoutEmails" };

  return (
    <p className="users-without-email">
      <Trans
        t={t}
        ns="Settings"
        i18nKey={kepProps.tKey}
        values={{ users }}
        components={{ 1: <Text as="span" fontWeight="600" /> }}
      />
    </p>
  );
};
