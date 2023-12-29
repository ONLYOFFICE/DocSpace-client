import React from "react";
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import CrossReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg";
import EmptyScreenFilterPng from "PUBLIC_DIR/images/empty_screen_filter.png";

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
