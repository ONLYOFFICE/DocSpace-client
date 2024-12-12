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

import React, { createRef } from "react";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { format } from "react-string-format";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { TextInput } from "@docspace/shared/components/text-input";
import { Box } from "@docspace/shared/components/box";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { showLoader, hideLoader } from "@docspace/shared/utils/common";
import { mobile } from "@docspace/shared/utils";
import styled from "styled-components";

const StyledBox = styled(Box)`
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
  consumerInstruction =
    this.props.selectedConsumer.instruction &&
    format(this.props.selectedConsumer.instruction, <Box marginProp="0" />);

  helpCenterDescription = (
    <Trans t={this.props.t} i18nKey="ThirdPartyBodyDescription" ns="Settings">
      Detailed instructions in our{" "}
      <Link
        id="help-center-link"
        color={this.props.theme.client.settings.integration.linkColor}
        isHovered={false}
        target="_blank"
        href={this.thirdPartyServicesUrl()}
      >
        Help Center
      </Link>
    </Trans>
  );

  supportTeamDescription = (
    <StyledBox>
      <Trans
        t={this.props.t}
        i18nKey="ThirdPartyBottomDescription"
        ns="Settings"
      >
        If you still have some questions on how to connect this service or need
        technical assistance, please feel free to contact our{" "}
        <Link
          id="support-team-link"
          color={this.props.theme.client.settings.integration.linkColor}
          isHovered={false}
          target="_blank"
          href={this.props.urlSupport}
        >
          Support Team
        </Link>
      </Trans>
    </StyledBox>
  );

  constructor(props) {
    super(props);
    this.state = {};
    const required = createRef();
    required.current = [];
    this.requiredRef = required.current;
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
    selectedConsumer.props.forEach((prop) => {
      this.requiredRef.push(prop.name);

      this.setState({
        [`${prop.name}`]: prop.value,
      });
    });
  };

  thirdPartyServicesUrl = () => {
    switch (this.props.selectedConsumer.name) {
      case "docusign" || "docuSign":
        return this.props.docuSignUrl;
      case "dropbox":
        return this.props.dropboxUrl;
      case "box":
        return this.props.boxUrl;
      case "mailru":
        return this.props.mailRuUrl;
      case "skydrive":
        return this.props.oneDriveUrl;
      case "microsoft":
        return this.props.microsoftUrl;
      case "google":
        return this.props.googleUrl;
      case "facebook":
        return this.props.facebookUrl;
      case "linkedin":
        return this.props.linkedinUrl;
      case "clickatell":
        return this.props.clickatellUrl;
      case "smsc":
        return this.props.smsclUrl;
      case "firebase":
        return this.props.firebaseUrl;
      case "appleID":
        return this.props.appleIDUrl;
      case "telegram":
        return this.props.telegramUrl;
      case "wordpress":
        return this.props.wordpressUrl;
      case "s3":
        return this.props.awsUrl;
      case "googlecloud":
        return this.props.googleCloudUrl;
      case "rackspace":
        return this.props.rackspaceUrl;
      case "selectel":
        return this.props.selectelUrl;
      case "yandex":
        return this.props.yandexUrl;
      case "vk":
        return this.props.vkUrl;
      default:
        return this.props.portalSettingsUrl;
    }
  };

  inputsRender = (item, index) => {
    const { onChangeHandler, state, props } = this;
    const { selectedConsumer, isLoading } = props;

    return (
      <React.Fragment key={item.name}>
        <Box
          displayProp="flex"
          flexDirection="column"
          marginProp={
            selectedConsumer.props.length == index + 1 ? "0" : "0 0 16px 0"
          }
        >
          <Box marginProp="0 0 4px 0">
            <Text isBold>{item.title}:</Text>
          </Box>
          <Box>
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
            />
          </Box>
        </Box>
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
      helpCenterDescription,
      supportTeamDescription,
      requiredRef,
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
          <Box paddingProp="16px 0 16px">{consumerInstruction}</Box>
          <>
            {selectedConsumer.props.map((prop, i) =>
              this.inputsRender(prop, i),
            )}
          </>
          <Text as="div">{supportTeamDescription}</Text>
          <Text as="div">{helpCenterDescription}</Text>
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
          />
          <Button
            size="normal"
            scale
            id="cancel-button"
            label={t("Common:CancelButton")}
            isLoading={isLoading}
            isDisabled={isLoading}
            onClick={onModalClose}
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

ConsumerModalDialog.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
  selectedConsumer: PropTypes.object,
  onModalClose: PropTypes.func.isRequired,
  dialogVisible: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onChangeLoading: PropTypes.func.isRequired,
  updateConsumerProps: PropTypes.func.isRequired,
  urlSupport: PropTypes.string,
};

export default inject(({ setup, settingsStore }) => {
  const {
    theme,
    urlSupport,
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
    urlSupport,
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
