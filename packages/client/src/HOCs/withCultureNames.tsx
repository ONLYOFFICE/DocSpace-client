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
import { withTranslation, I18nextProviderProps } from "react-i18next";

import { isBetaLanguage } from "@docspace/shared/utils";
import { flagsIcons } from "@docspace/shared/utils/image-flags";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";

type I18n = I18nextProviderProps["i18n"];

interface ComponentWithCultureNamesProps {
  tReady: boolean;
  cultures: string[];
  getPortalCultures: () => Promise<void>;
  i18n: I18n;
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
    const { tReady, cultures, i18n, getPortalCultures } = props;

    useEffect(() => {
      if (cultures.length > 0) return;

      getPortalCultures();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mapCulturesToArray = (culturesArg: string[], i18nArg: I18n) => {
      const t = i18nArg.getFixedT(null, "Common");
      return culturesArg.map((culture) => {
        return {
          key: culture,
          label: t(`Culture_${culture}`),
          icon: flagsIcons?.get(`${culture}.react.svg`),
          isBeta: isBetaLanguage(culture),
        };
      });
    };

    const cultureNames = useMemo(
      () => mapCulturesToArray(cultures, i18n),
      [cultures, i18n],
    );

    return cultures.length > 0 && tReady ? (
      <WrappedComponent {...(props as T)} cultureNames={cultureNames} />
    ) : (
      <Loader className="pageLoader" type={LoaderTypes.rombs} size="40px" />
    );
  };

  const Injected = inject<TStore>(({ settingsStore }) => {
    const { cultures, getPortalCultures } = settingsStore;
    return {
      cultures,
      getPortalCultures,
    };
  })(
    observer(withTranslation("Common")(ComponentWithCultureNames)),
  ) as React.FC<
    Omit<T, keyof (WrappedComponentProps & ComponentWithCultureNamesProps)>
  >;

  Injected.displayName = `withCultureNames(${displayName})`;

  return Injected;
}
