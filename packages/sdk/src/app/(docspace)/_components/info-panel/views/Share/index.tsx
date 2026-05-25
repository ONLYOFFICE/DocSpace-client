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

"use client";

import React from "react";
import { observer } from "mobx-react";

import Share from "@docspace/shared/components/share";
import { ShareEventName } from "@docspace/shared/components/share/Share.constants";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import { useInfoPanelStore } from "@/app/(docspace)/_store/InfoPanelStore";
import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";
import { useShareData } from "@/app/(personal-files)/_hooks/useShareData";

type ShareViewProps = {
  selection: TFile | TFolder;
};

const ShareView = observer(({ selection }: ShareViewProps) => {
  const infoPanelStore = useInfoPanelStore();
  const docsUserStore = useDocsUserStore();

  const {
    shareChanged,
    setShareChanged,
    setEditLinkPanelIsVisible,
    setLinkParams,
    setEmbeddingPanelData,
  } = infoPanelStore;

  const { filesLink } = useShareData({ selection });

  const selfId = docsUserStore.user?.id ?? "";

  const onAddUser = React.useCallback((item: TFile | TFolder) => {
    const event = new CustomEvent(ShareEventName, {
      detail: { open: true, item },
    });
    window.dispatchEvent(event);
  }, []);

  return (
    <Share
      infoPanelSelection={selection}
      fileLinkProps={filesLink}
      selfId={selfId}
      shareChanged={shareChanged}
      setShareChanged={setShareChanged}
      setEditLinkPanelIsVisible={setEditLinkPanelIsVisible}
      setLinkParams={setLinkParams}
      setEmbeddingPanelData={setEmbeddingPanelData}
      onAddUser={onAddUser}
    />
  );
});

export default ShareView;
