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

import { FC } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ErrorContainerProps } from "./ErrorContainer.types";
import ErrorContainer from "./ErrorContainer";

type ErrorContainerType = FC<ErrorContainerProps>;

const meta: Meta<ErrorContainerType> = {
  title: "Layout components/ErrorContainer",
  component: ErrorContainer,
  argTypes: {
    onClickButton: { action: "clicked" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Error container component that displays error messages with optional button and customizable styles",
      },
    },
  },
};

export default meta;

export const Default: StoryObj<ErrorContainerType> = {
  args: {
    bodyText: "Try again later",
    headerText: "Some error has happened",
    customizedBodyText: "Customized body",
  },
};

export const WithPrimaryButton: StoryObj<ErrorContainerType> = {
  args: {
    bodyText: "An error occurred while processing your request",
    headerText: "Some error has happened",
    buttonText: "Retry",
    isPrimaryButton: true,
  },
};

export const InEditorMode: StoryObj<ErrorContainerType> = {
  args: {
    isEditor: true,
    bodyText: "Editor mode error message",
    buttonText: "Close Editor",
  },
};

export const WithChildren: StoryObj<ErrorContainerType> = {
  args: {
    children: (
      <div style={{ padding: "16px", textAlign: "center" }}>
        <p>Custom child content</p>
        <small>Additional details can be placed here</small>
      </div>
    ),
  },
};
