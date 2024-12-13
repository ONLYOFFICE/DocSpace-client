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

import React, { useCallback, useMemo } from "react";
import { isMobile } from "react-device-detect";
import { Paging } from "@docspace/shared/components/paging";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { FilterLoader } from "@docspace/shared/skeletons/filter";

const SectionPagingContent = ({
  fetchPeople,
  filter,
  setIsLoading,
  selectedCount,
  isLoaded,
  t,
}) => {
  const onNextClick = useCallback(
    (e) => {
      if (!filter.hasNext()) {
        e.preventDefault();
        return;
      }
      console.log("Next Clicked", e);

      const newFilter = filter.clone();
      newFilter.page++;

      setIsLoading(true);
      fetchPeople(newFilter).finally(() => setIsLoading(false));
    },
    [filter, fetchPeople, setIsLoading],
  );

  const onPrevClick = useCallback(
    (e) => {
      if (!filter.hasPrev()) {
        e.preventDefault();
        return;
      }

      console.log("Prev Clicked", e);

      const newFilter = filter.clone();
      newFilter.page--;

      setIsLoading(true);
      fetchPeople(newFilter).finally(() => setIsLoading(false));
    },
    [filter, fetchPeople, setIsLoading],
  );

  const onChangePageSize = useCallback(
    (pageItem) => {
      console.log("Paging onChangePageSize", pageItem);

      const newFilter = filter.clone();
      newFilter.page = 0;
      newFilter.pageCount = pageItem.key;

      setIsLoading(true);
      fetchPeople(newFilter).finally(() => setIsLoading(false));
    },
    [filter, fetchPeople, setIsLoading],
  );

  const onChangePage = useCallback(
    (pageItem) => {
      console.log("Paging onChangePage", pageItem);

      const newFilter = filter.clone();
      newFilter.page = pageItem.key;

      setIsLoading(true);
      fetchPeople(newFilter).finally(() => setIsLoading(false));
    },
    [filter, fetchPeople, setIsLoading],
  );

  const countItems = useMemo(
    () => [
      {
        key: 25,
        label: t("Common:CountPerPage", { count: 25 }),
      },
      {
        key: 50,
        label: t("Common:CountPerPage", { count: 50 }),
      },
      {
        key: 100,
        label: t("Common:CountPerPage", { count: 100 }),
      },
    ],
    [t],
  );

  const pageItems = useMemo(() => {
    if (filter.total < filter.pageCount) return [];
    const totalPages = Math.ceil(filter.total / filter.pageCount);
    return [...Array(totalPages).keys()].map((item) => {
      return {
        key: item,
        label: t("Common:PageOfTotalPage", {
          page: item + 1,
          totalPage: totalPages,
        }),
      };
    });
  }, [filter.total, filter.pageCount, t]);

  const emptyPageSelection = {
    key: 0,
    label: t("Common:PageOfTotalPage", { page: 1, totalPage: 1 }),
  };

  const emptyCountSelection = {
    key: 0,
    label: t("Common:CountPerPage", { count: 25 }),
  };

  const selectedPageItem =
    pageItems.find((x) => x.key === filter.page) || emptyPageSelection;
  const selectedCountItem =
    countItems.find((x) => x.key === filter.pageCount) || emptyCountSelection;

  // console.log("SectionPagingContent render", filter);

  return isLoaded ? (
    !filter || filter.total < filter.pageCount ? null : (
      <Paging
        previousLabel={t("Common:Previous")}
        nextLabel={t("Common:Next")}
        pageItems={pageItems}
        onSelectPage={onChangePage}
        countItems={countItems}
        onSelectCount={onChangePageSize}
        displayItems={false}
        disablePrevious={!filter.hasPrev()}
        disableNext={!filter.hasNext()}
        disableHover={isMobile}
        previousAction={onPrevClick}
        nextAction={onNextClick}
        openDirection="top"
        selectedPageItem={selectedPageItem} // FILTER CURRENT PAGE
        selectedCountItem={selectedCountItem} // FILTER PAGE COUNT
      />
    )
  ) : (
    <FilterLoader />
  );
};

export default inject(({ authStore, setup }) => ({
  isLoaded: authStore.isLoaded,
  fetchPeople: setup.updateListAdmins,
  filter: setup.security.accessRight.filter,
  setIsLoading: setup.setIsLoading,
}))(withTranslation(["Settings", "Common"])(observer(SectionPagingContent)));
