// (c) Copyright Ascensio System SIA 2009-2026
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

import { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { Events } from "@docspace/shared/enums";
import type { Nullable } from "@docspace/shared/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";

import EmptyPrivateRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.private.room.light.svg";
import EmptyPrivateRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.private.room.dark.svg";
import UploadDeviceIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";
import CreateNewFolderIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
import SecurityShieldIcon from "PUBLIC_DIR/images/icons/16/security.react.svg";

import styles from "./EmptyPrivateRoomView.module.scss";

type EmptyPrivateRoomViewProps = {
  security?: Nullable<TFolderSecurity | TRoomSecurity>;
};

const EmptyPrivateRoomView = ({ security }: EmptyPrivateRoomViewProps) => {
  const { t } = useTranslation(["EmptyView", "Common"]);
  const { isBase } = useTheme();

  const items = [
    t("EmptyView:PrivateRoomEmptyBenefitE2EE"),
    t("EmptyView:PrivateRoomEmptyBenefitAEAD"),
    t("EmptyView:PrivateRoomEmptyBenefitHPKE"),
    t("EmptyView:PrivateRoomEmptyBenefitKDF"),
  ];

  const onCreateFolder = useCallback(() => {
    const event: Event & { payload?: unknown } = new Event(Events.CREATE);
    (event as Event & { payload?: object }).payload = {
      id: -1,
      extension: undefined,
    };
    window.dispatchEvent(event);
  }, []);

  const onUploadFiles = useCallback(() => {
    const input = document.querySelector(
      ".custom-file-input-article",
    ) as HTMLElement | null;
    input?.click();
  }, []);

  const canCreate = !!security?.Create;

  return (
    <div className={styles.wrapper} data-testid="empty-private-room-view">
      <div className={styles.icon}>
        {isBase ? <EmptyPrivateRoomLightIcon /> : <EmptyPrivateRoomDarkIcon />}
      </div>
      <h3 className={styles.title}>{t("EmptyView:PrivateRoomEmptyTitle")}</h3>
      <ul className={styles.list}>
        {items.map((text) => (
          <li key={text} className={styles.listItem}>
            <SecurityShieldIcon />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      {canCreate ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionItem}
            onClick={onCreateFolder}
          >
            <CreateNewFolderIcon />
            <span className={styles.actionBody}>
              <span className={styles.actionTitle}>
                {t("Common:NewFolder")}
              </span>
              <span className={styles.actionDescription}>
                {t("EmptyView:CreateNewFileDescription")}
              </span>
            </span>
          </button>
          <button
            type="button"
            className={styles.actionItem}
            onClick={onUploadFiles}
          >
            <UploadDeviceIcon />
            <span className={styles.actionBody}>
              <span className={styles.actionTitle}>
                {t("EmptyView:UploadDeviceOptionTitle")}
              </span>
              <span className={styles.actionDescription}>
                {t("EmptyView:UploadDeviceOptionDescription")}
              </span>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

const InjectedEmptyPrivateRoomView = inject<TStore>(({ selectedFolderStore }) => {
  return {
    security: selectedFolderStore.security,
  };
})(observer(EmptyPrivateRoomView));

export default InjectedEmptyPrivateRoomView;
