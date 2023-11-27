import React, { useState } from "react";
import ModalDialog from "./index.js";
import Button from "../button";

export default {
  title: "Components/ModalDialog",
  component: ModalDialog,
  parameters: {
    docs: {
      description: {
        component: "ModalDialog is used for displaying modal dialogs",
      },
    },
  },
};

const Template = ({ ...args }) => {
  const [isVisible, setIsVisible] = useState(false);

  const openModal = () => setIsVisible(true);
  const closeModal = () => setIsVisible(false);

  return (
    <>
      // @ts-expect-error TS(2322): Type '{ label: string; primary: boolean; size: str... Remove this comment to see the full error message
      <Button label="Show" primary={true} size="medium" onClick={openModal} />
      <ModalDialog {...args} visible={isVisible} onClose={closeModal}>
        // @ts-expect-error TS(2559): Type '{ children: string; }' has no properties in ... Remove this comment to see the full error message
        <ModalDialog.Header>Change password</ModalDialog.Header>
        // @ts-expect-error TS(2559): Type '{ children: Element; }' has no properties in... Remove this comment to see the full error message
        <ModalDialog.Body>
          <span>
            Send the password change instruction to the{" "}
            <a style={{ color: "#5299E0" }} href="mailto:asc@story.book">
              asc@story.book
            </a>{" "}
            email address
          </span>
        </ModalDialog.Body>
        // @ts-expect-error TS(2559): Type '{ children: Element[]; }' has no properties ... Remove this comment to see the full error message
        <ModalDialog.Footer>
          <Button
            key="SendBtn"
            // @ts-expect-error TS(2322): Type '{ key: string; label: string; primary: boole... Remove this comment to see the full error message
            label="Send"
            primary={true}
            scale
            size="normal"
            onClick={() => {
              closeModal();
            }}
          />
          <Button
            key="CloseBtn"
            // @ts-expect-error TS(2322): Type '{ key: string; label: string; scale: true; s... Remove this comment to see the full error message
            label="Cancel"
            scale
            size="normal"
            onClick={closeModal}
          />
        </ModalDialog.Footer>
        // @ts-expect-error TS(2559): Type '{ children: Element; }' has no properties in... Remove this comment to see the full error message
        <ModalDialog.Container>
          <div style={{ width: "100%", height: "100%", background: "red" }}>
            123
          </div>
        </ModalDialog.Container>
      </ModalDialog>
    </>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ ...args... Remove this comment to see the full error message
Default.args = {
  displayType: "aside",
  displayTypeDetailed: {
    desktop: "aside",
    tablet: "aside",
    mobile: "aside",
  },
};
