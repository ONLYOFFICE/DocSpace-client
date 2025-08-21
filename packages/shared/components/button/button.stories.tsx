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

/* eslint-disable no-alert */
import React from "react";

import { Meta, StoryObj } from "@storybook/react";

import Icon from "PUBLIC_DIR/images/button.alert.react.svg";

import { Button, ButtonSize } from ".";
import { ButtonProps } from "./Button.types";

const meta = {
  title: "Interactive Elements/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `Button is used for actions on a page.
          
### Accessibility

The Button component includes the following ARIA attributes for improved accessibility:

- \`aria-label\`: Provides a text description of the button's action
- \`aria-disabled\`: Indicates when the button is disabled
- \`aria-busy\`: Indicates when the button is in a loading state

These attributes help users of assistive technologies better understand the button's state and purpose.`,
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=62-3582&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export default meta;

const Wrapper = (props: { isScale: boolean; children: React.ReactNode }) => {
  const { isScale, children } = props;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isScale
          ? "1fr"
          : "repeat( auto-fill, minmax(180px, 1fr) )",
        gridGap: "16px",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
};

const Template = (args: ButtonProps) => (
  <Button {...args} onClick={() => alert("Button clicked")} />
);

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: { size: ButtonSize.small, label: "Button" },
};

const PrimaryTemplate = () => {
  return (
    <Wrapper isScale={false}>
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-primary-${size}`}
          primary
          scale={false}
          size={size}
          label={`Primary ${size[0].toUpperCase()}${size.slice(1)}`}
          onClick={() => {}}
        />
      ))}
    </Wrapper>
  );
};

const SecondaryTemplate = () => {
  return (
    <Wrapper isScale={false}>
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-secondary-${size}`}
          scale={false}
          size={size}
          label={`Secondary ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
    </Wrapper>
  );
};

const WithIconTemplate = () => {
  return (
    <Wrapper isScale={false}>
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-icon-prim-${size}`}
          primary
          size={size}
          icon={<Icon />}
          label={`With Icon ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-icon-sec-${size}`}
          size={size}
          icon={<Icon />}
          label={`With Icon ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
    </Wrapper>
  );
};

const IsLoadingTemplate = () => {
  return (
    <Wrapper isScale={false}>
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-load-prim-${size}`}
          primary
          size={size}
          isLoading
          label={`Loading ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-load-sec-${size}`}
          size={size}
          isLoading
          label={`Loading ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
    </Wrapper>
  );
};

const ScaleTemplate = () => {
  return (
    <Wrapper isScale>
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-scale-prim-${size}`}
          primary
          size={size}
          label={`Scale ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-scale-sec-${size}`}
          size={size}
          label={`Scale ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
    </Wrapper>
  );
};

const DisabledTemplate = () => {
  return (
    <Wrapper isScale={false}>
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-disabled-prim-${size}`}
          primary
          size={size}
          isDisabled
          label={`Disabled ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-disabled-sec-${size}`}
          size={size}
          isDisabled
          label={`Disabled ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
    </Wrapper>
  );
};

const ClickedTemplate = () => {
  return (
    <Wrapper isScale={false}>
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-clicked-prim-${size}`}
          primary
          size={size}
          isClicked
          label={`Clicked ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-clicked-sec-${size}`}
          size={size}
          isClicked
          label={`Clicked ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
    </Wrapper>
  );
};

const HoveredTemplate = () => {
  return (
    <Wrapper isScale={false}>
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-hovered-prim-${size}`}
          primary
          size={size}
          isHovered
          label={`Hovered ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
      {(Object.keys(ButtonSize) as Array<ButtonSize>).map((size) => (
        <Button
          key={`all-hovered-sec-${size}`}
          size={size}
          isHovered
          label={`Hovered ${size[0].toUpperCase()}${size.slice(1)}`}
        />
      ))}
    </Wrapper>
  );
};

export const PrimaryButtons: Story = {
  render: () => <PrimaryTemplate />,
};
export const SecondaryButtons: Story = {
  render: () => <SecondaryTemplate />,
};
export const WithIconButtons: Story = {
  render: () => <WithIconTemplate />,
};
export const IsLoadingButtons: Story = {
  render: () => <IsLoadingTemplate />,
};
export const ScaleButtons: Story = {
  render: () => <ScaleTemplate />,
};
export const DisabledButtons: Story = {
  render: () => <DisabledTemplate />,
};
export const ClickedButtons: Story = {
  render: () => <ClickedTemplate />,
};
export const HoveredButtons: Story = {
  render: () => <HoveredTemplate />,
};
