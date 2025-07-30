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

import SendClockReactSvg from "PUBLIC_DIR/images/send.clock.react.svg";
import CatalogSpamReactSvg from "PUBLIC_DIR/images/icons/16/catalog.spam.react.svg";
import { IconSizeType } from "../../../utils";

import { Row } from "../row";
import { RowContent } from "../row-content";
import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Link, LinkType } from "../../link";

import { RowContainer } from ".";

import { RowContainerProps } from "./RowContainer.types";
import { globalColors } from "../../../themes";

import styles from "./RowContainer.stories.module.scss";

const fakeNames = [
  "Ella Green",
  "Kenneth Sandoval",
  "Charles Douglas",
  "Shirley Hall",
  "Donna Thompson",
  "Brenda Carter",
  "Janet Scott",
  "Gina Atkins",
  "Lillie Taylor",
  "Robert Ferguson",
  "Ralph Fields",
  "Richard Williams",
  "Eric Hawkins",
  "Michael Mills",
  "Matthew Simpson",
  "Judy Owen",
  "Miguel Morrison",
  "Jacob Knight",
  "Holly Walker",
  "Albert Clark",
];

const getRndString = (n: number) =>
  Math.random()
    .toString(36)
    .substring(2, n + 2);

const getRndNumber = (a: number, b: number) =>
  Math.floor(Math.random() * (b - a)) + a;

const getRndBool = () => Math.random() >= 0.5;

const fillFakeData = (n: number) => {
  const data = [];

  for (let i = 0; i < n; i += 1) {
    data.push({
      id: getRndString(6),
      userName: fakeNames[i],
      avatar: "",
      role: getRndBool()
        ? AvatarRole.user
        : getRndBool()
          ? AvatarRole.guest
          : getRndBool()
            ? AvatarRole.admin
            : AvatarRole.owner,
      status: getRndBool() ? "normal" : getRndBool() ? "disabled" : "pending",
      isHead: getRndBool(),
      department: getRndBool() ? "Demo department" : "",
      mobilePhone: `+${getRndNumber(10000000000, 99999999999)}`,
      email: `${getRndString(12)}@yahoo.com`,
      contextOptions: [
        { key: 1, label: "Profile" },
        { key: 2, label: "Room list" },
        { key: 3, label: "Change name" },
        { key: 4, label: "Change email" },
      ],
    });
  }

  return data;
};

const fakeData = fillFakeData(20);

const meta = {
  title: "Components/RowContainer",
  component: RowContainer,
  // subcomponents: { Row, RowContent },
  parameters: {
    docs: { description: { component: "Container for Row component" } },
  },
} satisfies Meta<typeof RowContainer>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = (args: RowContainerProps) => {
  return (
    <RowContainer
      {...args}
      manualHeight="500px"
      style={{ width: "95%", padding: "0px 10px" }}
    >
      {fakeData.map((user) => {
        const element = (
          <Avatar
            size={AvatarSize.min}
            role={user.role}
            userName={user.userName}
            source={user.avatar}
          />
        );
        const nameColor = user.status === "pending" && globalColors.gray;
        const sideInfoColor =
          user.status === "pending"
            ? globalColors.grayStrong
            : globalColors.gray;

        return (
          <Row
            key={user.id}
            // status={user.status}
            checked={false}
            data={user}
            element={element}
            contextOptions={user.contextOptions}
            onRowClick={() => {}}
            isIndexEditingMode={false}
            onChangeIndex={() => {}}
          >
            <RowContent>
              <Link
                type={LinkType.page}
                title={user.userName}
                isBold
                fontSize="15px"
                color={nameColor || ""}
              >
                {user.userName}
              </Link>
              <>
                {user.status === "pending" ? (
                  <SendClockReactSvg
                    className={styles.sendClockIcon}
                    data-size={IconSizeType.small}
                    color={globalColors.lightIcons}
                  />
                ) : null}
                {user.status === "disabled" ? (
                  <CatalogSpamReactSvg
                    className={styles.catalogSpamIcon}
                    data-size={IconSizeType.small}
                    color={globalColors.lightIcons}
                  />
                ) : null}
              </>
              {user.isHead ? (
                <Link
                  // containerWidth="120px"
                  type={LinkType.page}
                  title="Head of department"
                  fontSize="12px"
                  color={sideInfoColor}
                >
                  Head of department
                </Link>
              ) : (
                <div />
              )}
              <Link
                // containerWidth="160px"
                type={LinkType.action}
                title={user.department}
                fontSize="12px"
                color={sideInfoColor}
              >
                {user.department}
              </Link>
              <Link
                type={LinkType.page}
                title={user.mobilePhone}
                fontSize="12px"
                color={sideInfoColor}
              >
                {user.mobilePhone}
              </Link>
              <Link
                // containerWidth="180px"
                type={LinkType.page}
                title={user.email}
                fontSize="12px"
                color={sideInfoColor}
              >
                {user.email}
              </Link>
            </RowContent>
          </Row>
        );
      })}
    </RowContainer>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    useReactWindow: false,
    itemCount: 20,
    itemHeight: 50,
    children: fakeData.map(() => <div key={getRndString(10)}>13</div>),
    onScroll: () => {},
    filesLength: 20,
    hasMoreFiles: false,
    fetchMoreFiles: async () => {},
  },
};
