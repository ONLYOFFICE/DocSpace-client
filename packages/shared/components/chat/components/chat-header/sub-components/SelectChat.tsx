import React from "react";
import { observer } from "mobx-react";

import SelectSessionReactSvg from "PUBLIC_DIR/images/select.session.react.svg";

import { DropDown } from "../../../../drop-down";
import { DropDownItem } from "../../../../drop-down-item";

import { useMessageStore } from "../../../store/messageStore";

import styles from "../ChatHeader.module.scss";

const SelectChat = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const { sessions, selectSession } = useMessageStore();

  const toggleOpen = () => setIsOpen((value) => !value);

  const onSelectAction = (session: string) => {
    selectSession(session);
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.selectChat} onClick={toggleOpen} ref={parentRef}>
        <SelectSessionReactSvg />
      </div>
      <DropDown
        open={isOpen}
        isDefaultMode
        zIndex={500}
        clickOutsideAction={() => setIsOpen(false)}
        directionY="bottom"
        directionX="right"
        topSpace={16}
        forwardedRef={parentRef}
      >
        {Array.from(sessions.keys())
          .reverse()
          .map((session) => (
            <DropDownItem
              key={session}
              onClick={() => onSelectAction(session)}
              className="drop-down-item"
            >
              {session}
            </DropDownItem>
          ))}
      </DropDown>
    </>
  );
};

export default observer(SelectChat);
