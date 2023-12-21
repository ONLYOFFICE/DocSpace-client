import React from "react";
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import { SelectedItem } from "./SelectedItem";

const meta = {
  title: "Components/SelectedItem",
  component: SelectedItem,
  argTypes: {
    onClose: { action: "onClose" },
  },
} satisfies Meta<typeof SelectedItem>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  args: {
    label: "Selected item",
    isInline: true,
    isDisabled: false,
    onClose: () => {},
    propKey: "",
  },
};

const StyledContainer = styled.div`
  padding: 0;
  display: grid;
  grid-gap: 10px;
`;

const StyledContainerInline = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;

  > * {
    margin-right: 10px;
    margin-bottom: 10px;
  }
`;

const AllTemplate = () => {
  const onCloseHandler = () => {};
  return (
    <>
      <StyledContainerInline>
        <SelectedItem
          label="Selected item"
          propKey=""
          isInline
          onClose={onCloseHandler}
        />
        <SelectedItem
          label="Selected item"
          propKey=""
          isInline
          isDisabled
          onClose={onCloseHandler}
        />
      </StyledContainerInline>

      <StyledContainer>
        <SelectedItem
          label="Selected item"
          propKey=""
          isInline={false}
          onClose={onCloseHandler}
        />
      </StyledContainer>
    </>
  );
};

export const All: Story = {
  render: () => <AllTemplate />,
  args: {
    label: "Selected item",
    isInline: true,
    isDisabled: false,
    onClose: () => {},
    propKey: "",
  },
};
