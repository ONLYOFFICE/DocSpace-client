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

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { toastr } from "@docspace/shared/components/toast";

const StyledToggle = styled(ToggleButton)`
  position: relative;
`;

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
      <StyledToggle
        className={consumer.name}
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
