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

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@docspace/ui-kit/components";
import { Card } from "@docspace/ui-kit/components/card";
import { Text } from "@docspace/ui-kit/components/text";
import { ActionButton } from "@docspace/ui-kit/components/action-button";
import { Link as LinkButton, LinkType } from "@docspace/ui-kit/components/link";
import type { TFile } from "@docspace/ui-kit/types";

import SpreadsheetReactSvg from "PUBLIC_DIR/images/icons/16/spreadsheet.svg";
import FolderSvg from "PUBLIC_DIR/images/icons/12/folder.svg";
import ExternalLinkSvg from "PUBLIC_DIR/images/external.link.react.svg";

import styles from "./FormInfo.module.scss";
import { ConnectedBadge } from "./ConnectedBadge";
import { isFormFile } from "./FormInfo.utils";
import type { FormInfoState, Selection } from "./FormInfo.types";

type CollectionCardProps = {
  selection: Selection;
  state: FormInfoState;
  onGoToCompleteFolder: (file: TFile) => void;
  onFillForm: () => void;
  onConnect: () => void;
};

export const CollectionCard = ({
  selection,
  state,
  onGoToCompleteFolder,
  onFillForm,
  onConnect,
}: CollectionCardProps) => {
  const { t } = useTranslation(["InfoPanel", "Common"]);
  const { collectionConnected, isRoom, canEditRoom } = state;

  const title = (
    <span className={styles.cardTitle}>
      <SpreadsheetReactSvg className={styles.cardIcon} />
      {t("InfoPanel:FormRoomCollectionTitle")}
    </span>
  );

  const description = useMemo(() => {
    if (collectionConnected) {
      if (isRoom)
        return t("InfoPanel:FormRoomCollectionConnectedDescriptionRoom");
      return t("InfoPanel:FormRoomCollectionConnectedDescription");
    }
    return t("InfoPanel:FormRoomCollectionNotConnectedDescription");
  }, [collectionConnected, isRoom, t]);

  const renderAction = () => {
    if (collectionConnected) {
      if (!isFormFile(selection)) return null;

      return (
        <>
          <ActionButton
            id="complete-folder"
            label={t("InfoPanel:FormRoomGoToCompleteFolder")}
            icon={<FolderSvg />}
            onClick={() => onGoToCompleteFolder(selection)}
            disabled={!selection.resultsFolderId}
          />
          {!selection.resultsFolderId ? (
            <Tooltip anchorSelect="#complete-folder" clickable>
              <Text>{t("InfoPanel:FormRoomNoSubmissionsYet")}</Text>
              <Text>{t("InfoPanel:FormRoomResultsFolderNote")}</Text>
              <LinkButton
                color="accent"
                onClick={onFillForm}
                type={LinkType.page}
                className={styles.tooltipLink}
              >
                {t("Common:FillOutTheForm")}
              </LinkButton>
            </Tooltip>
          ) : null}
        </>
      );
    }

    if (!canEditRoom) return null;

    return (
      <ActionButton
        label={t("Common:Connect")}
        icon={<ExternalLinkSvg />}
        onClick={onConnect}
      />
    );
  };

  return (
    <Card
      title={title}
      extra={collectionConnected ? <ConnectedBadge /> : undefined}
      footer={renderAction()}
      className={styles.block}
    >
      <p className={styles.cardDescription}>{description}</p>
    </Card>
  );
};