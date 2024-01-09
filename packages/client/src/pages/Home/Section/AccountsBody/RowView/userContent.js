import React from "react";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import RowContent from "@docspace/components/row-content";
import Link from "@docspace/components/link";
import { getSpaceQuotaAsText } from "@docspace/common/utils";

import Badges from "../Badges";
import { tablet, mobile } from "@docspace/components/utils/device";

const StyledRowContent = styled(RowContent)`
  @media ${tablet} {
    .row-main-container-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      max-width: inherit;
    }

    .badges {
      flex-direction: row-reverse;
      margin-top: 9px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 12px;
            `
          : css`
              margin-right: 12px;
            `}

      .paid-badge {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-right: 8px;
                margin-left: 0px;
              `
            : css`
                margin-left: 8px;
                margin-right: 0px;
              `}
      }
    }
  }

  @media ${mobile} {
    .row-main-container-wrapper {
      justify-content: flex-start;
    }

    .badges {
      margin-top: 0px;
      gap: 8px;

      .paid-badge {
        margin: 0px;
      }
    }
  }
`;

const UserContent = ({
  item,
  sectionWidth,

  t,
  theme,
  standalone,

  isDefaultUsersQuotaSet,
  showStorageInfo,
}) => {
  const {
    displayName,
    email,
    statusType,
    role,
    isVisitor,
    isCollaborator,
    isSSO,
    usedSpace,
    quotaLimit,
  } = item;

  const nameColor =
    statusType === "pending" || statusType === "disabled"
      ? theme.peopleTableRow.pendingNameColor
      : theme.peopleTableRow.nameColor;
  const sideInfoColor = theme.peopleTableRow.pendingSideInfoColor;

  const roleLabel =
    role === "owner"
      ? t("Common:Owner")
      : role === "admin"
      ? t("Common:DocSpaceAdmin")
      : isCollaborator
      ? t("Common:PowerUser")
      : isVisitor
      ? t("Common:User")
      : t("Common:RoomAdmin");

  const isPaidUser = !standalone && !isVisitor;
  const spaceQuota = getSpaceQuotaAsText(
    t,
    usedSpace,
    quotaLimit,
    isDefaultUsersQuotaSet
  );

  return (
    <StyledRowContent
      sideColor={sideInfoColor}
      sectionWidth={sectionWidth}
      nameColor={nameColor}
      sideInfoColor={sideInfoColor}
    >
      <Link
        containerWidth="28%"
        type="page"
        title={displayName}
        fontWeight={600}
        fontSize="15px"
        color={nameColor}
        isTextOverflow={true}
        noHover
      >
        {statusType === "pending"
          ? email
          : displayName?.trim()
          ? displayName
          : email}
      </Link>

      <Badges statusType={statusType} isPaid={isPaidUser} isSSO={isSSO} />

      <Link
        containerMinWidth="140px"
        containerWidth="17%"
        type="page"
        title={email}
        fontSize="12px"
        fontWeight={400}
        color={sideInfoColor}
        isTextOverflow={true}
      >
        {roleLabel}
      </Link>
      <Link
        containerMinWidth="140px"
        containerWidth="17%"
        type="page"
        title={email}
        fontSize="12px"
        fontWeight={400}
        color={sideInfoColor}
        isTextOverflow={true}
      >
        {email}
      </Link>

      {showStorageInfo && (
        <Link
          containerMinWidth="140px"
          containerWidth="17%"
          type="page"
          fontSize="12px"
          fontWeight={400}
          color={sideInfoColor}
          isTextOverflow={true}
        >
          {spaceQuota}
        </Link>
      )}
    </StyledRowContent>
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { isDefaultUsersQuotaSet, showStorageInfo } = currentQuotaStore;
  return {
    isDefaultUsersQuotaSet,
    showStorageInfo,
  };
})(withTranslation(["People", "Common"])(observer(UserContent)));
