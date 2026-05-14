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