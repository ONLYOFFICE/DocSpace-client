// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ReactSVG } from "react-svg";
import PublicRoomTemplateIconReactSvgUrl from "PUBLIC_DIR/images/icons/32/template/public.svg?url";
import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";
import { ContextMenuModel } from "../../context-menu";
import { Link } from "../../link";
import { IconSizeType } from "../../../utils";
import i18nextStoryDecorator from "../../../.storybook/decorators/i18nextStoryDecorator";
import { ComboBox, ComboBoxSize } from "../../combobox";
import { Text } from "../../text";

import { TemplateTile } from "./TemplateTile";
import { TemplateTileProps, TemplateItem } from "./TemplateTile.types";
import { TileContent } from "../tile-content/TileContent";
import { IconButton } from "../../icon-button";

const contextOptions: ContextMenuModel[] = [
  {
    id: "option_edit",
    key: "edit",
    label: "Edit",
    onClick: () => {},
    disabled: false,
  },
  {
    id: "option_delete",
    key: "delete",
    label: "Delete",
    onClick: () => {},
    disabled: false,
  },
];

interface StoryTemplateItem extends TemplateItem {
  usedSpace: number;
  quotaLimit?: number;
  isCustomQuota: boolean;
  contextOptions: ContextMenuModel[];
}

type QuotaOption = {
  id: string;
  key: string;
  label: string;
  action: string;
};

type MockSpaceQuotaProps = {
  item: TemplateItem;
  isReadOnly?: boolean;
  className?: string;
  withoutLimitQuota?: boolean;
};

const MockSpaceQuota: React.FC<MockSpaceQuotaProps> = ({
  item,
  className,
  isReadOnly,
  withoutLimitQuota,
}) => {
  const extendedItem = item as unknown as StoryTemplateItem;

  const usedSpace = `${Math.round(extendedItem.usedSpace / (1024 * 1024))} MB`;
  const quotaLimit = !extendedItem.quotaLimit
    ? "Unlimited"
    : `${Math.round(extendedItem.quotaLimit / (1024 * 1024))} MB`;

  const options: QuotaOption[] = [
    {
      id: "info-account-quota_edit",
      key: "change-quota",
      label: "Change Quota",
      action: "change",
    },
    {
      id: "info-account-quota_current-size",
      key: "current-size",
      label: quotaLimit,
      action: "current-size",
    },
    {
      id: "info-account-quota_no-quota",
      key: "no-quota",
      label: extendedItem.quotaLimit === -1 ? "Unlimited" : "Disable Quota",
      action: "no-quota",
    },
  ];

  if (withoutLimitQuota || extendedItem?.quotaLimit === undefined) {
    return <Text fontWeight={600}>{usedSpace}</Text>;
  }

  if (isReadOnly) {
    return (
      <Text fontWeight={600} style={{ display: "contents" }}>
        {usedSpace} / {quotaLimit}
      </Text>
    );
  }

  const selectedOption =
    options.find(
      (elem) =>
        elem.action ===
        (extendedItem.quotaLimit === -1 ? "no-quota" : "current-size"),
    ) || options[1];

  return (
    <div
      style={{ display: "flex", alignItems: "center" }}
      className={className}
    >
      <Text fontWeight={600}>{usedSpace} / </Text>
      <ComboBox
        style={{ flex: 1, minWidth: 0, padding: 0 }}
        selectedOption={selectedOption}
        size={ComboBoxSize.content}
        options={options}
        onSelect={() => {}}
        scaled={false}
        modernView
        manualWidth="auto"
        directionY="both"
      />
    </div>
  );
};

const element = (
  <ReactSVG
    className="template-icon"
    src={PublicRoomTemplateIconReactSvgUrl}
    data-testid="template-icon"
  />
);

const badges = (
  <div className="badges">
    <IconButton
      iconName={CreateRoomReactSvgUrl}
      onClick={() => {}}
      className="badge icons-group"
      size={IconSizeType.medium}
      hoverColor="accent"
      clickColor="accent"
    />
  </div>
);

const defaultItem: StoryTemplateItem = {
  id: "template-1",
  title: "Sample Template",
  createdBy: {
    id: "user-1",
    displayName: "John Doe",
  },
  security: {
    EditRoom: true,
  },
  usedSpace: 1024 * 1024 * 45, // 45 MB
  isCustomQuota: true,
  contextOptions,
};

const meta = {
  title: "Components/TemplateTile",
  component: TemplateTile,
  parameters: {
    docs: {
      description: {
        component:
          "Template tile component for displaying template information in a tile format",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    isActive: { control: "boolean" },
    isBlockingOperation: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof TemplateTile>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ checked: initialChecked, ...args }: TemplateTileProps) => {
  const [checked, setChecked] = useState(initialChecked);

  const onSelect = (isSelected: boolean) => {
    setChecked(isSelected);
  };

  return (
    <div style={{ maxWidth: "300px", margin: "30px" }}>
      <TemplateTile {...args} checked={checked} onSelect={onSelect}>
        <TileContent>
          <Link>Template Content</Link>
        </TileContent>
      </TemplateTile>
    </div>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    item: defaultItem,
    element,
    contextOptions,
    badges,
    showStorageInfo: true,
    openUser: () => {},
    getContextModel: () => contextOptions,
    columnCount: 1,
    SpaceQuotaComponent: MockSpaceQuota,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic template tile with selection functionality",
      },
    },
  },
};

export const Checked: Story = {
  render: Template,
  args: {
    ...Default.args,
    checked: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Template tile in checked state",
      },
    },
  },
};

export const WithSpaceQuota: Story = {
  render: Template,
  args: {
    ...Default.args,
    showStorageInfo: true,
    SpaceQuotaComponent: MockSpaceQuota,
    item: {
      ...defaultItem,
      quotaLimit: 1024 * 1024 * 100, // 100 MB
      isCustomQuota: true,
    } as StoryTemplateItem,
  },
  parameters: {
    docs: {
      description: {
        story: "Template tile with space quota information and controls",
      },
    },
  },
};

export const WithReadOnlyQuota: Story = {
  render: Template,
  args: {
    ...Default.args,
    showStorageInfo: true,
    SpaceQuotaComponent: MockSpaceQuota,
    item: {
      ...defaultItem,
      quotaLimit: 1024 * 1024 * 100, // 100 MB
      security: {
        EditRoom: false,
      },
    } as StoryTemplateItem,
  },
  parameters: {
    docs: {
      description: {
        story: "Template tile with read-only quota display",
      },
    },
  },
};

export const BlockingOperation: Story = {
  render: Template,
  args: {
    ...Default.args,
    isBlockingOperation: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Template tile showing blocking operation state",
      },
    },
  },
};
