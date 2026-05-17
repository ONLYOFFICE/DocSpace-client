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

import React, { useEffect } from "react";
import { useLocation } from "react-router";
import Article from "@docspace/ui-kit/components/article";
import { inject, observer } from "mobx-react";
import Section from "@docspace/ui-kit/components/section";
import { DeviceType } from "@docspace/shared/enums";

import withLoading from "SRC_DIR/HOCs/withLoading";
import ArticleWrapper from "SRC_DIR/components/ArticleWrapper";

import SectionWrapper from "SRC_DIR/components/Section";

import SectionHeaderContent from "./Section/Header";
import { ArticleHeaderContent, ArticleBodyContent } from "./Article";
import Warning from "./WarningComponent";


const ArticleSettings = React.memo(
  ({ showArticleLoader, needPageReload, isNotPaidPeriod }) => {
    const onLogoClickAction = () => {
      if (needPageReload) {
        window.location.replace("/");
      }
    };

    return (
      <ArticleWrapper
        showArticleLoader={showArticleLoader}
        onLogoClickAction={onLogoClickAction}
        showBackButton={!isNotPaidPeriod}
      >
        <Article.Header>
          <ArticleHeaderContent />
        </Article.Header>

        <Article.Body>
          <ArticleBodyContent />
        </Article.Body>
      </ArticleWrapper>
    );
  },
);

ArticleSettings.displayName = "ArticleSettings";

const Layout = ({
  currentProductId,
  setCurrentProductId,
  language,
  children,
  isGeneralPage,
  enablePlugins,
  isInitPlugins,
  initPlugins,

  isLoadedArticleBody,
  needPageReload,
  isNotPaidPeriod,
  currentDeviceType,
}) => {
  const location = useLocation();

  useEffect(() => {
    const sel = window.getSelection?.();
    if (sel?.rangeCount) sel.removeAllRanges();
  }, [location.pathname]);

  useEffect(() => {
    currentProductId !== "settings" && setCurrentProductId("settings");
  }, [language, currentProductId, setCurrentProductId]);

  useEffect(() => {
    if (enablePlugins && !isInitPlugins) initPlugins();
  }, [enablePlugins, isInitPlugins, initPlugins]);

  return (
    <>
      <ArticleSettings
        showArticleLoader={!isLoadedArticleBody}
        needPageReload={needPageReload}
        isNotPaidPeriod={isNotPaidPeriod}
      />
      {!isGeneralPage ? (
        <SectionWrapper viewAs="settings" withBodyScroll settingsStudio>
          <Section.SectionHeader>
            <SectionHeaderContent />
          </Section.SectionHeader>

          {currentDeviceType !== DeviceType.desktop ? (
            <Section.SectionWarning>
              <Warning />
            </Section.SectionWarning>
          ) : null}

          <Section.SectionBody>{children}</Section.SectionBody>
        </SectionWrapper>
      ) : null}
    </>
  );
};

export default inject(
  ({
    authStore,
    settingsStore,
    setup,
    pluginStore,
    currentTariffStatusStore,
  }) => {
    const { language } = authStore;
    const { addUsers } = setup.headerAction;

    const {
      setCurrentProductId,
      enablePlugins,
      currentDeviceType,
      isLoadedArticleBody,
    } = settingsStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { isInit: isInitPlugins, initPlugins, needPageReload } = pluginStore;

    return {
      language,
      setCurrentProductId,
      addUsers,

      enablePlugins,
      isInitPlugins,
      initPlugins,

      isLoadedArticleBody,
      needPageReload,
      isNotPaidPeriod,
      currentDeviceType,
    };
  },
)(withLoading(observer(Layout)));
