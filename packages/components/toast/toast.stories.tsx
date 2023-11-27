import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import Toast from "./";
import toastr from "./toastr";
import Button from "../button";
import Link from "../link";

export default {
  title: "Components/Toast",
  component: Toast,

  argTypes: {
    withCross: {
      description:
        "If `false`: toast disappeared after clicking on any area of toast. If `true`: toast disappeared after clicking on close button",
    },
    timeout: {
      description:
        "Time (in milliseconds) for showing your toast. Setting in `0` let you to show toast constantly until clicking on it",
    },
    data: {
      description: "Any components or data inside a toast",
    },
  },

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=648%3A4421&mode=dev",
    },
  },
};

const BaseTemplate = ({
  type,
  data,
  title,
  timeout,
  withCross,
  ...args
}: any) => {
  return (
    <>
      <Toast {...args} />
      <Button
        // @ts-expect-error TS(2322): Type '{ label: string; primary: true; size: string... Remove this comment to see the full error message
        label="Show toast"
        primary
        size="small"
        onClick={() => {
          switch (type) {
            case "error":
              // @ts-expect-error TS(2554): Expected 5 arguments, but got 4.
              toastr.error(data, title, timeout, withCross);
              break;
            case "warning":
              // @ts-expect-error TS(2554): Expected 5 arguments, but got 4.
              toastr.warning(data, title, timeout, withCross);
              break;
            case "info":
              // @ts-expect-error TS(2554): Expected 5 arguments, but got 4.
              toastr.info(data, title, timeout, withCross);
              break;
            default:
              // @ts-expect-error TS(2554): Expected 5 arguments, but got 4.
              toastr.success(data, title, timeout, withCross);
              break;
          }
        }}
      />
    </>
  );
};

export const basic = BaseTemplate.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ type, d... Remove this comment to see the full error message
basic.args = {
  type: "success",
  data: "Demo text for Toast",
  title: "Demo title",
  withCross: false,
  timeout: 5000,
};

const AllTemplate = (args: any) => {
  const renderAllToast = () => {
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    toastr.success(
      "Demo text for success Toast closes in 30 seconds or on click",
      null,
      30000
    );
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    toastr.error(
      "Demo text for error Toast closes in 28 seconds or on click",
      null,
      28000
    );
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    toastr.warning(
      "Demo text for warning Toast closes in 25 seconds or on click",
      null,
      25000
    );
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    toastr.info(
      "Demo text for info Toast closes in 15 seconds or on click",
      null,
      15000
    );
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    toastr.success(
      "Demo text for success Toast with title closes in 12 seconds or on click",
      "Demo title",
      12000
    );
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    toastr.error(
      "Demo text for error Toast with title closes in 10 seconds or on click",
      "Demo title",
      10000
    );
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    toastr.warning(
      "Demo text for warning Toast with title closes in 8 seconds or on click",
      "Demo title",
      8000
    );
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    toastr.info(
      "Demo text for info Toast with title closes in 6 seconds or on click",
      "Demo title",
      6000
    );
    toastr.success(
      "Demo text for success manual closed Toast",
      null,
      0,
      true,
      true
    );
    toastr.error(
      "Demo text for error manual closed Toast",
      null,
      0,
      true,
      true
    );
    toastr.warning(
      "Demo text for warning manual closed Toast",
      null,
      0,
      true,
      true
    );
    toastr.info("Demo text for info manual closed Toast", null, 0, true, true);
    toastr.success(
      <>
        Demo text for success manual closed Toast with title and contains{" "}
        <Link
          type="page"
          color="gray"
          href="https://github.com"
          // @ts-expect-error TS(2322): Type '{ type: string; color: string; href: string;... Remove this comment to see the full error message
          text="gray link"
        />
      </>,
      "Demo title",
      0,
      true,
      true
    );
    toastr.error(
      "Demo text for error manual closed Toast with title",
      "Demo title",
      0,
      true,
      true
    );
    toastr.warning(
      "Demo text for warning manual closed Toast with title",
      "Demo title",
      0,
      true,
      true
    );
    toastr.info(
      "Demo text for info manual closed Toast with title",
      "Demo title",
      0,
      true,
      true
    );
  };
  return (
    <>
      <Toast />
      <Button
        // @ts-expect-error TS(2322): Type '{ label: string; primary: true; size: string... Remove this comment to see the full error message
        label="Show all toast"
        primary
        size="small"
        onClick={() => renderAllToast()}
      />
    </>
  );
};

export const all = AllTemplate.bind({});
