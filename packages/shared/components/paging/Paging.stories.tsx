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

import React, { useState, useEffect } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { Paging } from "./Paging";
import { PagingProps } from "./Paging.types";

const meta = {
  title: "Components/Paging",
  component: Paging,
  parameters: {
    docs: {
      description: {
        component: "Paging is used to navigate med content pages",
      },
    },
  },
  argTypes: {
    onSelectPage: { action: "onSelectPage" },
    onSelectCount: { action: "onSelectCount" },
    previousAction: { action: "onPrevious" },
  },
} satisfies Meta<typeof Paging>;
type Story = StoryObj<typeof Paging>;

export default meta;

const createPageItems = (count: number) => {
  const pageItems = [];
  for (let i = 1; i <= count; i += 1) {
    pageItems.push({
      key: i,
      label: `${i} of ${count}`,
    });
  }
  return pageItems;
};

const countItems = [
  {
    key: 25,
    label: "25 per page",
  },
  {
    key: 50,
    label: "50 per page",
  },
  {
    key: 100,
    label: "100 per page",
  },
];

const selectedCountPageHandler = (count: number) => {
  return countItems.filter((item) => {
    if (item.key === count) {
      return true;
    }
    return false;
  });
};
const pageItems = createPageItems(200);

const Template = ({
  nextAction,
  previousAction,
  onSelectPage,
  onSelectCount,
  ...args
}: PagingProps) => {
  const [selectedPageItem, setSelectedPageItems] = useState(pageItems[0]);

  useEffect(() => {
    setSelectedPageItems(pageItems[0]);
  }, [pageItems]);

  const onSelectPageNextHandler = () => {
    const currentPage = pageItems.filter(
      (item) => item.key === selectedPageItem.key + 1,
    );
    if (currentPage[0]) setSelectedPageItems(currentPage[0]);
  };

  const onSelectPagePrevHandler = () => {
    const currentPage = pageItems.filter(
      (item) => item.key === selectedPageItem.key - 1,
    );
    if (currentPage[0]) setSelectedPageItems(currentPage[0]);
  };

  return (
    <div style={{ height: "100%" }}>
      <Paging
        {...args}
        pageItems={pageItems}
        style={{ justifyContent: "center", alignItems: "center" }}
        countItems={countItems}
        previousAction={async () => {
          previousAction();
          onSelectPagePrevHandler();
        }}
        nextAction={async () => {
          onSelectPageNextHandler();
          nextAction();
        }}
        onSelectPage={(a) => onSelectPage?.(a)}
        onSelectCount={(a) => onSelectCount?.(a)}
        selectedPageItem={selectedPageItem}
        selectedCountItem={selectedCountPageHandler(25)[0]}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    previousLabel: "Previous",
    nextLabel: "Next",

    disablePrevious: false,
    disableNext: false,
    openDirection: "bottom",

    selectedCountItem: {
      key: 100,
      label: "100 per page",
    },
    selectedPageItem: { key: 1, label: "1 of 10" },
  },
};
