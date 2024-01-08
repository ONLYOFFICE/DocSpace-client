import { useRef } from "react";
import Row from "@docspace/components/row";
import SessionsRowContent from "./SessionsRowContent";
import Avatar from "@docspace/components/avatar";
import Checkbox from "@docspace/components/checkbox";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

const SessionsRow = (props) => {
  const {
    t,
    sectionWidth,
    avatar,
    displayName,
    status,
    browser,
    platform,
    country,
    city,
    ip,
    data,
    isChecked,
    toggleSession,
  } = props;
  const contextOptions = [
    {
      key: "ViewSessions",
      label: t("Settings:ViewSessions"),
      icon: HistoryFinalizedReactSvgUrl,
      onClick: () => console.log("view session"),
    },
    {
      key: "LogoutAllSessions",
      label: t("Settings:LogoutAllSessions"),
      icon: RemoveSvgUrl,
      onClick: () => console.log("logout session"),
    },
    {
      key: "Separator",
      isSeparator: true,
    },
    {
      key: "Disable",
      label: t("Common:DisableUserButton"),
      icon: TrashReactSvgUrl,
      onClick: () => console.log("disable"),
    },
  ];

  const rowRef = useRef();

  const handleSessionToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    rowRef.current?.contains(e.target) || toggleSession(e);
  };

  return (
    <Row
      key={data.id}
      data={data}
      sectionWidth={sectionWidth}
      contextButton
      contextOptions={contextOptions}
      checked={isChecked}
      onClick={handleSessionToggle}
      onSelect={handleSessionToggle}
      contextButtonSpacerWidth="0"
    >
      <SessionsRowContent
        avatar={avatar}
        displayName={displayName}
        status={status}
        browser={browser}
        platform={platform}
        country={country}
        city={city}
        ip={ip}
        rowRef={rowRef}
      />
    </Row>
  );
};

export default SessionsRow;
