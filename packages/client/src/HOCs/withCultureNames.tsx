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

import { observer, inject } from "mobx-react";
import React, { useEffect, useMemo } from "react";
import { withTranslation } from "react-i18next";

import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { mapCulturesToArray } from "@docspace/shared/utils/cultures";

interface ComponentWithCultureNamesProps {
  tReady?: boolean;
  cultures?: string[];
  isAuthenticated?: boolean;
  getPortalCultures?: () => Promise<void>;
}

interface WrappedComponentProps extends ComponentWithCultureNamesProps {
  cultureNames?: {
    key: string;
    label: string;
    icon: string;
    isBeta: boolean;
    index?: number;
  }[];
}

export default function withCultureNames<
  T extends WrappedComponentProps = WrappedComponentProps,
>(WrappedComponent: React.ComponentType<T>) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithCultureNames = (
    props: Omit<T, keyof WrappedComponentProps> &
      ComponentWithCultureNamesProps,
  ) => {
    const { tReady, cultures, getPortalCultures, isAuthenticated } = props;

    useEffect(() => {
      if (cultures && cultures.length > 0) return;

      getPortalCultures?.();
    }, []);

    const cultureNames = useMemo(
      () => (cultures ? mapCulturesToArray(cultures, true) : []),
      [cultures, isAuthenticated],
    );

    return cultures && cultures.length > 0 && tReady ? (
      <WrappedComponent {...(props as T)} cultureNames={cultureNames} />
    ) : (
      <Loader className="pageLoader" type={LoaderTypes.rombs} size="40px" />
    );
  };

  const Injected = inject<TStore>(({ authStore, settingsStore }) => {
    const { cultures, getPortalCultures } = settingsStore;
    const { isAuthenticated } = authStore;
    return {
      cultures,
      getPortalCultures,
      isAuthenticated,
    };
  })(
    observer(withTranslation("Common")(ComponentWithCultureNames)),
  ) as React.FC<
    Omit<T, keyof (WrappedComponentProps & ComponentWithCultureNamesProps)>
  >;

  Injected.displayName = `withCultureNames(${displayName})`;

  return Injected;
}

