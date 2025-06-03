// (c) Copyright Ascensio System SIA 2009-2025
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

import { useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { TRoom } from "@docspace/shared/api/rooms/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import {
  ContextMenu,
  ContextMenuRefType,
} from "@docspace/shared/components/context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";

import ContextOptionsStore from "SRC_DIR/store/ContextOptionsStore";

import styles from "./itemTitle.module.scss";

export type TSelection = TRoom | TFile | TFolder;

type RoomsContextBtnProps = {
  selection: TSelection;

  getItemContextOptionsActions?: ContextOptionsStore["getFilesContextOptions"];
};

const RoomsContextBtn = ({
  selection,

  getItemContextOptionsActions,
}: RoomsContextBtnProps) => {
  const { t } = useTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
    "SharingPanel",
  ]);
  const contextMenuRef = useRef<ContextMenuRefType>(null);

  const onContextMenu = (e: React.MouseEvent) => {
    if (!contextMenuRef?.current?.menuRef.current)
      contextMenuRef?.current?.show(e);
  };

  const getData = useCallback(() => {
    if (!getItemContextOptionsActions) return [];
    return getItemContextOptionsActions(selection, t, true);
  }, [selection, t, getItemContextOptionsActions]);

  const data = useMemo(() => getData(), [selection, t]);

  return (
    <div className={styles.itemContextOptions}>
      <ContextMenuButton
        id="info-options"
        className="expandButton"
        title={
          "isFolder" in selection && selection.isFolder
            ? t("Translations:TitleShowFolderActions")
            : t("Translations:TitleShowActions")
        }
        onClick={onContextMenu}
        getData={getData}
        directionX="right"
        displayType={ContextMenuButtonDisplayType.toggle}
      />
      <ContextMenu
        ref={contextMenuRef}
        getContextModel={getData}
        model={data}
        withBackdrop
        baseZIndex={310}
      />
    </div>
  );
};

export default inject(({ contextOptionsStore }: TStore) => ({
  getItemContextOptionsActions: contextOptionsStore.getFilesContextOptions,
}))(observer(RoomsContextBtn));
