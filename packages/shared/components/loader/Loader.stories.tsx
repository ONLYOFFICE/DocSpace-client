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
import { Meta, StoryObj } from "@storybook/react";

import { Loader } from ".";
import { LoaderTypes } from "./Loader.enums";
import { globalColors } from "../../themes";

const meta = {
  title: "Status components/Loader",
  component: Loader,
  parameters: {
    docs: {
      description: {
        component:
          "Loader component is used for displaying loading states and progress indicators in the application. It supports multiple types of loaders and can be customized with different colors and sizes.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=419-1989&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    type: {
      description: "Type of the loader animation",
      control: "select",
      options: Object.values(LoaderTypes),
      table: {
        type: { summary: "LoaderTypes" },
        defaultValue: { summary: LoaderTypes.base },
      },
    },
    color: {
      description: "Color of the loader",
      control: "color",
      table: {
        type: { summary: "string" },
      },
    },
    size: {
      description: "Size of the loader (in px, rem, or other CSS units)",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "18px" },
      },
    },
    label: {
      description: "Accessibility label for screen readers",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
  },
} satisfies Meta<typeof Loader>;

type Story = StoryObj<typeof Loader>;

export default meta;

export const Default: Story = {
  args: {
    type: LoaderTypes.base,
    size: "18px",
    label: "Loading content, please wait...",
  },
};

export const LoaderTypesStory: Story = {
  render: ({ color }) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "20px",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Loader type={LoaderTypes.base} size="18px" label="Base loader" />
          <div style={{ marginTop: "10px", fontSize: "12px" }}>Base</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Loader
            type={LoaderTypes.dualRing}
            size="40px"
            color={color}
            label="Dual ring loader"
          />
          <div style={{ marginTop: "10px", fontSize: "12px" }}>Dual Ring</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Loader
            type={LoaderTypes.oval}
            size="40px"
            color={color}
            label="Oval loader"
          />
          <div style={{ marginTop: "10px", fontSize: "12px" }}>Oval</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Loader
            type={LoaderTypes.rombs}
            size="40px"
            color={color}
            label="Rombs loader"
          />
          <div style={{ marginTop: "10px", fontSize: "12px" }}>Rombs</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Loader
            type={LoaderTypes.track}
            style={{ width: "30px" }}
            label="Track loader"
          />
          <div style={{ marginTop: "10px", fontSize: "12px" }}>Track</div>
        </div>
      </div>
    );
  },
};

export const CustomColors: Story = {
  render: () => {
    return (
      <div style={{ display: "flex", gap: "20px" }}>
        <Loader
          type={LoaderTypes.dualRing}
          color="#FF5722"
          size="40px"
          label="Orange loader"
        />
        <Loader
          type={LoaderTypes.dualRing}
          color="#2196F3"
          size="50px"
          label="Blue loader"
        />
        <Loader
          type={LoaderTypes.dualRing}
          color="#4CAF50"
          size="60px"
          label="Green loader"
        />
      </div>
    );
  },
};

export const DifferentSizes: Story = {
  render: () => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Loader
          type={LoaderTypes.oval}
          color={globalColors.loaderLight}
          size="24px"
          label="Small loader"
        />
        <Loader
          type={LoaderTypes.oval}
          color={globalColors.loaderLight}
          size="40px"
          label="Medium loader"
        />
        <Loader
          type={LoaderTypes.oval}
          color={globalColors.loaderLight}
          size="60px"
          label="Large loader"
        />
      </div>
    );
  },
};
