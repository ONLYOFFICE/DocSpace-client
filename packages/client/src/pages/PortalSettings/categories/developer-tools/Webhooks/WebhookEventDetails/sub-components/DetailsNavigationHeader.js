import React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { NoBoxShadowToast } from "../../styled-components";
import { toastr } from "@docspace/shared/components/toast";

import { useNavigate } from "react-router-dom";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import RetryIcon from "PUBLIC_DIR/images/refresh.react.svg?url";

import Headline from "@docspace/common/components/Headline";
import { IconButton } from "@docspace/shared/components/icon-button";

import { tablet, mobile } from "@docspace/shared/utils";
import { useTranslation } from "react-i18next";

import { useParams } from "react-router-dom";

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background-color: ${(props) => props.theme.backgroundColor};
  z-index: 310;
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
    font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    margin-inline-end: 16px;

    @media ${tablet} {
      font-size: ${(props) => props.theme.getCorrectFontSize("21px")};
    }

    @media ${mobile} {
      font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    }
  }
`;

const DetailsNavigationHeader = (props) => {
  const { retryWebhookEvent } = props;
  const { eventId } = useParams();

  const { t } = useTranslation(["Webhooks", "Common"]);
  const navigate = useNavigate();
  const onBack = () => {
    navigate(-1);
  };
  const handleRetryEvent = async () => {
    await retryWebhookEvent(eventId);
    toastr.success(t("WebhookRedilivered"), <b>{t("Common:Done")}</b>);
  };

  return (
    <>
      <HeaderContainer>
        <div className="headerNavigation">
          <IconButton
            iconName={ArrowPathReactSvgUrl}
            size="17"
            isFill={true}
            onClick={onBack}
            className="arrow-button"
          />
          <Headline type="content" truncate={true} className="headline">
            {t("WebhookDetails")}
          </Headline>
        </div>

        <IconButton
          className="retry"
          iconName={RetryIcon}
          size="17"
          isFill={true}
          onClick={handleRetryEvent}
        />
      </HeaderContainer>
      <NoBoxShadowToast />
    </>
  );
};

export default inject(({ webhooksStore }) => {
  const { retryWebhookEvent } = webhooksStore;

  return { retryWebhookEvent };
})(observer(DetailsNavigationHeader));
