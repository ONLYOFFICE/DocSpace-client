// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkType } from "@docspace/shared/components/link";
import { Nullable, TTranslation } from "@docspace/shared/types";
import { TUser } from "@docspace/shared/api/people/types";

import UsersStore from "SRC_DIR/store/contacts/UsersStore";

type BodyComponentProps = {
  needReassignData: boolean;
  deleteWithoutReassign: boolean;
  onClickReassignData: VoidFunction;
  t: TTranslation;
  userPerformedDeletion?: Nullable<TUser>;
  users: UsersStore["selection"];
  onlyOneUser: boolean;
  onlyGuests: boolean;
};

const BodyComponent = ({
  needReassignData,
  deleteWithoutReassign,
  onClickReassignData,
  t,
  userPerformedDeletion,
  users,
  onlyOneUser,
  onlyGuests,
}: BodyComponentProps) => {
  const warningMessageMyDocuments = t("DeleteMyDocumentsUser");

  const warningMessageReassign = onlyGuests ? (
    t("DeleteReqassignDescriptionGuest", {
      userCaption: onlyOneUser
        ? t("Common:Guest").toLowerCase()
        : t("Common:Guests").toLowerCase(),
    })
  ) : (
    <Trans
      i18nKey="DeleteReassignDescriptionUser"
      ns="DeleteProfileEverDialog"
      t={t}
    >
      {{ warningMessageMyDocuments }}
      <strong>
        {{ userPerformedDeletion: userPerformedDeletion!.displayName }}
        {{ userYou: t("Common:You") }}
      </strong>
    </Trans>
  );

  const warningMessage =
    needReassignData || onlyGuests
      ? warningMessageReassign
      : warningMessageMyDocuments;

  const deleteMessage = (
    <Trans i18nKey="DeleteUserMessage" ns="DeleteProfileEverDialog" t={t}>
      {{ userCaption: onlyGuests ? t("Common:Guest") : t("Common:User") }}
      <strong>{{ user: users[0].displayName }}</strong>
    </Trans>
  );

  if (deleteWithoutReassign) {
    return (
      <>
        <Text className="user-delete">
          {t("ActionCannotBeUndone", { productName: t("Common:ProductName") })}
        </Text>
        <Text className="text-warning">{t("PleaseNote")}</Text>
        <Text className="text-delete-description">
          {t("DeletePersonalData", { productName: t("Common:ProductName") })}
        </Text>
        <Text className="text-delete-description">
          {t("CannotReassignFiles")}
        </Text>
        <Text className="text-delete-description">
          {t("ToBeAbleToReassignData")}
        </Text>
        <Text className="text-delete-description">
          {t("DeletePersonalDataApplicable")}
        </Text>
      </>
    );
  }

  if (!onlyOneUser) {
    return (
      <>
        <Text className="user-delete">
          {t("ActionCannotBeUndone", {
            productName: t("Common:ProductName"),
            userCaption: onlyGuests
              ? t("Common:Guests").toLowerCase()
              : t("Common:Users").toLowerCase(),
          })}
        </Text>

        <Text className="text-warning">{t("Common:Warning")}</Text>
        <Text className="text-delete-description">{warningMessage}</Text>
      </>
    );
  }

  return (
    <>
      <Text className="user-delete">{deleteMessage}</Text>

      <Text className="text-warning">{t("Common:Warning")}</Text>
      <Text className="text-delete-description">{warningMessage}</Text>

      {needReassignData && (
        <Link
          className="reassign-data"
          type={LinkType.action}
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

export default inject(({ userStore }: TStore) => {
  return {
    userPerformedDeletion: userStore.user,
  };
})(observer(BodyComponent));
