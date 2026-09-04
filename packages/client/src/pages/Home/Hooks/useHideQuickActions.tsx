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
import { Trans } from "react-i18next";

import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TFunction } from "i18next";
import type { TTranslation } from "@docspace/shared/types";

type UseHideQuickActionsProps = {
  t: TTranslation;
  setShowQuickActions?: (value: boolean) => void;
};

/**
 * Hides the quick-actions banner and offers one chance to take it back.
 *
 * The choice sticks for the whole profile, so the toast is the only place that
 * reverses it without a trip to the settings. Once it goes, restoring is
 * Profile - File management - "Show quick actions"; nothing is left on the page
 * to expand the banner again.
 */
export const useHideQuickActions = ({
  t,
  setShowQuickActions,
}: UseHideQuickActionsProps) => {
  return React.useCallback(() => {
    setShowQuickActions?.(false);

    // The Undo handler runs long after this call returns, so it can read the id
    // it is nested in: it dismisses this toast alone and leaves any other
    // notification standing.
    const toastId = toastr.success(
      <Trans
        t={t as TTranslation & TFunction}
        i18nKey="Common:QuickActionsHiddenDescription"
        components={[
          <Link
            key="undo"
            tag="a"
            isHovered
            color="accent"
            onClick={() => {
              toastr.clear(toastId);
              setShowQuickActions?.(true);
            }}
          />,
        ]}
      />,
      t("Common:QuickActionsHidden"),
      undefined,
      // Without a cross the toast closes on any click inside it, so the Undo
      // link would be swallowed by the dismissal before its handler ran.
      true,
    );
  }, [t, setShowQuickActions]);
};

export default useHideQuickActions;
