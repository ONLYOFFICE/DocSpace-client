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
import { FC, useState } from "react";

import { ShareSelector as ShareSelectorComponent } from "@docspace/shared/components/share/selector";

import { useEventListener } from "@docspace/ui-kit/hooks/useEventListener";

import {
  ShareEventName,
  ShareUpdateListEventName,
} from "@docspace/shared/components/share/Share.constants";

import type { Nullable } from "@docspace/shared/types";
import { Portal } from "@docspace/ui-kit/components/portal";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { RoomMember } from "@docspace/shared/api/rooms/types";

const ShareSelector: FC = () => {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<Nullable<TFile | TFolder>>(null);

  const onClose = () => {
    setOpen(false);
    setItem(null);
  };

  useEventListener("keyup", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  });

  useEventListener(ShareEventName, (event: CustomEvent) => {
    setOpen(event.detail.open);
    setItem(event.detail.item);
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

export default ShareSelector;
