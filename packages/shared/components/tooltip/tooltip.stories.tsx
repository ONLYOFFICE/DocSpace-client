import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "../link";
import { Text } from "../text";
import { Tooltip } from ".";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description:
        "Custom tooltip. See documentation: https://github.com/wwayne/react-tooltip",
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=649%3A4458&mode=dev",
    },
  },
} satisfies Meta<typeof Tooltip>;
type Story = StoryObj<typeof Tooltip>;

export default meta;

const bodyStyle = { marginTop: 100, marginLeft: 200 };

export const Default: Story = {
  render: (args) => {
    return (
      <div style={{ height: "240px" }}>
        <div style={{ ...bodyStyle, position: "absolute" }}>
          <Link data-tooltip-id="link" data-tooltip-content="Bob Johnston">
            Bob Johnston
          </Link>
        </div>

        <Tooltip
          {...args}
          id="link"
          getContent={({ content }) => (
            <div>
              <Text isBold fontSize="16px">
                {content}
              </Text>

              <Text color="#A3A9AE" fontSize="13px">
                BobJohnston@gmail.com
              </Text>

              <Text fontSize="13px">Developer</Text>
            </div>
          )}
        />
      </div>
    );
  },
  args: { float: true, place: "top" },
};

const arrayUsers = [
  {
    key: "user_1",
    name: "Bob",
    email: "Bob@gmail.com",
    position: "developer",
  },
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
  {
    key: "user_4",
    name: "Alex",
    email: "Alex@gmail.com",
    position: "developer",
  },
  {
    key: "user_5",
    name: "Tomas",
    email: "Tomas@gmail.com",
    position: "developer",
  },
];

export const AllTooltip: Story = {
  render: () => {
    return (
      <div>
        <div>
          <h5 style={{ marginLeft: -5 }}>Hover on me</h5>
          <Link data-tooltip-id="link" data-tooltip-content="Bob Johnston">
            Bob Johnston
          </Link>
        </div>
        <Tooltip id="link" offset={0}>
          <div>
            <Text isBold fontSize="16px">
              Bob Johnston
            </Text>

            <Text color="#A3A9AE" fontSize="13px">
              BobJohnston@gmail.com
            </Text>

            <Text fontSize="13px">Developer</Text>
          </div>
        </Tooltip>

        <div>
          <h5 style={{ marginLeft: -5 }}>Hover group</h5>
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
          <br />
          <Link data-tooltip-id="group" data-tooltip-content={3}>
            Alex
          </Link>
          <br />
          <Link data-tooltip-id="group" data-tooltip-content={4}>
            Tomas
          </Link>
        </div>

        <Tooltip
          id="group"
          getContent={({ content }) =>
            content && typeof content === "number" ? (
              <div>
                <Text isBold fontSize="16px">
                  {arrayUsers[content].name}
                </Text>

                <Text color="#A3A9AE" fontSize="13px">
                  {arrayUsers[content].email}
                </Text>

                <Text fontSize="13px">{arrayUsers[content].position}</Text>
              </div>
            ) : null
          }
        />
      </div>
    );
  },
};
