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

"use client";

import React from "react";
import { observer } from "mobx-react";

import Section from "@docspace/ui-kit/components/section";
import type { TViewAs } from "@docspace/ui-kit/types";

import useDeviceType from "@/hooks/useDeviceType";
import useShowFilterParam from "@/hooks/useShowFilterParam";
import { useSettingsStore } from "../../_store/SettingsStore";

type SectionProps = {
  sectionHeaderContent: React.ReactNode;
  sectionFilterContent?: React.ReactNode;
  sectionBodyContent: React.ReactNode;
  sectionBannerContent?: React.ReactNode;
  sectionWarningContent?: React.ReactNode;

  infoPanelHeaderContent?: React.ReactNode;
  infoPanelBodyContent?: React.ReactNode;
  isInfoPanelVisible?: boolean;
  infoPanelWithoutScroll?: boolean;
  setIsInfoPanelVisible?: (visible: boolean) => void;

  chatPanelContent?: React.ReactNode;
  isChatPanelVisible?: boolean;
  setIsChatPanelVisible?: (visible: boolean) => void;

  isEmptyPage: boolean;
  filesFilter: string;

  showFilter?: boolean;
  showHeader?: boolean;
  viewAs?: TViewAs;
  /**
   * Render the banner inside the scrollable body so it scrolls away under the
   * sticky header (used by files to host the quick-action tiles above the
   * sticky filter). Defaults to the pinned-banner behaviour.
   */
  scrollableBanner?: boolean;
  /**
   * Render the (desktop) filter slot inside the scroll body as sticky and pin
   * the table header below it via `position: sticky` — used by files so the
   * quick-action tiles scroll away above a sticky filter without any host JS.
   */
  stickyTableHeader?: boolean;
};

export const SectionWrapper = observer(
  ({
    sectionHeaderContent,
    sectionFilterContent,
    sectionBodyContent,
    sectionBannerContent,
    sectionWarningContent,
    infoPanelHeaderContent,
    infoPanelBodyContent,
    isInfoPanelVisible,
    infoPanelWithoutScroll,
    setIsInfoPanelVisible,
    chatPanelContent,
    isChatPanelVisible,
    setIsChatPanelVisible,
    isEmptyPage,
    filesFilter,
    showFilter = true,
    viewAs,
    scrollableBanner,
    stickyTableHeader,
  }: SectionProps) => {
    const effectiveShowFilter = useShowFilterParam(showFilter);

    const settingsStore = useSettingsStore();
    const { currentDeviceType } = useDeviceType();

    const isEmptyList = settingsStore.isEmptyList || isEmptyPage;

    const showInfoPanel = !!(infoPanelHeaderContent || infoPanelBodyContent);
    const showChatPanel = !!chatPanelContent;

    return (
      <Section
        withBodyScroll
        settingsStudio={false}
        viewAs={viewAs ?? settingsStore.filesViewAs ?? "row"}
        isEmptyPage={isEmptyList}
        currentDeviceType={currentDeviceType}
        isInfoPanelAvailable={showInfoPanel}
        isInfoPanelVisible={isInfoPanelVisible}
        infoPanelWithoutScroll={infoPanelWithoutScroll}
        setIsInfoPanelVisible={setIsInfoPanelVisible}
        isChatPanelAvailable={showChatPanel}
        isChatPanelVisible={isChatPanelVisible}
        setIsChatPanelVisible={setIsChatPanelVisible}
        canDisplay={showInfoPanel}
        scrollableBanner={scrollableBanner}
        stickyTableHeader={stickyTableHeader}
      >
        {sectionBannerContent ? (
          <Section.SectionBanner>{sectionBannerContent}</Section.SectionBanner>
        ) : null}

        <Section.SectionHeader>{sectionHeaderContent}</Section.SectionHeader>

        <Section.SectionFilter>
          {effectiveShowFilter ? sectionFilterContent : null}
        </Section.SectionFilter>

        {sectionWarningContent ? (
          <Section.SectionWarning>
            {sectionWarningContent}
          </Section.SectionWarning>
        ) : null}

        <Section.SectionBody>{sectionBodyContent}</Section.SectionBody>

        <Section.InfoPanelHeader>
          {infoPanelHeaderContent}
        </Section.InfoPanelHeader>
        <Section.InfoPanelBody>{infoPanelBodyContent}</Section.InfoPanelBody>

        <Section.ChatPanel>{chatPanelContent}</Section.ChatPanel>
      </Section>
    );
  },
);

