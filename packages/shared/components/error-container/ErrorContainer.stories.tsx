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
    bodyText: "Try again later",
    buttonText: "Go back",
    headerText: "Some error has happened",
    customizedBodyText: "Customized body",
  },
};
