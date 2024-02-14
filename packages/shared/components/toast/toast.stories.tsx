import React from "react";

import { Meta, StoryObj } from "@storybook/react";

import { Toast } from "./Toast";
import { toastr } from "./sub-components/Toastr";
import { Button, ButtonSize } from "../button";
import { Link, LinkType } from "../link";
import { ToastProps } from "./Toast.type";
import { ToastType } from "./Toast.enums";

const meta = {
  title: "Components/Toast",
  component: Toast,
  argTypes: {
    // withCross: {
    //   description:
    //     "If `false`: toast disappeared after clicking on any area of toast. If `true`: toast disappeared after clicking on close button",
    // },
    // timeout: {
    //   description:
    //     "Time (in milliseconds) for showing your toast. Setting in `0` let you to show toast constantly until clicking on it",
    // },
    // data: {
    //   description: "Any components or data inside a toast",
    // },
  },

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=648%3A4421&mode=dev",
    },
  },
} satisfies Meta<typeof Toast>;
type Story = StoryObj<typeof Toast>;

export default meta;

const BaseTemplate = ({
  type,

  title,
  timeout = 5000,
  withCross = false,
  ...args
}: ToastProps & {
  withCross?: boolean;
  data?: React.ReactNode | string;
  timeout?: number;
}) => {
  return (
    <>
      <Toast {...args} />
      <Button
        label="Show toast"
        primary
        size={ButtonSize.small}
        onClick={() => {
          switch (type) {
            case ToastType.error:
              toastr.error("Demo text for Toast", title, timeout, withCross);
              break;
            case ToastType.warning:
              toastr.warning("Demo text for Toast", title, timeout, withCross);
              break;
            case ToastType.info:
              toastr.info("Demo text for Toast", title, timeout, withCross);
              break;
            default:
              toastr.success("Demo text for Toast", title, timeout, withCross);
              break;
          }
        }}
      />
    </>
  );
};

export const basic: Story = {
  render: (args) => <BaseTemplate {...args} />,
  args: {
    type: ToastType.success,

    title: "Demo title",
  },
};

const AllTemplate = () => {
  const renderAllToast = () => {
    toastr.success(
      "Demo text for success Toast closes in 30 seconds or on click",
      undefined,
      30000,
    );

    toastr.error(
      "Demo text for error Toast closes in 28 seconds or on click",
      undefined,
      28000,
    );

    toastr.warning(
      "Demo text for warning Toast closes in 25 seconds or on click",
      undefined,
      25000,
    );

    toastr.info(
      "Demo text for info Toast closes in 15 seconds or on click",
      undefined,
      15000,
    );

    toastr.success(
      "Demo text for success Toast with title closes in 12 seconds or on click",
      "Demo title",
      12000,
    );

    toastr.error(
      "Demo text for error Toast with title closes in 10 seconds or on click",
      "Demo title",
      10000,
    );

    toastr.warning(
      "Demo text for warning Toast with title closes in 8 seconds or on click",
      "Demo title",
      8000,
    );

    toastr.info(
      "Demo text for info Toast with title closes in 6 seconds or on click",
      "Demo title",
      6000,
    );
    toastr.success(
      "Demo text for success manual closed Toast",
      undefined,
      0,
      true,
      true,
    );
    toastr.error(
      "Demo text for error manual closed Toast",
      undefined,
      0,
      true,
      true,
    );
    toastr.warning(
      "Demo text for warning manual closed Toast",
      undefined,
      0,
      true,
      true,
    );
    toastr.info(
      "Demo text for info manual closed Toast",
      undefined,
      0,
      true,
      true,
    );
    toastr.success(
      <>
        Demo text for success manual closed Toast with title and contains{" "}
        <Link type={LinkType.page} color="gray" href="https://github.com">
          gray link
        </Link>
      </>,
      "Demo title",
      0,
      true,
      true,
    );
    toastr.error(
      "Demo text for error manual closed Toast with title",
      "Demo title",
      0,
      true,
      true,
    );
    toastr.warning(
      "Demo text for warning manual closed Toast with title",
      "Demo title",
      0,
      true,
      true,
    );
    toastr.info(
      "Demo text for info manual closed Toast with title",
      "Demo title",
      0,
      true,
      true,
    );
  };
  return (
    <>
      <Toast />
      <Button
        label="Show all toast"
        primary
        size={ButtonSize.small}
        onClick={() => renderAllToast()}
      />
    </>
  );
};

export const All = {
  render: () => <AllTemplate />,
};
