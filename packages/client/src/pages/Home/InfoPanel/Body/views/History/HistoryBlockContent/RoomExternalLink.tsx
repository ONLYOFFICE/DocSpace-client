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

import { decode } from "he";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import { TFeedData } from "@docspace/shared/api/rooms/types";
import { isRoom, isSharedLink } from "@docspace/shared/utils/typeGuards";

import type DialogsStore from "SRC_DIR/store/DialogsStore";

import { useHistorySelection } from "../hooks/useHistorySelection";
import styles from "../History.module.scss";

type ExternalHistoryRoomExternalLinkProps = {
  feedData: TFeedData;
  withWrapping?: boolean;
};

type InjectedRoomExternalLinkProps = {
  setEditLinkPanelIsVisible: DialogsStore["setEditLinkPanelIsVisible"];
  setLinkParams: DialogsStore["setLinkParams"];
};

type HistoryRoomExternalLinkProps = ExternalHistoryRoomExternalLinkProps &
  InjectedRoomExternalLinkProps;

const HistoryRoomExternalLink = ({
  feedData,
  withWrapping,
  setLinkParams,
  setEditLinkPanelIsVisible,
}: HistoryRoomExternalLinkProps) => {
  const { selection } = useHistorySelection();

  const { t } = useTranslation(["InfoPanel"]);

  const onEditLink = () => {
    if (!feedData.sharedTo) {
      toastr.error(t("FeedLinkWasDeleted"));
      return;
    }

    if (!selection || !isSharedLink(feedData)) {
      return;
    }

    setLinkParams({
      link: feedData,
      item: selection,
    });
    setEditLinkPanelIsVisible(true);
  };

  return (
    <div
      className={styles.historyLink}
      style={withWrapping ? { display: "inline", wordBreak: "break-all" } : {}}
      data-testid="history_external_link_container"
    >
      {isRoom(selection) && selection.security?.EditRoom ? (
        <Link
          className="text link"
          onClick={onEditLink}
          isTextOverflow
          style={withWrapping ? { display: "inline", textWrap: "wrap" } : {}}
          dataTestId="history_external_link_edit"
        >
          {decode(feedData.sharedTo?.title ?? "")}
        </Link>
      ) : (
        <Text as="span" className="text">
          {decode(feedData.sharedTo?.title ?? "")}
        </Text>
      )}
    </div>
  );
};

export default inject<
  TStore,
  ExternalHistoryRoomExternalLinkProps,
  InjectedRoomExternalLinkProps
>(({ dialogsStore }) => {
  const { setLinkParams, setEditLinkPanelIsVisible } = dialogsStore;

  return { setLinkParams, setEditLinkPanelIsVisible };
})(
  observer(HistoryRoomExternalLink as FC<ExternalHistoryRoomExternalLinkProps>),
);
