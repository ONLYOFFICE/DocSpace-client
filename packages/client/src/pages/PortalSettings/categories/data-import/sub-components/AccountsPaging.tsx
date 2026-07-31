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

import { useState } from "react";

import type { TOption } from "@docspace/ui-kit/components/combobox";
import { Paging } from "@docspace/ui-kit/components/paging";

import { AccountsPagingProps } from "../types";
import styles from "../StyledDataImport.module.scss";

const AccountsPaging = (props: AccountsPagingProps) => {
  const { t, numberOfItems, setDataPortion, pagesPerPage = 25 } = props;

  const createPageItems = (count: number) => {
    const pageItems: { key: string; label: string; pageNumber: number }[] = [];
    for (let i = 0; i < count; i += 1) {
      pageItems.push({
        key: `${i + 1}-page-of-${count}`,
        label: t("Common:PageOfTotalPage", { page: i + 1, totalPage: count }),
        pageNumber: i,
      });
    }
    return pageItems;
  };

  const countItems: TOption[] = [
    {
      key: "25-items-per-page",
      label: t("Common:CountPerPage", { count: pagesPerPage }),
      count: pagesPerPage,
    },
    {
      key: "50-items-per-page",
      label: t("Common:CountPerPage", { count: pagesPerPage * 2 }),
      count: pagesPerPage * 2,
    },
    {
      key: "100-items-per-page",
      label: t("Common:CountPerPage", { count: pagesPerPage * 3 }),
      count: pagesPerPage * 3,
    },
  ];

  const [selectedCountItem, setSelectedCountItem] = useState(countItems[0]);

  const [pageItems, setPageItems] = useState(
    createPageItems(Math.ceil(numberOfItems / selectedCountItem.count!)),
  );
  const [selectedPageItem, setSelectedPageItems] = useState(pageItems[0]);

  const onSelectPageNextHandler = () => {
    const currentPage = pageItems[selectedPageItem.pageNumber + 1];
    if (currentPage) {
      setDataPortion(
        currentPage.pageNumber * selectedCountItem.count!,
        (currentPage.pageNumber + 1) * selectedCountItem.count!,
      );
      setSelectedPageItems(currentPage);
    }
  };

  const onSelectPagePrevHandler = () => {
    const currentPage = pageItems[selectedPageItem.pageNumber - 1];
    if (currentPage) {
      setDataPortion(
        currentPage.pageNumber * selectedCountItem.count!,
        (currentPage.pageNumber + 1) * selectedCountItem.count!,
      );
      setSelectedPageItems(currentPage);
    }
  };

  const onSelectPage = (selectedPage: TOption) => {
    const count = selectedPage.pageNumber! * selectedCountItem.count!;
    setDataPortion(count, count + selectedCountItem.count!);
    setSelectedPageItems(pageItems[selectedPage.pageNumber!]);
  };

  const onCountChange = (countItem: TOption) => {
    setSelectedCountItem(countItem);
    setDataPortion(0, countItem.count!);
    const tempPageItems = createPageItems(
      Math.ceil(numberOfItems / countItem.count!),
    );
    setPageItems(tempPageItems);
    setSelectedPageItems(tempPageItems[0]);
  };

  return (
    <Paging
      className={`${styles.styledPaging} accounts-paging`}
      pageItems={pageItems}
      countItems={countItems}
      previousLabel={t("Common:Previous")}
      nextLabel={t("Common:Next")}
      openDirection="top"
      onSelectPage={onSelectPage}
      onSelectCount={onCountChange}
      previousAction={onSelectPagePrevHandler}
      nextAction={onSelectPageNextHandler}
      selectedPageItem={selectedPageItem}
      selectedCountItem={selectedCountItem}
      disablePrevious={!pageItems[selectedPageItem.pageNumber - 1]}
      disableNext={!pageItems[selectedPageItem.pageNumber + 1]}
      dataTestId="accounts_paging"
    />
  );
};

export default AccountsPaging;
