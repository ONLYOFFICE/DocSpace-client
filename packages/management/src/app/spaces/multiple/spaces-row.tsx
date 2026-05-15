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

"use client";

import DefaultLogoUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import CatalogSettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.react.svg?url";
import ChangeQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { Row } from "@docspace/ui-kit/components/rows";
import { ChangeStorageQuotaDialog } from "@docspace/shared/dialogs/change-storage-quota";
import { toastr } from "@docspace/ui-kit/components/toast";

import type { TPortals } from "@docspace/shared/api/management/types";

import { useStores } from "@/hooks/useStores";
import { RowContent } from "./row-content";
import styles from "./multiple.module.scss";

export const SpacesRow = ({
  item,
  tenantAlias,
  portals,
}: {
  item: TPortals;
  tenantAlias: string;
  portals: TPortals[];
}) => {
  const { t } = useTranslation(["Common", "Management"]);
  const router = useRouter();
  const { spacesStore } = useStores();
  const [isVisibleDialog, setIsVisibleDialog] = useState(false);
  const [isDisableQuota, setIsDisableQuota] = useState(false);
  const [protocol, setProtocol] = useState("");

  const { setDeletePortalDialogVisible, setCurrentPortal } = spacesStore;

  const logoElement = (
    <ReactSVG id={item.domain} src={DefaultLogoUrl} className="logo-icon" />
  );

  const onDelete = () => {
    if (portals.length === 1) {
      return toastr.error(t("Management:DeleteWarning"));
    }
    setCurrentPortal(item);
    setDeletePortalDialogVisible(true);
  };

  const onChangeQuota = () => {
    if (isDisableQuota) setIsDisableQuota(false);
    setIsVisibleDialog(true);
    return undefined;
  };

  const onDisableQuota = () => {
    setIsDisableQuota(true);
    setIsVisibleDialog(true);
    return undefined;
  };

  useEffect(() => {
    setProtocol(window?.location?.protocol);
  }, []);

  const contextOptionsProps = [
    {
      label: t("Common:Open"),
      key: "space_open",
      icon: ExternalLinkIcon,
      onClick: () => window.open(`${protocol}//${item.domain}/`, "_blank"),
    },
    {
      key: "separator",
      isSeparator: true,
    },
    {
      label: t("Common:Delete"),
      key: "space_delete",
      icon: DeleteReactSvgUrl,
      onClick: onDelete,
    },
  ];

  if (item.wizardSettings.completed) {
    contextOptionsProps.splice(
      1,
      0,
      {
        label: t("Common:Settings"),
        key: "space_settings",
        icon: CatalogSettingsReactSvgUrl,
        onClick: () =>
          window.open(`${protocol}//${item.domain}/portal-settings/`, "_blank"),
      },
      {
        label: t("Common:ManageStorageQuota"),
        key: "change_quota",
        icon: ChangeQuotaReactSvgUrl,
        onClick: onChangeQuota,
      },
      {
        key: "disable_quota",
        label: t("Common:DisableQuota"),
        icon: DisableQuotaReactSvgUrl,
        onClick: onDisableQuota,
      },
    );
  }

  const updateFunction = async () => {
    router.refresh();
  };

  return (
    <>
      <ChangeStorageQuotaDialog
        isVisible={isVisibleDialog}
        updateFunction={updateFunction}
        onClose={() => setIsVisibleDialog(false)}
        portalInfo={item}
        isDisableQuota={isDisableQuota}
      />
      <Row
        className={styles.spaceRow}
        key={item.domain}
        element={logoElement}
        contextOptions={contextOptionsProps}
      >
        <RowContent item={item} tenantAlias={tenantAlias} />
      </Row>
    </>
  );
};
