import { observer, inject } from "mobx-react";
import React, { useEffect, useMemo } from "react";
import { withTranslation, I18nextProviderProps } from "react-i18next";

import { getCookie, setCookie } from "@docspace/shared/utils/cookie";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";
import { COOKIE_EXPIRATION_YEAR, LANGUAGE } from "@docspace/shared/constants";
import { mapCulturesToArray } from "@docspace/shared/utils/common";

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
    const { tReady, cultures, i18n, getPortalCultures, isAuthenticated } =
      props;

    useEffect(() => {
      if (cultures.length > 0) return;

      getPortalCultures();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cultureNames = useMemo(
      () => mapCulturesToArray(cultures, isAuthenticated, i18n),
      [cultures, i18n],
    );
    const url = new URL(window.location.href);
    const culture = url.searchParams.get("culture");
    const currentCultureName = culture ?? getCookie(LANGUAGE);
    const selectedCultureObj = cultureNames.find(
      (item) => item.key === currentCultureName,
    );

    const onLanguageSelect = (e) => {
      setCookie(LANGUAGE, e.key, {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });

      if (culture) {
        location.href = url.replace(`culture=${culture}`, `culture=${e.key}`);
        return;
      }

      location.reload();
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
