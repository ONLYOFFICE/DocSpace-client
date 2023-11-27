import React from "react";
import styled from "styled-components";
import SelectedItem from "./";

export default {
  title: "Components/SelectedItem",
  component: SelectedItem,
  argTypes: {
    onClose: { action: "onClose" },
  },
};
const Template = ({
  onClose,
  ...args
}: any) => {
  return <SelectedItem {...args} onClose={(e) => onClose(e)} />;
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ onClose... Remove this comment to see the full error message
Default.args = {
  label: "Selected item",
  isInline: true,
  isDisabled: false,
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

const AllTemplate = ({
  onClose,
  ...args
}: any) => {
  const onCloseHandler = (e: any) => {
    onClose(e);
  };
  return (
    <>
      <StyledContainerInline>
        <SelectedItem
          label="Selected item"
          isInline={true}
          onClose={onCloseHandler}
        />
        <SelectedItem
          label="Selected item"
          isInline={true}
          isDisabled
          onClose={onCloseHandler}
        />
      </StyledContainerInline>

      <StyledContainer>
        <SelectedItem
          label="Selected item"
          isInline={false}
          onClose={onCloseHandler}
        />
      </StyledContainer>
    </>
  );
};

export const All = AllTemplate.bind({});
