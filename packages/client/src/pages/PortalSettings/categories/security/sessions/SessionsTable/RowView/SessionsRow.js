import Row from "@docspace/components/row";
import SessionsRowContent from "./SessionsRowContent";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

const SessionsRow = (props) => {
  const {
    t,
    data,
    sectionWidth,
    avatar,
    displayName,
    status,
    browser,
    platform,
    country,
    city,
    ip,
    userId,
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

  return (
    <Row
      key={data.id}
      data={data}
      sectionWidth={sectionWidth}
      checkbox
      contextButton
      contextOptions={contextOptions}
      //   checked={isChecked}
      //   onClick={toggleAccount}
      //   onSelect={toggleAccount}
      //   contextButtonSpacerWidth="0"
    >
      <SessionsRowContent
        userId={userId}
        avatar={avatar}
        displayName={displayName}
        status={status}
        browser={browser}
        platform={platform}
        country={country}
        city={city}
        ip={ip}
      />
    </Row>
  );
};

export default SessionsRow;
