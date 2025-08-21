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

import { Link, LinkTarget, LinkType } from ".";

const meta = {
  title: "Base UI Components/Link",
  component: Link,
  parameters: {
    docs: {
      description: {
        component: `It is a link with 2 types:

1. page - simple link which refer to other pages and parts of current page;
2. action - link, which usually hasn't hyperlink and do anything on click - open dropdown, filter data, etc`,
      },
    },
  },
  argTypes: {
    color: { control: "color" },
    onClick: { action: "clickActionLink" },
  },
} satisfies Meta<typeof Link>;

type Story = StoryObj<typeof Link>;

export default meta;

export const Default: Story = {
  render: ({ label, onClick, href, ...args }) => {
    const actionProps = href && href.length > 0 ? { href } : { onClick };
    return (
      <Link {...args} {...actionProps}>
        {label}
      </Link>
    );
  },
  args: {
    href: "http://github.com",
    label: "Simple label",
    type: LinkType.page,
    fontSize: "13px",
    fontWeight: "400",
    isBold: false,
    target: LinkTarget.blank,
    isHovered: false,
    noHover: false,
    isSemitransparent: false,
    isTextOverflow: false,
  },
};

export const AllTemplate: Story = {
  render: () => {
    const rowStyle = { marginTop: 8, fontSize: 12 };

    const headerStyle = {
      padding: "8px 0 0 40px",
      fontSize: 16,
    };
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={headerStyle}>
          <div>Page links:</div>
          <div>
            <div style={rowStyle}>
              <Link type={LinkType.page} href="https://github.com" isBold>
                Bold black page link
              </Link>
            </div>
            <div style={rowStyle}>
              <Link type={LinkType.page} href="https://github.com">
                Black page link
              </Link>
            </div>
            <div style={rowStyle}>
              <Link type={LinkType.page} href="https://github.com" isHovered>
                Black hovered page link
              </Link>
            </div>
            <div style={rowStyle}>
              <Link
                type={LinkType.page}
                href="https://github.com"
                isSemitransparent
              >
                Semitransparent black page link
              </Link>
            </div>
          </div>
        </div>
        <div style={headerStyle}>
          <div>Action links:</div>
          <div style={rowStyle}>
            <Link type={LinkType.action} isBold>
              Bold black action link
            </Link>
          </div>
          <div style={rowStyle}>
            <Link type={LinkType.action}>Black action link</Link>
          </div>
          <div style={rowStyle}>
            <Link type={LinkType.action} isHovered>
              Black hovered action link
            </Link>
          </div>
          <div style={rowStyle}>
            <Link type={LinkType.action} isSemitransparent>
              Semitransparent black action link
            </Link>
          </div>
        </div>
      </div>
    );
  },
};

export const Hovered: Story = {
  render: () => (
    <Link type={LinkType.page} href="https://github.com" isHovered>
      Hovered link
    </Link>
  ),
};

export const Semitransparent: Story = {
  render: () => (
    <Link type={LinkType.page} href="https://github.com" isSemitransparent>
      Semitransparent link
    </Link>
  ),
};

export const TextOverflow: Story = {
  render: () => (
    <Link type={LinkType.page} href="https://github.com" isTextOverflow>
      This is a very long link that should demonstrate text overflow
    </Link>
  ),
};

export const NoHover: Story = {
  render: () => (
    <Link type={LinkType.page} href="https://github.com" noHover>
      No hover effect link
    </Link>
  ),
};

export const EnableUserSelect: Story = {
  render: () => (
    <Link type={LinkType.page} href="https://github.com" enableUserSelect>
      User-select enabled link
    </Link>
  ),
};

export const ActionLink: Story = {
  render: () => (
    <Link type={LinkType.action} onClick={() => {}}>
      Action link
    </Link>
  ),
};
