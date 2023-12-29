import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Link, LinkTarget, LinkType } from ".";

const meta = {
  title: "Components/Link",
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
