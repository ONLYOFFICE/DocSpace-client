import React from "react";
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import CatalogGuestReactSvgUrl from "PUBLIC_DIR/images/catalog.guest.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/catalog.trash.react.svg?url";

import { Base } from "../../themes";

import { ArticleItemPure } from "./ArticleItem";
import { ArticleItemProps } from "./ArticleItem.types";

const meta = {
  title: "Components/ArticleItem",
  component: ArticleItemPure,
  parameters: {
    docs: {
      description: {
        component:
          "Display catalog item. Can show only icon. If is it end of block - adding margin bottom.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=474-2027&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof ArticleItemPure>;
type Story = StoryObj<typeof ArticleItemPure>;

export default meta;

const CatalogWrapper = styled.div`
  background-color: ${(props) => props.theme.catalogItem.container.background};
  padding: 15px;
`;

CatalogWrapper.defaultProps = { theme: Base };

const Template = (args: ArticleItemProps) => {
  return (
    <CatalogWrapper style={{ width: "250px" }}>
      <ArticleItemPure {...args} onClick={() => {}} onClickBadge={() => {}} />
    </CatalogWrapper>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    icon: CatalogFolderReactSvgUrl,
    text: "Documents",
    showText: true,
    showBadge: true,
    isEndOfBlock: false,
    labelBadge: "2",
  },
};

const OnlyIcon = () => {
  return (
    <CatalogWrapper style={{ width: "52px" }}>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="My documents"
        showText={false}
        showBadge={false}
      />
    </CatalogWrapper>
  );
};

export const IconWithoutBadge: Story = { render: () => <OnlyIcon /> };

const OnlyIconWithBadge = () => {
  return (
    <CatalogWrapper style={{ width: "52px" }}>
      <ArticleItemPure
        icon={CatalogGuestReactSvgUrl}
        text="My documents"
        showText={false}
        showBadge
      />
    </CatalogWrapper>
  );
};

export const IconWithBadge: Story = { render: () => <OnlyIconWithBadge /> };

const InitialIcon = () => {
  return (
    <CatalogWrapper style={{ width: "52px" }}>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="Documents"
        showText={false}
        showBadge={false}
        showInitial
        onClick={() => {}}
      />
    </CatalogWrapper>
  );
};

export const IconWithInitialText: Story = { render: () => <InitialIcon /> };

const WithBadgeIcon = () => {
  return (
    <CatalogWrapper style={{ width: "250px" }}>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="My documents"
        showText
        showBadge
        iconBadge={CatalogTrashReactSvgUrl}
      />
    </CatalogWrapper>
  );
};

export const ItemWithBadgeIcon: Story = { render: () => <WithBadgeIcon /> };

const TwoItem = () => {
  return (
    <CatalogWrapper style={{ width: "250px" }}>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="My documents"
        showText
        showBadge
        onClick={() => {}}
        isEndOfBlock
        labelBadge={3}
        onClickBadge={() => {}}
      />
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="Some text"
        showText
        showBadge
        onClick={() => {}}
        iconBadge={CatalogTrashReactSvgUrl}
        onClickBadge={() => {}}
      />
    </CatalogWrapper>
  );
};

export const ItemIsEndOfBlock: Story = { render: () => <TwoItem /> };
