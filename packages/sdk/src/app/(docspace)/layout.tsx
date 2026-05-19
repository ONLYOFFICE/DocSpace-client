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
import { cookies, headers } from "next/headers";

import FilesFilter from "@docspace/shared/api/files/filter";
import { TFilesSettings, TGetFolder } from "@docspace/shared/api/files/types";
import type { TViewAs } from "@docspace/shared/types";

import {
  FILTER_HEADER,
  PAGE_COUNT,
  PATHNAME_HEADER,
  SHARE_KEY_HEADER,
} from "@/utils/constants";
import { getFilesSettings, getFolder } from "@/api/files";

import { Layout } from "./_components/layout";
import { SectionWrapper as Section } from "./_components/section";
import FilesMediaViewer from "./_components/FilesMediaViewer";
import SelectionArea from "./_components/selection-area";
import Header, { type HeaderProps } from "./_components/header";
import { Filter, FilterProps } from "./_components/filter";
import { DeviceTypeObserver } from "./_components/DeviceTypeObserver";
import Dialogs from "./_components/dialogs";
import RootScrollbar from "./_components/RootScrollbar";

export default async function DocspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const cookieStore = await cookies();

  const filter = hdrs.get(FILTER_HEADER);
  const shareKey = hdrs.get(SHARE_KEY_HEADER);
  const initViewAs = (cookieStore.get("viewAs")?.value || "row") as TViewAs;

  const navigationProps: HeaderProps = {} as HeaderProps;

  const filterProps: FilterProps = {
    filesFilter: filter,
    shareKey,
  } as FilterProps;

  let filesSettings: TFilesSettings | undefined;
  let folderList: TGetFolder | undefined;

  if (filter) {
    const pathname = hdrs.get(PATHNAME_HEADER) ?? "";

    const filesFilter = FilesFilter.getFilter({
      search: `?${filter}`,
      pathname,
    } as Location)!;

    filesFilter.pageCount = PAGE_COUNT;

    try {
      [filesSettings, folderList] = await Promise.all([
        getFilesSettings(),
        getFolder(filesFilter.folder, filesFilter),
      ]);
    } catch {
      filesSettings = await getFilesSettings().catch(() => undefined);
    }
  } else {
    filesSettings = await getFilesSettings().catch(() => undefined);
  }

  if (folderList) {
    const { current, pathParts, folders, files } = folderList;

    navigationProps.current = current;
    navigationProps.pathParts = pathParts;
    navigationProps.isEmptyList = !folders.length && !files.length;
  }

  const folders = folderList?.folders ?? [];
  const files = folderList?.files ?? [];

  return (
    <main style={{ width: "100%", height: "100%" }}>
      <Layout initSettingsStoreData={{ viewAs: initViewAs }}>
        <RootScrollbar>
          <Section
            sectionHeaderContent={
              <Header {...navigationProps} />
            }
            sectionFilterContent={filter ? <Filter {...filterProps} /> : null}
            sectionBodyContent={children}
            isEmptyPage={folders.length === 0 ? files.length === 0 : false}
            filesFilter={filter ?? ""}
          />
          <SelectionArea />
          <FilesMediaViewer
            filesSettings={filesSettings as TFilesSettings}
          />
          <DeviceTypeObserver />
          <Dialogs />
        </RootScrollbar>
      </Layout>
    </main>
  );
}
