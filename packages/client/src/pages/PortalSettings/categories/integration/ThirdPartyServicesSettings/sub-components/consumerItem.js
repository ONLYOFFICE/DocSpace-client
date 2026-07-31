/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import classNames from "classnames";
import { ReactSVG } from "react-svg";
import PropTypes from "prop-types";
import { Text } from "@docspace/ui-kit/components/text";
import { thirdpartiesLogo } from "@docspace/shared/utils/image-thirdparties";
import ConsumerToggle from "./consumerToggle";
import { Heading } from "@docspace/ui-kit/components";

import styles from "./consumerItem.module.scss";

const ConsumerItem = ({
  consumer,
  onModalOpen,
  setConsumer,
  updateConsumerProps,
  t,
  isThirdPartyAvailable,
  standalone,
}) => {
  const logo = thirdpartiesLogo?.get(`${consumer.name.toLowerCase()}.svg`);
  const isSet = !!(!consumer.canSet || consumer.props.find((p) => p.value));
  const saveAvailable = !consumer.paid || standalone || isThirdPartyAvailable; // same logic on backend

  const header = logo ? (
    <ReactSVG src={logo} className={styles.consumerIcon} alt={consumer.name} />
  ) : consumer.title ? (
    <Heading className={styles.consumerTitle} level={3}>
      {consumer.title}
    </Heading>
  ) : null;

  return (
    <div className={classNames(styles.styledItem, {
      [styles.descriptionDisabled]: !saveAvailable && !isSet,
    })}>
      <div className={styles.itemBox}>
        <div className={classNames(styles.styledBox, {
          [styles.unavailable]: !saveAvailable && consumer.canSet,
          [styles.linkedin]: consumer.name === "linkedin",
          [styles.weixin]: consumer.name === "weixin",
          [styles.telegram]: consumer.name === "telegram",
        })}>{header}</div>
        <div onClick={setConsumer} data-consumer={consumer.name}>
          <ConsumerToggle
            consumer={consumer}
            onModalOpen={onModalOpen}
            updateConsumerProps={updateConsumerProps}
            t={t}
            isDisabled={!saveAvailable}
            dataTestId="consumer_toggle_button"
          />
        </div>
      </div>

      <Text className={styles.consumerDescription}>{consumer.description}</Text>
    </div>
  );
};

ConsumerItem.propTypes = {
  consumer: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    instruction: PropTypes.string,
    canSet: PropTypes.bool,
    props: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onModalOpen: PropTypes.func.isRequired,
  setConsumer: PropTypes.func.isRequired,
  updateConsumerProps: PropTypes.func.isRequired,
};

export default ConsumerItem;
