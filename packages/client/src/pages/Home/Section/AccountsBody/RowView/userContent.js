import React from "react";
import styled, { css } from "styled-components";

import { withTranslation } from "react-i18next";

import { RowContent } from "@docspace/shared/components/row-content";
import { Link } from "@docspace/shared/components/link";

import Badges from "../Badges";
import { tablet, mobile } from "@docspace/shared/utils";

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
      margin-top: 10px;
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
}) => {
  const {
    displayName,
    email,
    statusType,
    role,
    isVisitor,
    isCollaborator,
    isSSO,
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
    </StyledRowContent>
  );
};

export default withTranslation(["People", "Common"])(UserContent);
