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

  const preparedMessages = React.useMemo(() => {
    const messages = Array.from(sessions.keys())
      .reverse()
      .map((value) => {
        const splitedValue = value.split("_");

        return { title: splitedValue[1], value };
      });

    return messages;
  }, [sessions]);

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
        {preparedMessages.map(({ title, value }) => (
          <DropDownItem
            key={value}
            onClick={() => onSelectAction(value)}
            className="drop-down-item"
          >
            {title}
          </DropDownItem>
        ))}
      </DropDown>
    </>
  );
};

export default observer(SelectChat);
