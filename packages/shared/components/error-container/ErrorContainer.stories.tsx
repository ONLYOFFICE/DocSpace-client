import { FC } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ErrorContainerProps } from "./ErrorContainer.types";
import ErrorContainer from "./ErrorContainer";

type ErrorContainerType = FC<ErrorContainerProps>;

const meta: Meta<ErrorContainerType> = {
  title: "Components/ErrorContainer",
  component: ErrorContainer,
};

export default meta;

export const Default: StoryObj<ErrorContainerType> = {
  args: {
    bodyText: "Body",
    buttonText: "Button",
    headerText: "Header",
    customizedBodyText: "Customized body",
  },
};
