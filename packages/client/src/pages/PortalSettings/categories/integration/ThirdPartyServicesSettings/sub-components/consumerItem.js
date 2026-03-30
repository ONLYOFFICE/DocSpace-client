// (c) Copyright Ascensio System SIA 2009-2026
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

  const itemClassNames = [styles.styledItem];
  if (!saveAvailable && !isSet) itemClassNames.push(styles.descriptionDisabled);

  const boxClassNames = [styles.styledBox];
  if (!saveAvailable && consumer.canSet) boxClassNames.push(styles.unavailable);
  if (consumer.name === "linkedin") boxClassNames.push(styles.linkedin);
  if (consumer.name === "weixin") boxClassNames.push(styles.weixin);
  if (consumer.name === "telegram") boxClassNames.push(styles.telegram);

  return (
    <div className={itemClassNames.join(" ")}>
      <div className={styles.itemBox}>
        <div className={boxClassNames.join(" ")}>{header}</div>
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
