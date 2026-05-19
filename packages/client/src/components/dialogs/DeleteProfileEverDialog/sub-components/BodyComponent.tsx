/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Nullable, TTranslation } from "@docspace/shared/types";
import { TUser } from "@docspace/shared/api/people/types";

import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import { TFunction } from "i18next";
import { getBrandName } from "@docspace/shared/constants/brands";

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
  const warningMessageMyDocuments = t("UserFilesRemovalScope", {
    sectionNameFirst: t("Common:MyDocuments"),
    sectionNameSecond: t("Common:TrashSection"),
  });

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
      t={t as TFunction}
      values={{
        warningMessageMyDocuments,
        userPerformedDeletion: userPerformedDeletion!.displayName,
        userYou: t("Common:You"),
      }}
      components={{
        1: <strong />,
      }}
    />
  );

  const warningMessage =
    needReassignData || onlyGuests
      ? warningMessageReassign
      : warningMessageMyDocuments;

  const deleteMessage = (
    <Trans
      i18nKey="DeleteUserMessage"
      ns="DeleteProfileEverDialog"
      t={t as TFunction}
      values={{
        userCaption: onlyGuests ? t("Common:Guest") : t("Common:User"),
        user: users[0].displayName,
      }}
      components={{
        1: <strong />,
      }}
    />
  );

  if (deleteWithoutReassign) {
    return (
      <>
        <Text className="user-delete">
          {onlyGuests
            ? t("ActionCannotBeUndoneGuests", {
                productName: getBrandName("ProductName"),
              })
            : t("ActionCannotBeUndoneUsers", {
                productName: getBrandName("ProductName"),
              })}
        </Text>
        <Text className="text-warning">{t("PleaseNote")}</Text>
        <Text className="text-delete-description">
          {t("PersonalDataDeletionInfo", {
            productName: getBrandName("ProductName"),
            sectionNameFirst: t("Common:MyDocuments"),
            sectionNameSecond: t("Common:TrashSection"),
          })}
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
          {onlyGuests
            ? t("ActionCannotBeUndoneGuests", {
                productName: getBrandName("ProductName"),
              })
            : t("ActionCannotBeUndoneUsers", {
                productName: getBrandName("ProductName"),
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

      {needReassignData ? (
        <Link
          className="reassign-data"
          type={LinkType.action}
          fontSize="13px"
          fontWeight={600}
          isHovered
          onClick={onClickReassignData}
          dataTestId="dialog_reassign_data_link"
        >
          {t("DeleteProfileEverDialog:ReassignDataToAnotherUser")}
        </Link>
      ) : null}
    </>
  );
};

export default inject(({ userStore }: TStore) => {
  return {
    userPerformedDeletion: userStore.user,
  };
})(observer(BodyComponent));
