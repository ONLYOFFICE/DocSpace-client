// (c) Copyright Ascensio System SIA 2009-2024
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

import { observer, inject } from "mobx-react";
import React, { useEffect, useMemo } from "react";
import { withTranslation } from "react-i18next";

import { getCookie, setCookie } from "@docspace/shared/utils/cookie";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";
import { COOKIE_EXPIRATION_YEAR, LANGUAGE } from "@docspace/shared/constants";
import { mapCulturesToArray } from "@docspace/shared/utils/common";
import i18n from "../i18n";

interface ComponentWithCultureNamesProps {
  tReady: boolean;
  cultures: string[];
  isAuthenticated: boolean;
  getPortalCultures: () => Promise<void>;
}

interface WrappedComponentProps extends ComponentWithCultureNamesProps {
  cultureNames: {
    key: string;
    label: string;
    icon: string;
    isBeta: boolean;
  };
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
      if (cultures.length > 0) return;

      getPortalCultures();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cultureNames = useMemo(
      () => mapCulturesToArray(cultures, isAuthenticated, i18n),
      [cultures, isAuthenticated],
    );
    const url = new URL(window.location.href);
    const culture = url.searchParams.get("culture");
    const currentCultureName = culture ?? getCookie(LANGUAGE);
    const selectedCultureObj = cultureNames.find(
      (item) => item.key === currentCultureName,
    );

    const onLanguageSelect = (e: KeyboardEvent) => {
      i18n.changeLanguage(e.key);

      setCookie(LANGUAGE, e.key, {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });

      if (culture) {
        window.location.href = url.replace(
          `culture=${culture}`,
          `culture=${e.key}`,
        );
      }
    };

    return cultures.length > 0 && tReady ? (
      <WrappedComponent
        {...(props as T)}
        cultureNames={cultureNames}
        currentCultureName={currentCultureName}
        onLanguageSelect={onLanguageSelect}
        selectedCultureObj={selectedCultureObj}
      />
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
