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
import PropTypes from "prop-types";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { toastr } from "@docspace/ui-kit/components/toast";

import styles from "./consumerToggle.module.scss";

class ConsumerToggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleActive: false,
    };
  }

  onToggleClick = (e) => {
    const { consumer, onModalOpen, updateConsumerProps, t } = this.props;

    if (e.currentTarget.checked) {
      onModalOpen();
    } else {
      this.setState({
        toggleActive: false,
      });

      const prop = [];
      let i = 0;
      const propsLength = Object.keys(consumer.props).length;

      for (i = 0; i < propsLength; i++) {
        prop.push({
          name: consumer.props[i].name,
          value: "",
        });
      }

      const data = {
        name: consumer.name,
        props: prop,
      };

      updateConsumerProps(data)
        .then(() => {
          toastr.success(t("ThirdPartyPropsDeactivated"));
        })
        .catch((error) => {
          toastr.error(error);
        });
    }
  };

  render() {
    const { consumer, isDisabled, dataTestId } = this.props;
    const { toggleActive } = this.state;
    const { onToggleClick } = this;

    return (
      <ToggleButton
        className={`${styles.styledToggle} ${consumer.name}`}
        onChange={onToggleClick}
        isDisabled={!consumer.canSet || isDisabled}
        isChecked={
          !consumer.canSet || consumer.props.find((p) => p.value)
            ? true
            : toggleActive
        }
        dataTestId={dataTestId}
      />
    );
  }
}

export default ConsumerToggle;

ConsumerToggle.propTypes = {
  consumer: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    instruction: PropTypes.string,
    canSet: PropTypes.bool,
    props: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onModalOpen: PropTypes.func.isRequired,
  updateConsumerProps: PropTypes.func.isRequired,
};
