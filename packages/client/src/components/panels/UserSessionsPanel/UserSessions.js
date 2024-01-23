import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/shared/themes";
import { tablet } from "@docspace/shared/utils";
import { Row } from "@docspace/shared/components/row";
import { Avatar } from "@docspace/shared/components/avatar";
import styled, { css } from "styled-components";

import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

const marginStyles = css`
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;

  @media ${tablet} {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const checkedStyle = css`
  background: ${(props) => props.theme.filesSection.rowView.checkedBackground};
  ${marginStyles}
`;

const Wrapper = styled.div`
  padding: 24px 20px;
`;

const UserSessions = (props) => {
  const {
    t,
    data,
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setSessionModalData,
  } = props;

  const contextOptions = [
    {
      key: "LogoutAllSessions",
      label: t("Settings:LogoutAllSessions"),
      icon: RemoveSvgUrl,
      onClick: onClickLogout,
    },
    {
      key: "Separator",
      isSeparator: true,
    },
    {
      key: "Disable",
      label: t("Common:DisableUserButton"),
      icon: TrashReactSvgUrl,
      onClick: onClickDisable,
    },
  ];

  const onClickLogout = () => {
    setLogoutAllDialogVisible(true);
    setSessionModalData({ displayName: data.displayName });
  };

  const onClickDisable = () => {
    setDisableDialogVisible(true);
  };

  console.log(data);

  const element = (
    <Avatar size="large" userName={data.displayName} source={data.avatar} />
  );

  return (
    <Wrapper>
      <Row
        key={data.userId}
        data={data}
        element={element}
        mode={"modern"}
        className={"user-row"}
        withoutBorder
        contextOptions={contextOptions}
      />
    </Wrapper>
  );
};

export default inject(({ setup }) => {
  const {
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setSessionModalData,
    sessionModalData,
  } = setup;

  return {
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setSessionModalData,
    data: sessionModalData,
  };
})(withTranslation(["Settings", "Profile", "Common"])(observer(UserSessions)));
