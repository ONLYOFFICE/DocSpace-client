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

import React, { createRef } from "react";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { format } from "react-string-format";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { TextInput } from "@docspace/shared/components/text-input";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { showLoader, hideLoader } from "@docspace/shared/utils/common";
import { mobile } from "@docspace/shared/utils";
import styled from "styled-components";

const StyledBox = styled.div`
  box-sizing: border-box;
  padding: 20px 0 8px;
  @media ${mobile} {
    padding-top: 0;
  }
`;

const maxLength = {
  json: Infinity,
};

const defaultMaxLength = 255;

class ConsumerModalDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    const required = createRef();
    required.current = [];
    this.requiredRef = required.current;

    const { selectedConsumer, t, theme, feedbackAndSupportUrl } = this.props;

    this.consumerInstruction =
      selectedConsumer.instruction &&
      format(
        selectedConsumer.instruction,
        <div style={{ boxSizing: "border-box", margin: 0 }} />,
      );

    this.helpCenterDescription = (
      <Trans t={t} i18nKey="ThirdPartyBodyDescription" ns="Settings">
        Detailed instructions in our{" "}
        <Link
          id="help-center-link"
          color={theme.client.settings.integration.linkColor}
          isHovered={false}
          target="_blank"
          href={this.thirdPartyServicesUrl()}
          dataTestId="dialog_help_center_link"
        >
          Help Center
        </Link>
      </Trans>
    );

    this.supportTeamDescription = (
      <StyledBox>
        <Trans t={t} i18nKey="ThirdPartyBottomDescription" ns="Settings">
          If you still have some questions on how to connect this service or
          need technical assistance, please feel free to contact our{" "}
          <Link
            id="support-team-link"
            color={theme.client.settings.integration.linkColor}
            isHovered={false}
            target="_blank"
            href={feedbackAndSupportUrl}
            dataTestId="dialog_support_team_link"
          >
            Support Team
          </Link>
        </Trans>
      </StyledBox>
    );

    this.description =
      feedbackAndSupportUrl && this.thirdPartyServicesUrl() ? (
        <>
          <Text as="div">{this.supportTeamDescription}</Text>
          <Text as="div">{this.helpCenterDescription}</Text>
        </>
      ) : !feedbackAndSupportUrl && this.thirdPartyServicesUrl() ? (
        <Text as="div">
          <StyledBox>{this.helpCenterDescription}</StyledBox>
        </Text>
      ) : feedbackAndSupportUrl && !this.thirdPartyServicesUrl() ? (
        <Text as="div">{this.supportTeamDescription}</Text>
      ) : null;
  }

  componentDidMount() {
    this.mapTokenNameToState();
  }

  onChangeHandler = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  updateConsumerValues = () => {
    const {
      onChangeLoading,
      selectedConsumer,
      updateConsumerProps,
      onModalClose,
      t,
    } = this.props;
    const { state } = this;

    onChangeLoading(true);
    showLoader();
    const prop = [];

    let i = 0;
    const stateLength = Object.keys(state).length;
    for (i = 0; i < stateLength; i++) {
      prop.push({
        name: Object.keys(state)[i],
        value: Object.values(state)[i],
      });
    }
    const data = {
      name: selectedConsumer.name,
      props: prop,
    };
    updateConsumerProps(data)
      .then(() => {
        onChangeLoading(false);
        hideLoader();
        toastr.success(t("ThirdPartyPropsActivated"));

        const channel = new BroadcastChannel("thirdpartyActivation");
        channel.postMessage(true);
      })
      .catch((error) => {
        onChangeLoading(false);
        hideLoader();
        toastr.error(error);
      })
      .finally(onModalClose());
  };

  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log("this.state: ", this.state, "nextState: ", nextState);
  //   return nextState !== this.state;
  // }

  mapTokenNameToState = () => {
    const { selectedConsumer } = this.props;
    selectedConsumer.props?.forEach((prop) => {
      this.requiredRef.push(prop.name);

      this.setState({
        [`${prop.name}`]: prop.value,
      });
    });
  };

  thirdPartyServicesUrl = () => {
    const {
      selectedConsumer,
      portalSettingsUrl,
      docuSignUrl,
      dropboxUrl,
      boxUrl,
      mailRuUrl,
      oneDriveUrl,
      microsoftUrl,
      googleUrl,
      facebookUrl,
      linkedinUrl,
      clickatellUrl,
      smsclUrl,
      firebaseUrl,
      appleIDUrl,
      weixinUrl,
      telegramUrl,
      wordpressUrl,
      awsUrl,
      googleCloudUrl,
      rackspaceUrl,
      selectelUrl,
      yandexUrl,
      vkUrl,
    } = this.props;
    switch (selectedConsumer.name) {
      case "docusign":
      case "docuSign":
        return docuSignUrl;
      case "dropbox":
        return dropboxUrl;
      case "box":
        return boxUrl;
      case "mailru":
        return mailRuUrl;
      case "skydrive":
        return oneDriveUrl;
      case "microsoft":
        return microsoftUrl;
      case "google":
        return googleUrl;
      case "facebook":
        return facebookUrl;
      case "linkedin":
        return linkedinUrl;
      case "clickatell":
        return clickatellUrl;
      case "smsc":
        return smsclUrl;
      case "firebase":
        return firebaseUrl;
      case "appleID":
        return appleIDUrl;
      case "weixin":
        return weixinUrl;
      case "telegram":
        return telegramUrl;
      case "wordpress":
        return wordpressUrl;
      case "s3":
        return awsUrl;
      case "googlecloud":
        return googleCloudUrl;
      case "rackspace":
        return rackspaceUrl;
      case "selectel":
        return selectelUrl;
      case "yandex":
        return yandexUrl;
      case "vk":
        return vkUrl;
      default:
        return portalSettingsUrl;
    }
  };

  inputsRender = (item, index) => {
    const { onChangeHandler, state, props } = this;
    const { selectedConsumer, isLoading } = props;

    return (
      <React.Fragment key={item.name}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin:
              selectedConsumer.props.length == index + 1 ? "0" : "0 0 16px 0",
          }}
        >
          <div style={{ margin: "0 0 4px 0" }}>
            <Text isBold>{item.title}:</Text>
          </div>
          <div>
            <TextInput
              scale
              id={item.name}
              name={item.name}
              placeholder={item.title}
              isAutoFocussed={index === 0}
              tabIndex={1}
              value={Object.values(state)[index]}
              isDisabled={isLoading}
              onChange={onChangeHandler}
              maxLength={maxLength[item.name] ?? defaultMaxLength}
              testId={`${item.name}_input`}
            />
          </div>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { selectedConsumer, onModalClose, dialogVisible, isLoading, t } =
      this.props;
    const {
      state,
      updateConsumerValues,
      consumerInstruction,
      requiredRef,
      description,
    } = this;

    const isDisabled = requiredRef.some((name) => state[name].trim() === "");

    return (
      <ModalDialog
        visible={dialogVisible}
        onClose={onModalClose}
        displayType="aside"
        withBodyScroll
      >
        <ModalDialog.Header>{selectedConsumer.title}</ModalDialog.Header>
        <ModalDialog.Body>
          <div style={{ padding: "16px 0 16px" }}>{consumerInstruction}</div>
          <>
            {selectedConsumer.props?.map((prop, i) =>
              this.inputsRender(prop, i),
            )}
          </>
          {description}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            primary
            size="normal"
            id="enable-button"
            label={isLoading ? t("Common:Sending") : t("Common:Enable")}
            isLoading={isLoading}
            isDisabled={isLoading || isDisabled}
            scale
            onClick={updateConsumerValues}
            testId="consumer_dialog_enable_button"
          />
          <Button
            size="normal"
            scale
            id="cancel-button"
            label={t("Common:CancelButton")}
            isLoading={isLoading}
            isDisabled={isLoading}
            onClick={onModalClose}
            testId="consumer_dialog_cancel_button"
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

ConsumerModalDialog.propTypes = {
  t: PropTypes.func.isRequired,
  selectedConsumer: PropTypes.object,
  onModalClose: PropTypes.func.isRequired,
  dialogVisible: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChangeLoading: PropTypes.func.isRequired,
  updateConsumerProps: PropTypes.func.isRequired,
  feedbackAndSupportUrl: PropTypes.string,
};

export default inject(({ setup, settingsStore }) => {
  const {
    theme,
    feedbackAndSupportUrl,
    portalSettingsUrl,
    docuSignUrl,
    dropboxUrl,
    boxUrl,
    mailRuUrl,
    oneDriveUrl,
    microsoftUrl,
    googleUrl,
    facebookUrl,
    linkedinUrl,
    clickatellUrl,
    smsclUrl,
    firebaseUrl,
    appleIDUrl,
    weixinUrl,
    telegramUrl,
    wordpressUrl,
    awsUrl,
    googleCloudUrl,
    rackspaceUrl,
    selectelUrl,
    yandexUrl,
    vkUrl,
  } = settingsStore;
  const { integration } = setup;
  const { selectedConsumer } = integration;

  return {
    theme,
    selectedConsumer,
    feedbackAndSupportUrl,
    portalSettingsUrl,
    docuSignUrl,
    dropboxUrl,
    boxUrl,
    mailRuUrl,
    oneDriveUrl,
    microsoftUrl,
    googleUrl,
    facebookUrl,
    linkedinUrl,
    clickatellUrl,
    smsclUrl,
    firebaseUrl,
    appleIDUrl,
    weixinUrl,
    telegramUrl,
    wordpressUrl,
    awsUrl,
    googleCloudUrl,
    rackspaceUrl,
    selectelUrl,
    yandexUrl,
    vkUrl,
  };
})(observer(ConsumerModalDialog));
