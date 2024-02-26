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
