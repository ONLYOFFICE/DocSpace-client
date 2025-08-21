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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";

import FilesFilter from "@docspace/shared/api/files/filter";

import Section from "@docspace/shared/components/section";

import useDeviceType from "@/hooks/useDeviceType";
import { useSettingsStore } from "../../_store/SettingsStore";

type SectionProps = {
  sectionHeaderContent: React.ReactNode;
  sectionFilterContent: React.ReactNode;
  sectionBodyContent: React.ReactNode;

  isEmptyPage: boolean;
  filesFilter: string;

  showFilter?: boolean;
  showHeader?: boolean;
};

export const SectionWrapper = observer(
  ({
    sectionHeaderContent,
    sectionFilterContent,
    sectionBodyContent,
    isEmptyPage,
    filesFilter,
    showFilter = true,
  }: SectionProps) => {
    const searchParams = useSearchParams();

    const getValue = (key: string) => {
      const value = searchParams.get(key);
      return value === "true" ? true : value === "false" ? false : value;
    };

    showFilter = getValue("showFilter") as boolean;

    const [isFiltered, setIsFiltered] = React.useState(() =>
      FilesFilter.getFilter({
        search: `?${filesFilter}`,
      } as Location)!.isFiltered(),
    );

    React.useEffect(() => {
      setIsFiltered(FilesFilter.getFilter(window.location)!.isFiltered());
    }, [searchParams]);

    const settingsStore = useSettingsStore();
    const { currentDeviceType } = useDeviceType();

    const isEmptyList = settingsStore.isEmptyList || isEmptyPage;

    return (
      <Section
        withBodyScroll
        settingsStudio={false}
        viewAs="row"
        isEmptyPage={isEmptyList}
        currentDeviceType={currentDeviceType}
      >
        <Section.SectionHeader>{sectionHeaderContent}</Section.SectionHeader>

        <Section.SectionFilter>
          {showFilter
            ? !isEmptyList
              ? sectionFilterContent
              : !isFiltered
                ? null
                : sectionFilterContent
            : null}
        </Section.SectionFilter>

        <Section.SectionBody>{sectionBodyContent}</Section.SectionBody>
      </Section>
    );
  },
);
