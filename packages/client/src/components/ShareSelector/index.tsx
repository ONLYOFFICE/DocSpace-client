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
import { FC, useState } from "react";
import { inject, observer } from "mobx-react";

import { ShareSelector as ShareSelectorComponent } from "@docspace/shared/components/share/selector";

import { useEventListener } from "@docspace/shared/hooks/useEventListener";

import {
  ShareEventName,
  ShareUpdateListEventName,
} from "@docspace/shared/components/share/Share.constants";

import type { Nullable } from "@docspace/shared/types";
import { Portal } from "@docspace/shared/components/portal";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { RoomMember } from "@docspace/shared/api/rooms/types";

interface ShareSelectorProps {
  item: Nullable<TFile | TFolder>;
}

const ShareSelector: FC<ShareSelectorProps> = ({ item }) => {
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  useEventListener(ShareEventName, (event: CustomEvent) => {
    setOpen(event.detail.open);
  });

  const onSubmit = (list: RoomMember[]) => {
    const event = new CustomEvent<RoomMember[]>(ShareUpdateListEventName, {
      detail: list,
    });

    window.dispatchEvent(event);
  };

  if (!item || !open) return null;

  return (
    <Portal
      visible
      element={
        <ShareSelectorComponent
          item={item}
          withAccessRights
          onClose={onClose}
          onSubmit={onSubmit}
          onBackClick={onClose}
          onCloseClick={onClose}
        />
      }
    />
  );
};

export default inject<TStore>(({ infoPanelStore }) => {
  const { infoPanelSelection } = infoPanelStore;

  return {
    item: Array.isArray(infoPanelSelection) ? null : infoPanelSelection,
  };
})(observer(ShareSelector as FC));
