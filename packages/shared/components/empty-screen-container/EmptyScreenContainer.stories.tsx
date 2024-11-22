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

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg";
import EmptyScreenFilterPng from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg?url";

import { IconSizeType, commonIconsStyles } from "../../utils";

import { Link, LinkType } from "../link";

import { EmptyScreenContainer } from "./EmptyScreenContainer";
import { EmptyScreenContainerProps } from "./EmptyScreenContainer.types";

const CrossReactSvgIcon = styled(CrossReactSvgUrl)`
  ${commonIconsStyles}
`;

const meta = {
  title: "Components/EmptyScreenContainer",
  component: EmptyScreenContainer,
  // argTypes: {
  //   onClick: { action: "Reset filter clicked", table: { disable: true } },
  // },
  parameters: {
    docs: {
      description: {
        component: "Used to display empty screen page",
      },
    },
  },
} satisfies Meta<typeof EmptyScreenContainer>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = (args: EmptyScreenContainerProps) => {
  return (
    <EmptyScreenContainer
      {...args}
      buttons={
        <>
          <CrossReactSvgIcon
            size={IconSizeType.small}
            style={{ marginInlineEnd: "4px" }}
          />
          <Link
            type={LinkType.action}
            isHovered
            // onClick={(e: React.MouseEvent) => args.onClick(e)}
          >
            Reset filter
          </Link>
        </>
      }
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    imageSrc: EmptyScreenFilterPng,
    imageAlt: "Empty Screen Filter image",
    headerText: "No results matching your search could be found",
    subheadingText: "No files to be displayed in this section",
    descriptionText:
      "No people matching your filter can be displayed in this section. Please select other filter options or clear filter to view all the people in this section.",
  },
};
