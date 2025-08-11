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

import { Toast } from ".";
import { toastr } from "./sub-components/Toastr";
import { Button, ButtonSize } from "../button";
import { Link, LinkType } from "../link";
import { ToastProps } from "./Toast.type";
import { ToastType } from "./Toast.enums";

const meta: Meta<typeof Toast> = {
  title: "Feedback components/Toast",
  component: Toast,
  tags: ["autodocs"],
  argTypes: {
    withCross: {
      control: "boolean",
      description:
        "If `false`: toast disappears after clicking anywhere. If `true`: toast disappears only after clicking the close button",
    },
    timeout: {
      control: "number",
      description:
        "Duration (in milliseconds) to show the toast. Set to `0` for persistent toast",
    },
    data: {
      control: "text",
      description: "Content to display inside the toast",
    },
    type: {
      control: "select",
      options: [
        ToastType.success,
        ToastType.error,
        ToastType.warning,
        ToastType.info,
      ],
      description: "Type of toast notification",
    },
    title: {
      control: "text",
      description: "Title of the toast notification",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=648%3A4421&mode=dev",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

interface ToastTemplateProps extends ToastProps {
  withCross?: boolean;
  data?: React.ReactNode | string | React.ReactElement;
  timeout?: number;
}

const ToastTemplate = ({
  type = ToastType.success,
  data = "Toast message",
  title,
  timeout = 5000,
  withCross = false,
  ...args
}: ToastTemplateProps) => {
  const showToast = () => {
    let message = "";
    if (typeof data === "string") {
      message = data;
    } else if (React.isValidElement(data)) {
      const reactData = data as React.ReactElement<{
        children?: string;
      }>;
      if (
        "children" in reactData.props &&
        typeof reactData.props.children === "string"
      ) {
        message = reactData.props.children;
      }
    } else if (Array.isArray(data)) {
      message = data
        .map((child) => {
          if (typeof child === "string") {
            return child;
          }
          if (React.isValidElement(child)) {
            const reactChild = child as React.ReactElement<{
              children?: string;
            }>;
            if (
              "children" in reactChild.props &&
              typeof reactChild.props.children === "string"
            ) {
              return reactChild.props.children;
            }
          }
          return "";
        })
        .join(" ");
    }
    switch (type) {
      case ToastType.error:
        toastr.error(message, title, timeout, withCross);
        break;
      case ToastType.warning:
        toastr.warning(message, title, timeout, withCross);
        break;
      case ToastType.info:
        toastr.info(message, title, timeout, withCross);
        break;
      default:
        toastr.success(message, title, timeout, withCross);
    }
  };

  return (
    <>
      <Toast {...args} />
      <Button
        label="Show Toast"
        primary
        size={ButtonSize.small}
        onClick={showToast}
      />
    </>
  );
};

export const Success: Story = {
  render: (args) => <ToastTemplate {...args} />,
  args: {
    data: "Operation completed successfully",
    title: "Success",
    timeout: 5000,
    type: ToastType.success,
  },
};

export const Error: Story = {
  render: (args) => <ToastTemplate {...args} />,
  args: {
    data: "An error occurred while processing your request",
    title: "Error",
    timeout: 5000,
    type: ToastType.error,
  },
};

export const Warning: Story = {
  render: (args) => <ToastTemplate {...args} />,
  args: {
    data: "Please review the changes before proceeding",
    title: "Warning",
    timeout: 5000,
    type: ToastType.warning,
  },
};

export const Info: Story = {
  render: (args) => <ToastTemplate {...args} />,
  args: {
    data: "New updates are available",
    title: "Information",
    timeout: 5000,
    type: ToastType.info,
  },
};

export const WithCloseButton: Story = {
  render: (args) => <ToastTemplate {...args} />,
  args: {
    data: "Click the close button to dismiss",
    title: "Dismissible Toast",
    withCross: true,
    timeout: 0,
  },
};

export const WithCustomContent: Story = {
  render: (args) => <ToastTemplate {...args} />,
  args: {
    data: (
      <>
        This toast contains a{" "}
        <Link type={LinkType.page} color="gray" href="https://github.com">
          clickable link
        </Link>
      </>
    ),
    title: "Custom Content",
    timeout: 5000,
  },
};

export const AllTypes: Story = {
  render: () => {
    const showAllToasts = () => {
      toastr.success("Success message", "Success", 0, true);
      toastr.error("Error message", "Error", 0, true);
      toastr.warning("Warning message", "Warning", 0, true);
      toastr.info("Info message", "Info", 0, true);
    };

    return (
      <>
        <Toast />
        <Button
          label="Show All Toast Types"
          primary
          size={ButtonSize.small}
          onClick={showAllToasts}
        />
      </>
    );
  },
};
