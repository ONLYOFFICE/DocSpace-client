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

import { AI_TOOLS } from "@docspace/shared/constants";
import { inject, observer } from "mobx-react";
import { useState } from "react";

import TopUpAiModal from "SRC_DIR/components/panels/TopUpBalance/TopUpAiModal";
import TopUpModal from "SRC_DIR/components/panels/TopUpBalance/TopUpModal";

type TopUpContainerTypes = {
  visible: boolean;
  onCloseTopUpModal: () => void;
  onBackClick: () => void;
  featureCountData?: number;
  isTopUpVisible?: boolean;
};

const TopUpContainer = (props: TopUpContainerTypes) => {
  const {
    visible,
    onCloseTopUpModal,
    onBackClick,
    featureCountData,
    isTopUpVisible,
  } = props;

  const [walletTopUpModalVisible, setWalletTopUpModalVisible] =
    useState(isTopUpVisible);
  const [recommendedAmount, setRecommendedAmount] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number>(
    featureCountData ?? 0,
  );

  const onTopUpBalance = () => {
    setWalletTopUpModalVisible(true);
  };

  const onAmountDifferenceChange = (diff: number, amount: number) => {
    setRecommendedAmount(diff);
    setSelectedAmount(amount);
  };

  const onBackWalletClick = () => {
    setWalletTopUpModalVisible(false);
  };

  return walletTopUpModalVisible ? (
    <TopUpModal
      visible={visible}
      onClose={onBackWalletClick}
      afterTopUp={onBackWalletClick}
      headerProps={{
        isBackButton: true,
        onBackClick: onBackWalletClick,
        onCloseClick: onCloseTopUpModal,
      }}
      {...(recommendedAmount > 0 && {
        reccomendedAmount: recommendedAmount.toString(),
        amount: selectedAmount.toString(),
      })}
      serviceName={AI_TOOLS}
    />
  ) : visible ? (
    <TopUpAiModal
      onTopUpBalance={onTopUpBalance}
      onAmountDifferenceChange={onAmountDifferenceChange}
      visible={visible}
      onClose={onCloseTopUpModal}
      headerProps={{
        isBackButton: true,
        onBackClick: onBackClick,
        onCloseClick: onCloseTopUpModal,
      }}
      initialAmount={selectedAmount > 0 ? selectedAmount.toString() : ""}
    />
  ) : null;
};

export default inject(({ servicesStore }: TStore) => {
  const { featureCountData } = servicesStore;
  return {
    featureCountData,
  };
})(observer(TopUpContainer));
