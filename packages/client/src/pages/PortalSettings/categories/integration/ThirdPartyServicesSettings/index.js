// (c) Copyright Ascensio System SIA 2009-2024
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

import IntegrationSvgUrl from "PUBLIC_DIR/images/integration.svg?url";
import IntegrationDarkSvgUrl from "PUBLIC_DIR/images/integration.dark.svg?url";

import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { showLoader, hideLoader } from "@docspace/shared/utils/loader";

import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { Badge } from "@docspace/shared/components/badge";
import { toastr } from "@docspace/shared/components/toast";
import { Button } from "@docspace/shared/components/button";
import { isMobile } from "@docspace/shared/utils";
import { globalColors } from "@docspace/shared/themes";

import ConsumerItem from "./sub-components/consumerItem";
import ConsumerModalDialog from "./sub-components/consumerModalDialog";

import ThirdPartyLoader from "./sub-components/thirdPartyLoader";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const RootContainer = styled(Box)`
  max-width: 700px;
  width: 100%;

  .third-party-link {
    font-weight: 600;
  }

  .third-party-description {
    line-height: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .paid-badge {
    cursor: auto;
  }

  .consumers-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(293px, 1fr));
    gap: 20px;
  }

  .consumer-item-wrapper {
    border: ${(props) =>
      props.theme.client.settings.integration.separatorBorder};

    border-radius: 6px;
    min-height: 116px;
    padding-block: 12px 8px;
    padding-inline: 20px 12px;
  }

  .request-block {
    margin-bottom: 20px;
    padding: 46px;
    display: flex;
    gap: 24px;
    align-items: center;

    @media (max-width: 882px) {
      flex-direction: column;
      align-items: baseline;
    }
  }

  .business-plan {
    grid-column: 1 / -1;
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: -4px;

    .paid-badge {
      cursor: auto;
    }
  }
`;

class ThirdPartyServices extends React.Component {
  constructor(props) {
    super(props);
    const { t, tReady } = props;

    if (tReady) setDocumentTitle(`${t("ThirdPartyAuthorization")}`);

    this.state = {
      dialogVisible: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    const { getConsumers, fetchAndSetConsumers } = this.props;
    showLoader();
    const urlParts = window.location.href.split("?");
    if (urlParts.length > 1) {
      const queryValue = urlParts[1].split("=")[1];
      fetchAndSetConsumers(queryValue)
        .then((isConsumerExist) => isConsumerExist && this.onModalOpen())
        .finally(() => hideLoader());
    } else {
      getConsumers().finally(() => hideLoader());
    }
  }

  componentDidUpdate(prevProps) {
    const { t, tReady } = this.props;
    if (prevProps.tReady !== tReady && tReady)
      setDocumentTitle(t("ThirdPartyAuthorization"));
  }

  onChangeLoading = (status) => {
    this.setState({
      isLoading: status,
    });
  };

  onModalOpen = () => {
    this.setState({
      dialogVisible: true,
    });
  };

  onModalClose = () => {
    this.setState({
      dialogVisible: false,
    });
    this.props.setSelectedConsumer();
  };

  setConsumer = (e) => {
    this.props.setSelectedConsumer(e.currentTarget.dataset.consumer);
  };

  updateConsumerValues = (obj, isFill) => {
    isFill && this.onChangeLoading(true);

    const prop = [];
    let i = 0;
    let objLength = Object.keys(isFill ? obj : obj.props).length;

    for (i = 0; i < objLength; i++) {
      prop.push({
        name: isFill ? Object.keys(obj)[i] : obj.props[i].name,
        value: isFill ? Object.values(obj)[i] : "",
      });
    }

    const data = {
      name: isFill ? this.state.selectedConsumer : obj.name,
      props: prop,
    };

    this.props
      .updateConsumerProps(data)
      .then(() => {
        isFill && this.onChangeLoading(false);
        isFill
          ? toastr.success(this.props.t("ThirdPartyPropsActivated"))
          : toastr.success(this.props.t("ThirdPartyPropsDeactivated"));
      })
      .catch((error) => {
        isFill && this.onChangeLoading(false);
        toastr.error(error);
      })

      .finally(isFill && this.onModalClose());
  };

  render() {
    const {
      t,
      i18n,
      consumers,
      updateConsumerProps,
      integrationSettingsUrl,
      theme,
      currentColorScheme,
      isThirdPartyAvailable,
    } = this.props;
    const { dialogVisible, isLoading } = this.state;
    const { onModalClose, onModalOpen, setConsumer, onChangeLoading } = this;

    const freeConsumers = consumers.filter(
      (consumer) => consumer.canSet === false,
    );
    const paidConsumers = consumers.filter(
      (consumer) => !freeConsumers.includes(consumer),
    );

    const imgSrc = theme.isBase ? IntegrationSvgUrl : IntegrationDarkSvgUrl;

    const submitRequest = () =>
      (window.location = `mailto:${this.props.supportEmail}`);

    return (
      <>
        <RootContainer className="RootContainer">
          <Text className="third-party-description">
            {t("ThirdPartyTitleDescription")}
          </Text>
          <Box marginProp="8px 0 20px 0">
            <Link
              className="third-party-link"
              color={currentColorScheme.main?.accent}
              isHovered
              target="_blank"
              href={integrationSettingsUrl}
            >
              {t("Common:LearnMore")}
            </Link>
          </Box>
          <Box className="consumer-item-wrapper request-block">
            <img
              className="integration-image"
              src={imgSrc}
              alt="integration_icon"
            />
            <Text>
              {t("IntegrationRequest", {
                productName: t("Common:ProductName"),
                organizationName: t("Common:OrganizationName"),
              })}
            </Text>
            <Button
              label={t("Submit")}
              primary
              size="normal"
              minWidth="138px"
              onClick={submitRequest}
              scale={isMobile()}
            />
          </Box>
          {!consumers.length ? (
            <ThirdPartyLoader />
          ) : (
            <div className="consumers-list-container">
              {freeConsumers.map((consumer) => (
                <Box className="consumer-item-wrapper" key={consumer.name}>
                  <ConsumerItem
                    consumer={consumer}
                    dialogVisible={dialogVisible}
                    isLoading={isLoading}
                    onChangeLoading={onChangeLoading}
                    onModalClose={onModalClose}
                    onModalOpen={onModalOpen}
                    setConsumer={setConsumer}
                    updateConsumerProps={updateConsumerProps}
                    t={t}
                    isThirdPartyAvailable={isThirdPartyAvailable}
                  />
                </Box>
              ))}
              {!isThirdPartyAvailable && (
                <div className="business-plan">
                  <Text fontSize="16px" fontWeight={700}>
                    {t("IncludedInBusiness")}
                  </Text>
                  <Badge
                    className="paid-badge"
                    backgroundColor={
                      theme.isBase
                        ? globalColors.favoritesStatus
                        : globalColors.favoriteStatusDark
                    }
                    fontWeight="700"
                    label={t("Common:Paid")}
                    isPaidBadge={true}
                  />
                </div>
              )}
              {paidConsumers.map((consumer) => (
                <Box className="consumer-item-wrapper" key={consumer.name}>
                  <ConsumerItem
                    consumer={consumer}
                    dialogVisible={dialogVisible}
                    isLoading={isLoading}
                    onChangeLoading={onChangeLoading}
                    onModalClose={onModalClose}
                    onModalOpen={onModalOpen}
                    setConsumer={setConsumer}
                    updateConsumerProps={updateConsumerProps}
                    t={t}
                    isThirdPartyAvailable={isThirdPartyAvailable}
                  />
                </Box>
              ))}
            </div>
          )}
        </RootContainer>
        {dialogVisible && (
          <ConsumerModalDialog
            t={t}
            i18n={i18n}
            dialogVisible={dialogVisible}
            isLoading={isLoading}
            onModalClose={onModalClose}
            onChangeLoading={onChangeLoading}
            updateConsumerProps={updateConsumerProps}
          />
        )}
      </>
    );
  }
}

ThirdPartyServices.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
  consumers: PropTypes.arrayOf(PropTypes.object).isRequired,
  integrationSettingsUrl: PropTypes.string,
  getConsumers: PropTypes.func.isRequired,
  updateConsumerProps: PropTypes.func.isRequired,
  setSelectedConsumer: PropTypes.func.isRequired,
};

export default inject(({ setup, settingsStore, currentQuotaStore }) => {
  const {
    integrationSettingsUrl,
    theme,
    currentColorScheme,
    companyInfoSettingsData,
  } = settingsStore;
  const {
    getConsumers,
    integration,
    updateConsumerProps,
    setSelectedConsumer,
    fetchAndSetConsumers,
  } = setup;
  const { consumers } = integration;
  const { isThirdPartyAvailable } = currentQuotaStore;

  return {
    theme,
    consumers,
    integrationSettingsUrl,
    getConsumers,
    updateConsumerProps,
    setSelectedConsumer,
    fetchAndSetConsumers,
    currentColorScheme,
    isThirdPartyAvailable,
    supportEmail: companyInfoSettingsData?.email,
  };
})(withTranslation(["Settings", "Common"])(observer(ThirdPartyServices)));
