/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React, { startTransition, useOptimistic } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { ComboBox, type TOption } from "@docspace/shared/components/combobox";
import { EmployeeType, FolderType } from "@docspace/shared/enums";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";

type Props = {
  defaultFolderType?: SettingsStore["defaultFolderType"];
  updateDefaultFolderType?: SettingsStore["updateDefaultFolderType"];
  userType?: UserStore["userType"];
};

const StartPageSettingComponent = ({
  defaultFolderType,
  updateDefaultFolderType,
  userType,
}: Props) => {
  const { t } = useTranslation(["FilesSettings", "Common"]);

  const [optimisticFolderType, setOptimisticFolderType] =
    useOptimistic<FolderType>(defaultFolderType!);

  const getStartPageOptions = () => {
    const isGuest = userType === EmployeeType.Guest;

    const unavailableOptions: FolderType[] = [];

    if (isGuest) {
      unavailableOptions.push(FolderType.USER);
    }

    const options = [
      {
        label: t("Common:AIAgents"),
        key: FolderType.AIAgents,
      },
      {
        label: t("Common:MyDocuments"),
        key: FolderType.USER,
      },
      {
        label: t("Common:Rooms"),
        key: FolderType.Rooms,
      },
      {
        label: t("Common:SharedWithMe"),
        key: FolderType.SHARE,
      },
      {
        label: t("Common:Favorites"),
        key: FolderType.Favorites,
      },
      {
        label: t("Common:Recent"),
        key: FolderType.Recent,
      },
    ];

    return options.filter((option) => !unavailableOptions.includes(option.key));
  };

  const startPageOptions = getStartPageOptions();

  const getSelectedStartPage = () => {
    return (
      startPageOptions.find((option) => option.key === optimisticFolderType) ||
      startPageOptions[0]
    );
  };

  const onSelectStartPage = async (option: TOption) => {
    if (option.key === optimisticFolderType) return;

    startTransition(async () => {
      setOptimisticFolderType(option.key as FolderType);
      await updateDefaultFolderType!(option.key as FolderType);
    });
  };

  return (
    <div className="default-page-setting">
      <Text lineHeight="20px" fontWeight={600}>
        {t("FilesSettings:StartPageSettingTitle")}
      </Text>
      <ComboBox
        options={startPageOptions}
        selectedOption={getSelectedStartPage()}
        onSelect={onSelectStartPage}
        scaled={false}
        scaledOptions
        displaySelectedOption
      />
    </div>
  );
};

export const DefaultPageSetting = inject(
  ({ settingsStore, userStore }: TStore) => {
    const { defaultFolderType, updateDefaultFolderType } = settingsStore;

    const { userType } = userStore;

    return { defaultFolderType, updateDefaultFolderType, userType };
  },
)(observer(StartPageSettingComponent));
