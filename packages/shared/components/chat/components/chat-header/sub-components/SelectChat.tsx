import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import SelectSessionReactSvg from "PUBLIC_DIR/images/select.session.react.svg";

import { DropDown } from "../../../../drop-down";
import { DropDownItem } from "../../../../drop-down-item";

import { useMessageStore } from "../../../store/messageStore";
import { SelectChatProps } from "../../../types";
import { getChateTranslationDate } from "../../../utils";

import styles from "../ChatHeader.module.scss";

const SelectChat = ({ isFullScreen, currentDeviceType }: SelectChatProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const {
    selectSession,
    isSelectSessionOpen,
    setIsSelectSessionOpen,
    preparedMessages,
    isRequestRunning,
  } = useMessageStore();

  const { t } = useTranslation(["Common"]);

  const toggleOpen = () => {
    if (isRequestRunning) return;

    if (isFullScreen && currentDeviceType === "desktop") {
      setIsSelectSessionOpen(!isSelectSessionOpen);

      return;
    }

    setIsOpen((value) => !value);
  };

  const onSelectAction = (session: string) => {
    if (isRequestRunning) return;

    selectSession(session);
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.selectChat} onClick={toggleOpen} ref={parentRef}>
        <SelectSessionReactSvg />
      </div>
      {isOpen ? (
        <DropDown
          open={isOpen}
          // isDefaultMode
          zIndex={500}
          clickOutsideAction={() => setIsOpen(false)}
          directionY="bottom"
          directionX="right"
          topSpace={16}
          forwardedRef={parentRef}
          maxHeight={300}
          manualWidth="280px"
          isNoFixedHeightOptions
        >
          {preparedMessages.map(({ title, value, isActive, isDate }) => {
            const currentTitle =
              !isDate || title ? title : getChateTranslationDate(t, value);

            if (!currentTitle) return null;

            return (
              <DropDownItem
                key={value}
                onClick={() => {
                  if (!isDate) onSelectAction(value);
                }}
                className={classNames("drop-down-item", {
                  [styles.dropDownItemDate]: isDate,
                })}
                isActive={isActive}
                noHover={isDate}
              >
                {currentTitle}
              </DropDownItem>
            );
          })}
        </DropDown>
      ) : null}
    </>
  );
};

export default observer(SelectChat);
