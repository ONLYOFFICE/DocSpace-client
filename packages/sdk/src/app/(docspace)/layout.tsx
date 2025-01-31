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
import { headers } from "next/headers";

import FilesFilter from "@docspace/shared/api/files/filter";
import { TFilesSettings, TGetFolder } from "@docspace/shared/api/files/types";

import {
  FILTER_HEADER,
  PAGE_COUNT,
  SHARE_KEY_HEADER,
  THEME_HEADER,
} from "@/utils/constants";
import { getFilesSettings, getFolder } from "@/api/files";

import { Layout } from "./_components/layout";
import { SectionWrapper as Section } from "./_components/section";
import Header, { HeaderProps } from "./_components/header";
import { Filter, FilterProps } from "./_components/filter";

export default async function DocspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = headers();

  const filter = hdrs.get(FILTER_HEADER);
  const theme = hdrs.get(THEME_HEADER);
  const shareKey = hdrs.get(SHARE_KEY_HEADER);

  const navigationProps: HeaderProps = {} as HeaderProps;

  const filterProps: FilterProps = {
    filesFilter: filter,
    shareKey,
  } as FilterProps;

  const actions: unknown[] = [getFilesSettings()];

  if (filter) {
    const filesFilter = FilesFilter.getFilter({
      search: `?${filter}`,
    } as Location)!;

    filesFilter.pageCount = PAGE_COUNT;

    actions.push(getFolder(filesFilter.folder, filesFilter));
  }

  const [filesSettings, folderList] = await Promise.all(actions);

  filterProps.filesSettings = filesSettings as TFilesSettings;

  const { current, pathParts, folders, files } = folderList as TGetFolder;

  navigationProps.current = current;
  navigationProps.pathParts = pathParts;
  navigationProps.isEmptyList = !folders.length && !files.length;

  return (
    <main style={{ width: "100%", height: "100%" }}>
      <Layout>
        <Section
          sectionHeaderContent={<Header {...navigationProps} />}
          sectionFilterContent={<Filter {...filterProps} />}
          sectionBodyContent={children}
          isEmptyPage={folders.length === 0 && files.length === 0}
          filesFilter={filter!}
        />
      </Layout>
    </main>
  );
}
