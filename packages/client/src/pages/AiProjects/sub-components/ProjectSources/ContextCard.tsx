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
import { useTranslation } from "react-i18next";

import { Card } from "@onlyoffice/apps-ui-kit/components/card";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { ContextFolderDialog } from "@onlyoffice/apps-ui-kit/ai-agent/providers/files";
import { getFolderPath } from "@docspace/shared/api/files";
import { iconSize32 } from "@docspace/shared/utils/image-helpers";

import { SourceCardTitle } from "./SourceCardTitle";
import styles from "./ProjectSources.module.scss";

/**
 * The folder connected as the round's context: its name and where it sits,
 * with a way to pick another one (the same picker as the composer's
 * Context slot) or disconnect it. A session choice, not part of the saved
 * project.
 */
export const ContextCard = () => {
  const { t } = useTranslation(["Common"]);
  const { useCloudsStore } = useStores();
  const selected = useCloudsStore((s) => s.selectedFolderContext);
  const clearFolderContext = useCloudsStore((s) => s.clearFolderContext);

  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const [path, setPath] = React.useState<string[]>([]);

  const folderId = selected?.room.id;
  React.useEffect(() => {
    setPath([]);
    if (!folderId) return undefined;
    let disposed = false;
    getFolderPath(Number(folderId))
      .then((parts) => {
        if (!disposed) setPath(parts.map((part) => part.title));
      })
      .catch(() => {});
    return () => {
      disposed = true;
    };
  }, [folderId]);

  const openPicker = React.useCallback(() => setIsPickerVisible(true), []);
  const closePicker = React.useCallback(() => setIsPickerVisible(false), []);

  const getData = React.useCallback(
    (): ContextMenuModel[] => [
      {
        key: "change-context-folder",
        label: t("Common:AIProjectChangeContext"),
        onClick: openPicker,
      },
      ...(selected
        ? [
            {
              key: "disconnect-context-folder",
              label: t("Common:Disconnect"),
              onClick: clearFolderContext,
            },
          ]
        : []),
    ],
    [selected, openPicker, clearFolderContext, t],
  );

  return (
    <>
      <Card
        className={styles.card}
        dataTestId="ai-project-context"
        title={
          <SourceCardTitle
            icon={iconSize32.get("folder.svg") ?? ""}
            label={t("Common:AIProjectContext")}
            name={selected?.room.name ?? t("Common:AIProjectNotSet")}
          />
        }
        extra={
          <ContextMenuButton
            className={styles.menu}
            displayType={ContextMenuButtonDisplayType.dropdown}
            getData={getData}
            directionX="right"
            title={t("Common:AIProjectChangeContext")}
          />
        }
      >
        {selected ? (
          <div className={styles.body}>
            {path.length > 0 ? (
              <Text className={styles.hint} truncate title={path.join(" / ")}>
                {path.join(" / ")}
              </Text>
            ) : null}
            <Text className={styles.hint}>{t("Common:AIProjectContextHint")}</Text>
          </div>
        ) : (
          <div className={styles.body}>
            <Text className={styles.hint}>{t("Common:AIProjectContextHint")}</Text>
            <Button
              label={t("Common:AIProjectAddContext")}
              size={ButtonSize.small}
              onClick={openPicker}
              testId="ai-project-add-context"
            />
          </div>
        )}
      </Card>
      {isPickerVisible ? <ContextFolderDialog onClose={closePicker} /> : null}
    </>
  );
};

export default ContextCard;
