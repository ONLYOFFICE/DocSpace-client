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
import { Meta, StoryFn } from "@storybook/react";
import FirebaseHelper from "../../utils/firebase";
import {
  DeviceType,
  EmployeeActivationStatus,
  EmployeeStatus,
} from "../../enums";

import { Error401 } from "./Error401";
import { Error403 } from "./Error403";
import Error404 from "./Error404";
import Error520 from "./Error520";
import { ErrorOfflineContainer } from "./ErrorOffline";
import ErrorUnavailable from "./ErrorUnavailable";
import { AccessRestricted } from "./AccessRestricted";
import type { Error520Props } from "./Errors.types";

export default {
  title: "Layout components/Errors",
  component: Error404,
  parameters: {
    docs: {
      description: {
        component: "Error pages components",
      },
    },
    layout: "fullscreen",
  },
} as Meta;

const Template401: StoryFn = () => <Error401 />;
const Template403: StoryFn = () => <Error403 />;
const Template404: StoryFn = () => <Error404 />;
const TemplateOffline: StoryFn = () => <ErrorOfflineContainer />;
const TemplateUnavailable: StoryFn = () => <ErrorUnavailable />;
const TemplateAccessRestricted: StoryFn = () => <AccessRestricted />;

export const Error401Page = Template401.bind({});
Error401Page.storyName = "401 Error";

export const Error403Page = Template403.bind({});
Error403Page.storyName = "403 Error";

export const Error404Page = Template404.bind({});
Error404Page.storyName = "404 Error";

export const ErrorOfflinePage = TemplateOffline.bind({});
ErrorOfflinePage.storyName = "Offline Error";

export const ErrorUnavailablePage = TemplateUnavailable.bind({});
ErrorUnavailablePage.storyName = "Unavailable Error";

export const AccessRestrictedPage = TemplateAccessRestricted.bind({});
AccessRestrictedPage.storyName = "Access Restricted";

const Template520: StoryFn<Error520Props> = (args) => <Error520 {...args} />;

export const Error520Page = Template520.bind({});
Error520Page.storyName = "520 Error";
Error520Page.args = {
  errorLog: new Error("Test error"),
  user: {
    id: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
    access: 0,
    firstName: "",
    lastName: "",
    userName: "",
    status: EmployeeStatus.Active,
    activationStatus: EmployeeActivationStatus.NotActivated,
    department: "",
    workFrom: "",
    avatarMax: "",
    avatarMedium: "",
    avatarOriginal: "",
    avatar: "",
    isAdmin: false,
    isRoomAdmin: false,
    isLDAP: false,
    listAdminModules: [],
    isOwner: false,
    isVisitor: false,
    isCollaborator: false,
    mobilePhoneActivationStatus: 0,
    isSSO: false,
    avatarSmall: "",
    profileUrl: "",
    hasAvatar: false,
    isAnonim: false,
  },
  version: "1.0.0",
  firebaseHelper: {} as FirebaseHelper,
  currentDeviceType: DeviceType.desktop,
};
