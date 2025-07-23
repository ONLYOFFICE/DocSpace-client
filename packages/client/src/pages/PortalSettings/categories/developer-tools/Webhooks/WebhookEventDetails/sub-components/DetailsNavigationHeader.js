// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled from "styled-components";
import { observer } from "mobx-react";

import { retryWebhook } from "@docspace/shared/api/settings";

import { toastr } from "@docspace/shared/components/toast";

import { useNavigate, useParams, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import RetryIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import { Heading } from "@docspace/shared/components/heading";
import { IconButton } from "@docspace/shared/components/icon-button";

import { tablet, mobile } from "@docspace/shared/utils";
import { zIndex } from "@docspace/shared/themes";

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background-color: ${(props) => props.theme.backgroundColor};
  z-index: ${zIndex.sticky};
  display: flex;
  align-items: center;
  max-width: calc(100vw - 32px);
  min-height: 69px;

  @media ${tablet} {
    margin-top: -5px;
    margin-bottom: 5px;
  }
  @media ${mobile} {
    margin-top: 0;
    justify-content: space-between;
  }

  .headerNavigation {
    display: flex;
    align-items: center;
  }

  .arrow-button {
    margin-inline-end: 18.5px;

    @media ${tablet} {
      padding-block: 8px;
      padding-inline: 8px 0;

      margin-inline-start: -8px;
    }
    @media ${mobile} {
      margin-inline-end: 13px;
    }

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }
  }

  .headline {
    font-size: 18px;
    margin-inline-end: 16px;

    @media ${tablet} {
      font-size: 21px;
    }

    @media ${mobile} {
      font-size: 18px;
    }
  }
`;

const DetailsNavigationHeader = () => {
  const { id, eventId } = useParams();

  const { t } = useTranslation(["Webhooks", "Common"]);
  const navigate = useNavigate();
  const location = useLocation();

  const onBack = () => {
    const path = location.pathname.includes("/portal-settings")
      ? "/portal-settings"
      : "";
    navigate(`${path}/developer-tools/webhooks/${id}`);
  };

  const handleRetryEvent = async () => {
    await retryWebhook(eventId);
    toastr.success(t("WebhookRedilivered"), <b>{t("Common:Done")}</b>);
  };

  return (
    <HeaderContainer>
      <div className="headerNavigation">
        <IconButton
          iconName={ArrowPathReactSvgUrl}
          size="17"
          isFill
          onClick={onBack}
          className="arrow-button"
        />
        <Heading type="content" truncate className="headline">
          {t("WebhookDetails")}
        </Heading>
      </div>

      <IconButton
        className="retry"
        iconName={RetryIcon}
        size="17"
        isFill
        onClick={handleRetryEvent}
      />
    </HeaderContainer>
  );
};

export default observer(DetailsNavigationHeader);
