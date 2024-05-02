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

import { useState } from "react";
import styled from "styled-components";
import { Paging } from "@docspace/shared/components/paging";

const StyledPaging = styled(Paging)`
  display: flex;
  margin-bottom: 30px;
  align-items: center;
  justify-content: center;
`;

const AccountsPaging = (props) => {
  const { t, numberOfItems, setDataPortion } = props;

  const createPageItems = (count) => {
    let pageItems = [];
    for (let i = 0; i < count; i++) {
      pageItems.push({
        key: i + 1 + "-page-of-" + count,
        label: t("Common:PageOfTotalPage", { page: i + 1, totalPage: count }),
        pageNumber: i,
      });
    }
    return pageItems;
  };

  const countItems = [
    {
      key: "25-items-per-page",
      label: t("Common:CountPerPage", { count: 25 }),
      count: 25,
    },
    {
      key: "50-items-per-page",
      label: t("Common:CountPerPage", { count: 50 }),
      count: 50,
    },
    {
      key: "100-items-per-page",
      label: t("Common:CountPerPage", { count: 100 }),
      count: 100,
    },
  ];

  const [selectedCountItem, setSelectedCountItem] = useState(countItems[0]);

  const [pageItems, setPageItems] = useState(
    createPageItems(Math.ceil(numberOfItems / selectedCountItem.count)),
  );
  const [selectedPageItem, setSelectedPageItems] = useState(pageItems[0]);

  const onSelectPageNextHandler = () => {
    const currentPage = pageItems[selectedPageItem.pageNumber + 1];
    if (currentPage) {
      setDataPortion(
        currentPage.pageNumber * selectedCountItem.count,
        (currentPage.pageNumber + 1) * selectedCountItem.count,
      );
      setSelectedPageItems(currentPage);
    }
  };

  const onSelectPagePrevHandler = () => {
    const currentPage = pageItems[selectedPageItem.pageNumber - 1];
    if (currentPage) {
      setDataPortion(
        currentPage.pageNumber * selectedCountItem.count,
        (currentPage.pageNumber + 1) * selectedCountItem.count,
      );
      setSelectedPageItems(currentPage);
    }
  };

  const onSelectPage = (selectedPage) => {
    const count = selectedPage.pageNumber * selectedCountItem.count;
    setDataPortion(count, count + selectedCountItem.count);
    setSelectedPageItems(pageItems[selectedPage.pageNumber]);
  };

  const onCountChange = (countItem) => {
    setSelectedCountItem(countItem);
    setDataPortion(0, countItem.count);
    const tempPageItems = createPageItems(
      Math.ceil(numberOfItems / countItem.count),
    );
    setPageItems(tempPageItems);
    setSelectedPageItems(tempPageItems[0]);
  };

  return (
    <StyledPaging
      className="accounts-paging"
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
      disablePrevious={!Boolean(pageItems[selectedPageItem.pageNumber - 1])}
      disableNext={!Boolean(pageItems[selectedPageItem.pageNumber + 1])}
    />
  );
};

export default AccountsPaging;
