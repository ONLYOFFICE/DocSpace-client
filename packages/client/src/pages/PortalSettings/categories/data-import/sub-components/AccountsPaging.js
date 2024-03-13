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
    createPageItems(Math.ceil(numberOfItems / selectedCountItem.count))
  );
  const [selectedPageItem, setSelectedPageItems] = useState(pageItems[0]);

  const onSelectPageNextHandler = () => {
    const currentPage = pageItems[selectedPageItem.pageNumber + 1];
    if (currentPage) {
      setDataPortion(
        currentPage.pageNumber * selectedCountItem.count,
        (currentPage.pageNumber + 1) * selectedCountItem.count
      );
      setSelectedPageItems(currentPage);
    }
  };

  const onSelectPagePrevHandler = () => {
    const currentPage = pageItems[selectedPageItem.pageNumber - 1];
    if (currentPage) {
      setDataPortion(
        currentPage.pageNumber * selectedCountItem.count,
        (currentPage.pageNumber + 1) * selectedCountItem.count
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
      Math.ceil(numberOfItems / countItem.count)
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
