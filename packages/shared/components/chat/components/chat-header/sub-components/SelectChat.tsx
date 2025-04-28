import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import SelectSessionReactSvg from "PUBLIC_DIR/images/select.session.react.svg";

import { DeviceType } from "../../../../../enums";

import { DropDown } from "../../../../drop-down";
import { DropDownItem } from "../../../../drop-down-item";

import { useMessageStore } from "../../../store/messageStore";

import styles from "../ChatHeader.module.scss";

export type SelectChatProps = {
  isFullScreen: boolean;
  isPanel?: boolean;
  currentDeviceType: DeviceType;
};

const SelectChat = ({
  isFullScreen,
  isPanel,
  currentDeviceType,
}: SelectChatProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement>(null);

  console.log(isPanel);

  const {
    selectSession,
    isSelectSessionOpen,
    setIsSelectSessionOpen,

    preparedMessages,
  } = useMessageStore();

  const { t } = useTranslation(["Common"]);

  const toggleOpen = () => {
    console.log("toggle");
    if (isFullScreen && currentDeviceType === "desktop") {
      console.log(isSelectSessionOpen);
      setIsSelectSessionOpen(!isSelectSessionOpen);

      return;
    }

    setIsOpen((value) => !value);
  };

  const onSelectAction = (session: string) => {
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
          isDefaultMode
          zIndex={500}
          clickOutsideAction={() => setIsOpen(false)}
          directionY="bottom"
          directionX="right"
          topSpace={16}
          forwardedRef={parentRef}
        >
          {preparedMessages.map(({ title, value, isActive, isDate }) => {
            const currentTitle =
              !isDate || title
                ? title
                : value === "today"
                  ? t("Common:Today")
                  : value === "yesterday"
                    ? t("Common:Yesterday")
                    : "";

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
