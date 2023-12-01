import React from "react";
import styled, { css } from "styled-components";

import { withTranslation } from "react-i18next";

import RowContent from "@docspace/components/row-content";
import Link from "@docspace/components/link";

import Badges from "../../Badges";
import { tablet, mobile } from "@docspace/components/utils/device";

const StyledRowContent = styled(RowContent)`
  display: flex;
  align-items: center;

  @media ${tablet} {
    .row-main-container-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      max-width: inherit;
      margin: 0;
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
}) => {
  const { displayName, statusType } = item;

  const nameColor =
    statusType === "pending" || statusType === "disabled"
      ? theme.peopleTableRow.pendingNameColor
      : theme.peopleTableRow.nameColor;
  const sideInfoColor = theme.peopleTableRow.pendingSideInfoColor;

  return (
    <StyledRowContent
      sideColor={sideInfoColor}
      sectionWidth={sectionWidth}
      nameColor={nameColor}
      sideInfoColor={sideInfoColor}
    >
      {[
        <Link
          containerWidth="28%"
          type="page"
          title={displayName}
          fontWeight={600}
          fontSize="15px"
          color={nameColor}
          isTextOverflow={true}
        >
          {item.title}
        </Link>,
      ]}
    </StyledRowContent>
  );
};

export default withTranslation(["People", "Common"])(UserContent);
