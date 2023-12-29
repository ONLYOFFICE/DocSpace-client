import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import styled from "styled-components";

import SendClockReactSvg from "PUBLIC_DIR/images/send.clock.react.svg";
import CatalogSpamReactSvg from "PUBLIC_DIR/images/catalog.spam.react.svg";
import { IconSizeType, commonIconsStyles } from "../../utils";

import { Row } from "../row";
import { RowContent } from "../row-content";
import { Avatar, AvatarRole, AvatarSize } from "../avatar";
import { Link, LinkType } from "../link";

import { RowContainer } from "./RowContainer";

import { RowContainerProps } from "./RowContainer.types";

const SendClockIcon = styled(SendClockReactSvg)`
  ${commonIconsStyles}
`;

const CatalogSpamIcon = styled(CatalogSpamReactSvg)`
  ${commonIconsStyles}
`;

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
        const nameColor = user.status === "pending" && "#A3A9AE";
        const sideInfoColor = user.status === "pending" ? "#D0D5DA" : "#A3A9AE";

        return (
          <Row
            key={user.id}
            // status={user.status}
            checked={false}
            data={user}
            element={element}
            contextOptions={user.contextOptions}
            onRowClick={() => {}}
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
                {user.status === "pending" && (
                  <SendClockIcon size={IconSizeType.small} color="#3B72A7" />
                )}
                {user.status === "disabled" && (
                  <CatalogSpamIcon size={IconSizeType.small} color="#3B72A7" />
                )}
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
