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
import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "../link";
import { Text } from "../text";
import { Tooltip } from ".";

// import TooltipDocs from "./Tooltip.mdx";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      // page: TooltipDocs,
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=649%3A4458&mode=dev",
    },
  },
} satisfies Meta<typeof Tooltip>;
type Story = StoryObj<typeof Tooltip>;

export default meta;

const bodyStyle = { marginTop: 100, marginInlineStart: 200 };

export const Default: Story = {
  render: (args) => {
    return (
      <div style={{ height: "240px" }}>
        <div style={{ ...bodyStyle, position: "absolute" }}>
          <Link data-tooltip-id="link" data-tooltip-content="Bob Johnston">
            Bob Johnston
          </Link>
        </div>

        <Tooltip
          {...args}
          id="link"
          getContent={({ content }) => (
            <div>
              <Text isBold fontSize="16px">
                {content}
              </Text>

              <Text color={globalColors.gray} fontSize="13px">
                BobJohnston@gmail.com
              </Text>

              <Text fontSize="13px">Developer</Text>
            </div>
          )}
        />
      </div>
    );
  },
  args: { float: true, place: "top" },
};

const arrayUsers = [
  {
    key: "user_1",
    name: "Bob",
    email: "Bob@gmail.com",
    position: "developer",
  },
  {
    key: "user_2",
    name: "John",
    email: "John@gmail.com",
    position: "developer",
  },
  {
    key: "user_3",
    name: "Kevin",
    email: "Kevin@gmail.com",
    position: "developer",
  },
  {
    key: "user_4",
    name: "Alex",
    email: "Alex@gmail.com",
    position: "developer",
  },
  {
    key: "user_5",
    name: "Tomas",
    email: "Tomas@gmail.com",
    position: "developer",
  },
];

export const AllTooltip: Story = {
  render: () => {
    return (
      <div>
        <div>
          <h5 style={{ marginInlineStart: -5 }}>Hover on me</h5>
          <Link data-tooltip-id="link" data-tooltip-content="Bob Johnston">
            Bob Johnston
          </Link>
        </div>
        <Tooltip id="link" offset={0}>
          <div>
            <Text isBold fontSize="16px">
              Bob Johnston
            </Text>

            <Text color={globalColors.gray} fontSize="13px">
              BobJohnston@gmail.com
            </Text>

            <Text fontSize="13px">Developer</Text>
          </div>
        </Tooltip>

        <div>
          <h5 style={{ marginInlineStart: -5 }}>Hover group</h5>
          <Link data-tooltip-id="group" data-tooltip-content={0}>
            Bob
          </Link>
          <br />
          <Link data-tooltip-id="group" data-tooltip-content={1}>
            John
          </Link>
          <br />
          <Link data-tooltip-id="group" data-tooltip-content={2}>
            Kevin
          </Link>
          <br />
          <Link data-tooltip-id="group" data-tooltip-content={3}>
            Alex
          </Link>
          <br />
          <Link data-tooltip-id="group" data-tooltip-content={4}>
            Tomas
          </Link>
        </div>

        <Tooltip
          id="group"
          getContent={({ content }) => {
            return content && typeof content === "string" ? (
              <div>
                <Text isBold fontSize="16px">
                  {arrayUsers[+content].name}
                </Text>

                <Text color={globalColors.gray} fontSize="13px">
                  {arrayUsers[+content].email}
                </Text>

                <Text fontSize="13px">{arrayUsers[+content].position}</Text>
              </div>
            ) : null;
          }}
        />
      </div>
    );
  },
};
