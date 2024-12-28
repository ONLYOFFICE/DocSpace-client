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
import { Meta, Story } from "@storybook/react";

import OperationContainer from "./index";
import { OperationContainerProps } from "./OperationContainer.types";

export default {
  title: "Components/OperationContainer",
  component: OperationContainer,
  parameters: {
    docs: {
      description: {
        component:
          "Operation container component for displaying operation status with title and description",
      },
    },
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (Story) => <Story />,
  ],
} as Meta;

const Template: Story<OperationContainerProps> = (args) => (
  <OperationContainer {...args} />
);

export const Default = Template.bind({});
Default.args = {
  title: "Operation in Progress",
  description: "Please wait while we process your request",
  authorized: false,
};

export const WithRedirect = Template.bind({});
WithRedirect.args = {
  title: "Redirecting",
  description: "You will be redirected to the target page",
  authorized: true,
  url: "https://example.com",
};

export const Unauthorized = Template.bind({});
Unauthorized.args = {
  title: "Access Denied",
  description: "You are not authorized to view this content",
  authorized: false,
  url: "https://example.com",
};
