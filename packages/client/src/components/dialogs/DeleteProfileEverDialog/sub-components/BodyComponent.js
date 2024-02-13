import React from "react";
import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";

const BodyComponent = (props) => {
  const {
    needReassignData,
    deleteWithoutReassign,
    onClickReassignData,
    t,
    userPerformedDeletion,
    users,
    onlyOneUser,
  } = props;

  const warningMessageMyDocuments = t("DeleteMyDocumentsUser");
  const warningMessageReassign = (
    <Trans
      i18nKey="DeleteReassignDescriptionUser"
      ns="DeleteProfileEverDialog"
      t={t}
    >
      {{ warningMessageMyDocuments }}
      <strong>
        {{ userPerformedDeletion: userPerformedDeletion.displayName }}
        {{ userYou: t("Common:You") }}
      </strong>
    </Trans>
  );

  const warningMessage = needReassignData
    ? warningMessageReassign
    : warningMessageMyDocuments;

  const deleteMessage = (
    <Trans i18nKey="DeleteUserMessage" ns="DeleteProfileEverDialog" t={t}>
      {{ userCaption: t("Common:User") }}
      <strong>{{ user: users[0].displayName }}</strong>
    </Trans>
  );

  if (deleteWithoutReassign) {
    return (
      <>
        <Text className="user-delete">{t("ActionCannotBeUndone")}</Text>
        <Text className="text-warning">{t("PleaseNote")}</Text>
        <Text className="text-delete-description">
          {t("CannotReassignFiles")}
        </Text>
        <Text className="text-delete-description">
          {t("ToBeAbleToReassignData")}
        </Text>
      </>
    );
  }

  if (!onlyOneUser) {
    return (
      <>
        <Text className="user-delete">{t("ActionCannotBeUndone")}</Text>
        <Text className="text-warning">{t("Common:Warning")}!</Text>
        <Text className="text-delete-description">{warningMessage}</Text>
      </>
    );
  }

  return (
    <>
      <Text className="user-delete">{deleteMessage}</Text>
      <Text className="text-warning">{t("Common:Warning")}!</Text>
      <Text className="text-delete-description">{warningMessage}</Text>

      {needReassignData && (
        <Link
          className="reassign-data"
          type="action"
          fontSize="13px"
          fontWeight={600}
          isHovered
          onClick={onClickReassignData}
        >
          {t("DeleteProfileEverDialog:ReassignDataToAnotherUser")}
        </Link>
      )}
    </>
  );
};

export default inject(({ userStore }) => {
  return {
    userPerformedDeletion: userStore.user,
  };
})(observer(BodyComponent));
