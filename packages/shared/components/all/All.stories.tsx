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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/no-unescaped-entities */
import React from "react";
// import { BooleanValue, StringValue } from "react-values";

import moment from "moment";

import SettingsReactSvg from "PUBLIC_DIR/images/settings.react.svg";
import CatalogFolderReactSvg from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg";
import CatalogEmployeeReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";

import { Avatar, AvatarRole, AvatarSize } from "../avatar";
import { Button, ButtonSize } from "../button";
// import HelpButton from "../help-button";
// import IconButton from "../icon-button";
import { ToggleButton } from "../toggle-button";
import { Calendar } from "../calendar";
import { Checkbox } from "../checkbox";
import { ComboBox, ComboBoxSize } from "../combobox";
import { InputBlock } from "../input-block";
import { RadioButtonGroup } from "../radio-button-group";
import { InputSize, InputType, TextInput } from "../text-input";
import { Textarea } from "../textarea";
// import ContextMenuButton from "../context-menu-button";
// import DatePicker from "../date-picker";
import { FieldContainer } from "../field-container";
import { Heading, HeadingSize } from "../heading";
import { Link, LinkType } from "../link";
import { Loader, LoaderTypes } from "../loader";
import { Row, RowProps } from "../rows";
import { Scrollbar } from "../scrollbar";
import { Tabs, TabsTypes } from "../tabs";
import { Text } from "../text";
import { Toast, toastr } from "../toast";
import { Tooltip } from "../tooltip";
import { globalColors } from "../../themes";

const arrayItems = [
  {
    id: "0",
    name: "Tab 1",
    content: <div>Tab 1 content</div>,
  },
  {
    id: "1",
    name: "Tab 2",
    content: <div>Tab 2 content</div>,
  },
  {
    id: "2",
    name: "Tab 3",
    content: <div>Tab 3 content</div>,
  },
];

const options = [
  {
    key: 0,
    icon: CatalogEmployeeReactSvgUrl, // optional item
    label: "Option 1",
    disabled: false, // optional item
    onClick: () => {}, // optional item
  },
  {
    key: 1,
    icon: CatalogEmployeeReactSvgUrl, // optional item
    label: "Option 2",
    disabled: false, // optional item
    onClick: () => {}, // optional item
  },
  {
    key: 2,
    icon: CatalogEmployeeReactSvgUrl, // optional item
    label: "Option 3",
    disabled: true, // optional item
    onClick: () => {}, // optional item
  },
  {
    key: 3,
    icon: CatalogEmployeeReactSvgUrl, // optional item
    label: "Option 4",
    disabled: false, // optional item
    onClick: () => {}, // optional item
  },
];

const arrayUsers = [
  { key: "user_1", name: "Bob", email: "Bob@gmail.com", position: "developer" },
  {
    key: "user_2",
    name: "John",
    email: "John@gmail.com",
    position: "developer",
  },
  {
    key: "user_3",
    name: "Kevin",
    email: "Kevin@gmail.com",
    position: "developer",
  },
];

const element = "Icon";

const elementAvatar = (
  <Avatar
    size={AvatarSize.min}
    role={AvatarRole.user}
    userName="Demo Avatar"
    source=""
  />
);
const elementIcon = <CatalogFolderReactSvg />;
const elementComboBox = (
  <ComboBox
    options={[
      { key: 1, icon: CatalogEmployeeReactSvgUrl, label: "Open" },
      { key: 2, icon: "CheckIcon", label: "Closed" },
    ]}
    onSelect={() => {}}
    selectedOption={{
      key: 0,
      icon: CatalogEmployeeReactSvgUrl,
      label: "",
    }}
    scaled={false}
    size={ComboBoxSize.content}
    isDisabled={false}
  />
);

const checkedProps = { checked: false };
const getElementProps = (e: string) =>
  e === "Avatar"
    ? { element: elementAvatar }
    : e === "Icon"
      ? { element: elementIcon }
      : e === "ComboBox"
        ? { element: elementComboBox }
        : {};

const elementProps = getElementProps(element);

const rowContent = (
  <Row
    {...checkedProps}
    {...elementProps}
    isIndexEditingMode={false}
    onRowClick={() => {}}
    contextOptions={[
      {
        key: "key-1",
        label: "Edit",
        onClick: () => {},
      },
      {
        key: "key-2",
        label: "Delete",
        onClick: () => {},
      },
    ]}
  >
    <Text truncate>Sample text</Text>
  </Row>
);

let rowCount = 5;
const rowArray: React.ReactElement<RowProps>[] = [];
while (rowCount !== 0) {
  rowArray.push(rowContent);
  rowCount -= 1;
}

export default {
  title: "All",
  parameters: {
    docs: { description: { component: "All components" } },
  },
};
const Template = () => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "25px",
    }}
  >
    <div style={{ justifySelf: "center" }}>
      <div style={{ padding: "8px 0" }}>
        <Heading level={1} size={HeadingSize.medium} title="Some title">
          Heading text
        </Heading>
      </div>
      <div style={{ padding: "8px 0" }}>
        <Text as="p" title="Some title">
          Text as "p"
        </Text>
      </div>

      <div style={{ padding: "8px 0" }}>
        <Link type={LinkType.page} href="https://github.com">
          Black page link
        </Link>
        <br />
        <Link type={LinkType.page} href="https://github.com" isHovered>
          Black hovered page link
        </Link>
        <br />
        <Link type={LinkType.action}>Black action link</Link>
        <br />
        <Link type={LinkType.action} isHovered>
          Black hovered action link
        </Link>
      </div>
      <div style={{ padding: "24px 0 8px 0" }}>
        <Link data-tooltip-id="group" data-tooltip-content={0}>
          Bob
        </Link>
        <br />
        <Link data-tooltip-id="group" data-tooltip-content={1}>
          John
        </Link>
        <br />
        <Link data-tooltip-id="group" data-tooltip-content={2}>
          Kevin
        </Link>
        <Tooltip
          id="group"
          getContent={({ content }) =>
            content ? (
              <div>
                <Text isBold fontSize="16px">
                  {arrayUsers[+content].name}
                </Text>
                <Text color={globalColors.gray} fontSize="13px">
                  {arrayUsers[+content].email}
                </Text>
                <Text fontSize="13px">{arrayUsers[+content].position}</Text>
              </div>
            ) : null
          }
        />
      </div>
      <div style={{ padding: "8px 0" }}>
        <div style={{ display: "flex" }}>
          <div style={{ marginInlineEnd: 16 }}>
            <Button
              size={ButtonSize.normal}
              isDisabled={false}
              onClick={() => {}}
              label="Button"
              primary
            />
          </div>

          <Button
            size={ButtonSize.normal}
            isDisabled={false}
            onClick={() => {}}
            label="Button"
          />
        </div>
      </div>
      <div style={{ padding: "8px 0" }}>
        <Toast />
        <Button
          label="Show toastr"
          onClick={() =>
            toastr.success(
              "Some text for toast",
              "Some text for title",
              undefined,
              true,
            )
          }
        />
      </div>
    </div>
    <div style={{ justifySelf: "center" }}>
      <div style={{ padding: "8px 0" }}>
        <ComboBox
          options={options}
          isDisabled={false}
          selectedOption={{
            key: 0,
            label: "Select",
          }}
          dropDownMaxHeight={200}
          noBorder={false}
          scaledOptions
          size={ComboBoxSize.content}
          onSelect={() => {}}
        />
      </div>

      <div style={{ padding: "8px 0" }}>
        {/* <StringValue>
          {({ value, set }: any) => ( */}
        <TextInput
          placeholder="Add input text"
          value=""
          onChange={() => {}}
          type={InputType.text}
          size={InputSize.base}
        />
        {/* )} */}
        {/* </StringValue> */}
      </div>

      <div style={{ padding: "8px 0" }}>
        {/* <StringValue>
          {({ value, set }: any) => ( */}
        <InputBlock
          placeholder="Add input text"
          iconName=""
          onIconClick={() => {}}
          onChange={() => {}}
          value=""
          type={InputType.text}
          size={InputSize.base}
        >
          <SettingsReactSvg />
        </InputBlock>
        {/* )}
        </StringValue> */}
      </div>

      <div style={{ padding: "8px 0" }}>
        {/* <StringValue>
          {({ value, set }: any) => ( */}
        <Textarea placeholder="Add comment" onChange={() => {}} value="" />
        {/* )}
        </StringValue> */}
      </div>
      <div style={{ padding: "8px 0" }}>
        {/* <StringValue>
          {({ value, set }: any) => ( */}
        <FieldContainer
          place="top"
          isRequired
          tooltipContent="Paste you tooltip content here"
          labelText="Name:"
        >
          <TextInput
            value=""
            onChange={() => {}}
            type={InputType.text}
            size={InputSize.base}
          />
        </FieldContainer>
        {/* )}
        </StringValue> */}
      </div>
      <div style={{ padding: "8px 0" }}>
        <RadioButtonGroup
          name="fruits"
          selected="banana"
          options={[
            { value: "apple", label: "Sweet apple" },
            { value: "banana", label: "Banana" },
            { value: "Mandarin" },
          ]}
          onClick={() => {}}
          orientation="vertical"
        />
      </div>
      <div style={{ padding: "8px 0" }}>
        {/* <BooleanValue>
          {({ value, toggle }: any) => ( */}
        <div style={{ display: "flex" }}>
          <div style={{ marginInlineEnd: 24 }}>
            <Checkbox
              id="id"
              name="name"
              value="value"
              label="Checkbox"
              isChecked={false}
              isIndeterminate={false}
              isDisabled={false}
              onChange={() => {}}
            />
          </div>
          <Checkbox
            id="id"
            name="name"
            value="value"
            label="Checkbox indeterminate"
            isIndeterminate
            isDisabled={false}
            onChange={() => {}}
          />
        </div>
        {/* )}
        </BooleanValue> */}
      </div>

      <div style={{ padding: "8px 0 24px 0" }}>
        {/* <BooleanValue>
          {({ value, toggle }: any) => ( */}
        <ToggleButton
          label="Toggle button"
          onChange={() => {}}
          isChecked={false}
        />
        {/* )}
        </BooleanValue> */}
      </div>
    </div>
    <div style={{ justifySelf: "center" }}>
      <div style={{ padding: "8px 0" }}>
        <Calendar
          onChange={() => {}}
          selectedDate={moment()}
          minDate={new Date("1970/01/01")}
          maxDate={new Date("3000/01/01")}
          locale="en"
          setSelectedDate={() => {}}
        />
      </div>
    </div>
    <div style={{ justifySelf: "center" }}>
      <div style={{ padding: "8px 0" }}>
        {/* {rowArray[0]} */}
        {rowArray.map((item, idx) => {
          // eslint-disable-next-line react/no-array-index-key
          return <div key={`${idx}`}>{item}</div>;
        })}
      </div>
    </div>

    <div style={{ justifySelf: "center" }}>
      <div style={{ padding: "8px 0" }}>
        <Avatar
          size={AvatarSize.max}
          role={AvatarRole.admin}
          source=""
          userName=""
          editing={false}
        />
      </div>
    </div>
    <div style={{ justifySelf: "center" }}>
      <div style={{ padding: "8px 0" }}>
        <Loader
          type={LoaderTypes.base}
          color="black"
          size="30px"
          label="Loading..."
        />
      </div>
      <div style={{ padding: "8px 0", marginInlineStart: 45 }}>
        <Loader
          type={LoaderTypes.oval}
          color="black"
          size="30px"
          label="Loading"
        />
      </div>
      <div style={{ padding: "8px 0", marginInlineStart: 45 }}>
        <Loader
          type={LoaderTypes.dualRing}
          color="black"
          size="30px"
          label="Loading"
        />
      </div>
    </div>
    <div style={{ justifySelf: "center" }}>
      <div style={{ padding: "8px 0" }}>
        <Scrollbar style={{ width: 300, height: 200 }}>
          ================================================================ Lorem
          ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
          ea commodo consequat. Duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
          ================================================================
        </Scrollbar>
      </div>
    </div>
    <div>
      <div style={{ padding: "8px 0" }}>
        <Tabs
          items={arrayItems}
          type={TabsTypes.Secondary}
          onSelect={() => {}}
          selectedItemId={arrayItems[0].id}
        />
      </div>
    </div>
  </div>
);

export const All = Template.bind({});
