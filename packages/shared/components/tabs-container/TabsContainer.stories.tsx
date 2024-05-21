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

import React from "react";
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import { TabsContainer } from "./TabsContainer";
import { TElement, TabsContainerProps } from "./TabsContainer.types";

const meta = {
  title: "Components/TabsContainer",
  component: TabsContainer,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=638-4439&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof TabsContainer>;
type Story = StoryObj<typeof TabsContainer>;

export default meta;

const arrayItems = [
  {
    key: "tab0",
    title: "Title1",
    content: (
      <div>
        <div>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
        </div>
        <div>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
        </div>
        <div>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
        </div>
      </div>
    ),
  },
  {
    key: "tab1",
    title: "Title2",
    content: (
      <div>
        <div>
          <label>LABEL</label> <label>LABEL</label> <label>LABEL</label>
        </div>
        <div>
          <label>LABEL</label> <label>LABEL</label> <label>LABEL</label>
        </div>
        <div>
          <label>LABEL</label> <label>LABEL</label> <label>LABEL</label>
        </div>
      </div>
    ),
  },
  {
    key: "tab2",
    title: "Title3",
    content: (
      <div>
        <div>
          <input /> <input /> <input />
        </div>
        <div>
          <input /> <input /> <input />
        </div>
        <div>
          <input /> <input /> <input />
        </div>
      </div>
    ),
  },
  {
    key: "tab3",
    title: "Title4",
    content: (
      <div>
        <div>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
        </div>
        <div>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
        </div>
        <div>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
          <button type="button">BUTTON</button>
        </div>
      </div>
    ),
  },
  {
    key: "tab4",
    title: "Title5",
    content: (
      <div>
        <div>
          <label>LABEL</label> <label>LABEL</label> <label>LABEL</label>
        </div>
        <div>
          <label>LABEL</label> <label>LABEL</label> <label>LABEL</label>
        </div>
        <div>
          <label>LABEL</label> <label>LABEL</label> <label>LABEL</label>
        </div>
      </div>
    ),
  },
];

const scrollArrayItems = [
  {
    key: "tab0",
    title: "First long tab container",
    content: (
      <>
        <label>Tab_0 Tab_0 Tab_0</label>
        <br />
        <label>Tab_0 Tab_0 Tab_0</label>
        <br />
        <label>Tab_0 Tab_0 Tab_0</label>
      </>
    ),
  },
  {
    key: "tab1",
    title: "Short",
    content: (
      <>
        <label>Tab_1 Tab_1 Tab_1</label>
        <br />
        <label>Tab_1 Tab_1 Tab_1</label>
        <br />
        <label>Tab_1 Tab_1 Tab_1</label>
      </>
    ),
  },
  {
    key: "tab2",
    title: "Second long tab container",
    content: (
      <>
        <label>Tab_2 Tab_2 Tab_2</label>
        <br />
        <label>Tab_2 Tab_2 Tab_2</label>
        <br />
        <label>Tab_2 Tab_2 Tab_2</label>
      </>
    ),
  },
  {
    key: "tab3",
    title: "Short2",
    content: (
      <>
        <label>Tab_3 Tab_3 Tab_3</label>
        <br />
        <label>Tab_3 Tab_3 Tab_3</label>
        <br />
        <label>Tab_3 Tab_3 Tab_3</label>
      </>
    ),
  },
  {
    key: "tab4",
    title: "Third long tab container header",
    content: (
      <>
        <label>Tab_4 Tab_4 Tab_4</label>
        <br />
        <label>Tab_4 Tab_4 Tab_4</label>
        <br />
        <label>Tab_4 Tab_4 Tab_4</label>
      </>
    ),
  },
  {
    key: "tab5",
    title: "Short3",
    content: (
      <>
        <label>Tab_5 Tab_5 Tab_5</label>
        <br />
        <label>Tab_5 Tab_5 Tab_5</label>
        <br />
        <label>Tab_5 Tab_5 Tab_5</label>
      </>
    ),
  },
  {
    key: "tab6",
    title: "tab container",
    content: (
      <>
        <label>Tab_6 Tab_6 Tab_6</label>
        <br />
        <label>Tab_6 Tab_6 Tab_6</label>
        <br />
        <label>Tab_6 Tab_6 Tab_6</label>
      </>
    ),
  },
  {
    key: "tab7",
    title: "Very long tabs-container field",
    content: (
      <>
        <label>Tab_7 Tab_7 Tab_7</label>
        <br />
        <label>Tab_7 Tab_7 Tab_7</label>
        <br />
        <label>Tab_7 Tab_7 Tab_7</label>
      </>
    ),
  },
  {
    key: "tab8",
    title: "tab container",
    content: (
      <>
        <label>Tab_8 Tab_8 Tab_8</label>
        <br />
        <label>Tab_8 Tab_8 Tab_8</label>
        <br />
        <label>Tab_8 Tab_8 Tab_8</label>
      </>
    ),
  },
  {
    key: "tab9",
    title: "Short_04",
    content: (
      <>
        <label>Tab_9 Tab_9 Tab_9</label>
        <br />
        <label>Tab_9 Tab_9 Tab_9</label>
        <br />
        <label>Tab_9 Tab_9 Tab_9</label>
      </>
    ),
  },
  {
    key: "tab10",
    title: "Short__05",
    content: (
      <>
        <label>Tab_10 Tab_10 Tab_10</label>
        <br />
        <label>Tab_10 Tab_10 Tab_10</label>
        <br />
        <label>Tab_10 Tab_10 Tab_10</label>
      </>
    ),
  },
  {
    key: "tab11",
    title: "TabsContainer",
    content: (
      <>
        <label>Tab_11 Tab_11 Tab_11</label>
        <br />
        <label>Tab_11 Tab_11 Tab_11</label>
        <br />
        <label>Tab_11 Tab_11 Tab_11</label>
      </>
    ),
  },
];

const tabsItems = [
  {
    key: "tab0",
    title: "Title00000000",
    content: (
      <>
        <label>Tab_0 Tab_0 Tab_0</label>
        <br />
        <label>Tab_0 Tab_0 Tab_0</label>
        <br />
        <label>Tab_0 Tab_0 Tab_0</label>
      </>
    ),
  },
  {
    key: "tab1",
    title: "Title00000001",
    content: (
      <>
        <label>Tab_1 Tab_1 Tab_1</label>
        <br />
        <label>Tab_1 Tab_1 Tab_1</label>
        <br />
        <label>Tab_1 Tab_1 Tab_1</label>
      </>
    ),
  },
  {
    key: "tab2",
    title: "Title00000002",
    content: (
      <>
        <label>Tab_2 Tab_2 Tab_2</label>
        <br />
        <label>Tab_2 Tab_2 Tab_2</label>
        <br />
        <label>Tab_2 Tab_2 Tab_2</label>
      </>
    ),
  },
  {
    key: "tab3",
    title: "Title00000003",
    content: (
      <>
        <label>Tab_3 Tab_3 Tab_3</label>
        <br />
        <label>Tab_3 Tab_3 Tab_3</label>
        <br />
        <label>Tab_3 Tab_3 Tab_3</label>
      </>
    ),
  },
  {
    key: "tab4",
    title: "Title00000004",
    content: (
      <>
        <label>Tab_4 Tab_4 Tab_4</label>
        <br />
        <label>Tab_4 Tab_4 Tab_4</label>
        <br />
        <label>Tab_4 Tab_4 Tab_4</label>
      </>
    ),
  },
  {
    key: "tab5",
    title: "Title00000005",
    content: (
      <>
        <label>Tab_5 Tab_5 Tab_5</label>
        <br />
        <label>Tab_5 Tab_5 Tab_5</label>
        <br />
        <label>Tab_5 Tab_5 Tab_5</label>
      </>
    ),
  },
  {
    key: "tab6",
    title: "Title00000006",
    content: (
      <>
        <label>Tab_6 Tab_6 Tab_6</label>
        <br />
        <label>Tab_6 Tab_6 Tab_6</label>
        <br />
        <label>Tab_6 Tab_6 Tab_6</label>
      </>
    ),
  },
  {
    key: "tab7",
    title: "Title00000007",
    content: (
      <>
        <label>Tab_7 Tab_7 Tab_7</label>
        <br />
        <label>Tab_7 Tab_7 Tab_7</label>
        <br />
        <label>Tab_7 Tab_7 Tab_7</label>
      </>
    ),
  },
  {
    key: "tab8",
    title: "Title00000008",
    content: (
      <>
        <label>Tab_8 Tab_8 Tab_8</label>
        <br />
        <label>Tab_8 Tab_8 Tab_8</label>
        <br />
        <label>Tab_8 Tab_8 Tab_8</label>
      </>
    ),
  },
  {
    key: "tab9",
    title: "Title00000009",
    content: (
      <>
        <label>Tab_9 Tab_9 Tab_9</label>
        <br />
        <label>Tab_9 Tab_9 Tab_9</label>
        <br />
        <label>Tab_9 Tab_9 Tab_9</label>
      </>
    ),
  },
];

const StyledTitle = styled.h5.attrs({ dir: "auto" })`
  text-align: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `right` : `left`};
`;

const Template = ({ onSelect, ...args }: TabsContainerProps) => {
  return (
    <div>
      <StyledTitle style={{ marginBottom: 20 }}>
        Base TabsContainer:
      </StyledTitle>
      <TabsContainer
        {...args}
        onSelect={(index: TElement) => onSelect(index)}
        selectedItem={arrayItems.indexOf(arrayItems[0])}
        elements={arrayItems}
      />

      <div style={{ marginTop: 32, maxWidth: 430 }}>
        <StyledTitle style={{ marginTop: 100, marginBottom: 20 }}>
          Autoscrolling with different tab widths:
        </StyledTitle>
        <TabsContainer
          {...args}
          selectedItem={3}
          elements={scrollArrayItems}
          onSelect={(index: TElement) => onSelect(index)}
        />
      </div>

      <div style={{ marginTop: 32, maxWidth: 430 }}>
        <StyledTitle style={{ marginTop: 100, marginBottom: 20 }}>
          Autoscrolling with the same tabs width:
        </StyledTitle>
        <TabsContainer
          {...args}
          selectedItem={5}
          elements={tabsItems}
          onSelect={(index: TElement) => onSelect(index)}
        />
      </div>
    </div>
  );
};

export const basic: Story = {
  render: (args) => <Template {...args} />,
  args: {
    elements: tabsItems,
    isDisabled: false,
    selectedItem: 0,
    onSelect: () => {},
  },
};
