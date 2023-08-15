import React, { useState } from "react";

import Paging from "@docspace/components/paging";

const createPageItems = (count) => {
  let pageItems = [];
  for (let i = 0; i < count; i++) {
    pageItems.push({
      key: i + 1 + "-page-of-" + count,
      label: i + 1 + " of " + count,
      pageNumber: i,
    });
  }
  return pageItems;
};

const countItems = [
  {
    key: "25-items-per-page",
    label: "25 per page",
    count: 25,
  },
  {
    key: "50-items-per-page",
    label: "50 per page",
    count: 50,
  },
  {
    key: "100-items-per-page",
    label: "100 per page",
    count: 100,
  },
];

const AccountsPaging = (props) => {
  const { numberOfItems, setDataPortion } = props;

  const [selectedCountItem, setSelectedCountItem] = useState(countItems[0]);

  const [pageItems, setPageItems] = useState(
    createPageItems(Math.ceil(numberOfItems / selectedCountItem.count)),
  );
  const [selectedPageItem, setSelectedPageItems] = useState(pageItems[0]);

  const onSelectPageNextHandler = () => {
    const currentPage = pageItems[selectedPageItem.pageNumber + 1];
    if (currentPage) {
      console.log(
        currentPage.pageNumber * selectedCountItem.count,
        (currentPage.pageNumber + 1) * selectedCountItem.count,
      );
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
    const tempPageItems = createPageItems(Math.ceil(numberOfItems / countItem.count));
    setPageItems(tempPageItems);
    setSelectedPageItems(tempPageItems[0]);
  };

  return (
    <Paging
      className="accounts-pagging"
      pageItems={pageItems}
      countItems={countItems}
      previousLabel="Previous"
      nextLabel="Next"
      openDirection="top"
      style={{ justifyContent: "center", alignItems: "center" }}
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
