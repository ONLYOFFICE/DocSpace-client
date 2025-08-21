import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import classNames from "classnames";

import { Portal } from ".";
import styles from "./Portal.module.scss";

interface PortalProps {
  element: React.ReactNode;
  visible?: boolean;
  appendTo?: HTMLElement | null;
}

export default {
  title: "Base UI Components/Portal",
  component: Portal,
  parameters: {
    docs: {
      description: {
        component:
          "Portal component allows rendering children into a DOM node that exists outside the DOM hierarchy of the parent component.",
      },
    },
  },
} as Meta;

const Template: StoryFn<PortalProps> = (args) => {
  return (
    <div>
      <h3>Content outside portal</h3>
      <Portal {...args} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  element: (
    <div className={styles.popup}>This content is rendered in a portal</div>
  ),
  visible: true,
};
Default.parameters = {
  docs: {
    description: {
      story:
        "Basic usage of Portal component rendering content to document.body",
    },
  },
};

export const CustomContainer: StoryFn<PortalProps> = () => {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  return (
    <div>
      <h3>Main content</h3>
      <div
        className={styles.customContainer}
        ref={(node) => {
          setContainer(node);
        }}
      >
        <p>Custom container (portal target)</p>
        <Portal
          element={
            <div>This content is rendered inside the custom container</div>
          }
          appendTo={container}
        />
      </div>
    </div>
  );
};
CustomContainer.parameters = {
  docs: {
    description: {
      story:
        "Portal rendering content to a custom container instead of document.body",
    },
  },
};

export const MultiplePortals: StoryFn<PortalProps> = () => (
  <div>
    <h3>Multiple portals example</h3>
    <Portal
      element={
        <div className={classNames(styles.popup, styles.blue, styles.top30)}>
          First Portal
        </div>
      }
    />
    <Portal
      element={
        <div className={classNames(styles.popup, styles.purple, styles.top50)}>
          Second Portal
        </div>
      }
    />
    <Portal
      element={
        <div className={classNames(styles.popup, styles.green, styles.top70)}>
          Third Portal
        </div>
      }
    />
  </div>
);
MultiplePortals.parameters = {
  docs: {
    description: {
      story:
        "Example showing multiple portals rendering different content simultaneously",
    },
  },
};
