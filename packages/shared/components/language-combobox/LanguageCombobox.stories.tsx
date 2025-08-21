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

import { StoryFn, Meta } from "@storybook/react";
import { LanguageCombobox } from "./LanguageCombobox";
import { ComboboxProps } from "./LanguageCombobox.types";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

export default {
  title: "Components/LanguageCombobox",
  component: LanguageCombobox,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  decorators: [(Story) => <Story />, i18nextStoryDecorator],
  argTypes: {
    withBorder: {
      control: "boolean",
      defaultValue: true,
    },
    isMobileView: {
      control: "boolean",
      defaultValue: false,
    },
    selectedCulture: {
      control: "select",
      options: ["en-US", "de", "fr", "es", "it"],
    },
  },
} as Meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div style={{ height: "280px" }}>{children}</div>;
};

const Template: StoryFn<ComboboxProps> = (args) => (
  <Wrapper>
    <LanguageCombobox {...args} />
  </Wrapper>
);

export const Default = Template.bind({});
Default.args = {
  selectedCulture: "en-US",
  cultures: ["en-US", "de", "fr", "es", "it"],
  onSelectLanguage: (culture) => console.log("Selected culture:", culture),
  className: "custom-class",
  withBorder: true,
  isMobileView: false,
  directionY: "bottom",
  fixedDirection: true,
  isDefaultMode: false,
};

export const MobileView = Template.bind({});
MobileView.args = {
  ...Default.args,
  isMobileView: true,
  manualWidth: "200px",
};

export const WithoutBorder = Template.bind({});
WithoutBorder.args = {
  ...Default.args,
  withBorder: false,
};
