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

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg";
import EmptyScreenFilterPng from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg?url";

import { IconSizeType } from "../../utils";
import { Link, LinkType } from "../link";
import { EmptyScreenContainer } from ".";

import styles from "./EmptyScreenContainer.stories.module.scss";

const meta = {
  title: "Base UI Components/EmptyScreenContainer",
  component: EmptyScreenContainer,
  parameters: {
    docs: {
      description: {
        component:
          "EmptyScreenContainer is a versatile component used to display empty states in the application. " +
          "It can show various combinations of images, headers, subheadings, descriptions, and action buttons " +
          "to guide users when no content is available.",
      },
    },
  },
  argTypes: {
    imageSrc: {
      description: "Source URL for the empty state image",
      control: "text",
    },
    imageAlt: {
      description: "Alt text for the empty state image",
      control: "text",
    },
    headerText: {
      description: "Main header text displayed below the image",
      control: "text",
    },
    subheadingText: {
      description: "Optional subheading text displayed below the header",
      control: "text",
    },
    descriptionText: {
      description: "Optional detailed description text",
      control: "text",
    },
    withoutFilter: {
      description: "Whether to show without filter styling",
      control: "boolean",
    },
    imageStyle: {
      description: "Custom styles for the image",
      control: "object",
    },
    buttonStyle: {
      description: "Custom styles for the buttons container",
      control: "object",
    },
  },
} satisfies Meta<typeof EmptyScreenContainer>;

type Story = StoryObj<typeof meta>;

export default meta;

const ResetFilterButton = () => (
  <div className={styles.resetFilterButton}>
    <CrossReactSvgUrl
      className={styles.crossIcon}
      data-size={IconSizeType.small}
    />
    <Link type={LinkType.action} isHovered>
      Reset filter
    </Link>
  </div>
);

const HomeButton = () => (
  <Link type={LinkType.action} isHovered href="/">
    Go to home
  </Link>
);

export const Default: Story = {
  args: {
    imageSrc: EmptyScreenFilterPng,
    imageAlt: "Empty Screen Filter image",
    headerText: "No results matching your search could be found",
    subheadingText: "No files to be displayed in this section",
    descriptionText:
      "No people matching your filter can be displayed in this section. Please select other filter options or clear filter to view all the people in this section.",
    buttons: <ResetFilterButton />,
  },
};

export const MinimalContent: Story = {
  args: {
    imageSrc: EmptyScreenFilterPng,
    imageAlt: "Empty search results",
    headerText: "No results found",
    buttons: <HomeButton />,
  },
};

export const CustomStyles: Story = {
  args: {
    imageSrc: EmptyScreenFilterPng,
    imageAlt: "Empty Screen Filter image",
    headerText: "Custom styled empty state",
    descriptionText: "This example shows custom styles for image and buttons",
    buttons: <HomeButton />,
    imageStyle: { width: "150px", height: "150px" },
    buttonStyle: { marginTop: "32px" },
  },
};
