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

import styles from "./EmptyScreen.module.scss";
import { Text } from "../../../../../text";

const EmptyScreen = () => {
  return (
    <div className={styles.emptyScreen}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="22"
        viewBox="0 0 24 22"
        fill="currentColor"
        className="h-10 w-10 scale-[1.5]"
      >
        <path d="M13.0486 0.462158H9.75399C9.44371 0.462158 9.14614 0.586082 8.92674 0.806667L4.03751 5.72232C3.81811 5.9429 3.52054 6.06682 3.21026 6.06682H1.16992C0.511975 6.06682 -0.0165756 6.61212 0.000397655 7.2734L0.0515933 9.26798C0.0679586 9.90556 0.586745 10.4139 1.22111 10.4139H3.59097C3.90124 10.4139 4.19881 10.2899 4.41821 10.0694L9.34823 5.11269C9.56763 4.89211 9.8652 4.76818 10.1755 4.76818H13.0486C13.6947 4.76818 14.2185 4.24157 14.2185 3.59195V1.63839C14.2185 0.988773 13.6947 0.462158 13.0486 0.462158Z" />
        <path d="M19.5355 11.5862H22.8301C23.4762 11.5862 24 12.1128 24 12.7624V14.716C24 15.3656 23.4762 15.8922 22.8301 15.8922H19.957C19.6467 15.8922 19.3491 16.0161 19.1297 16.2367L14.1997 21.1934C13.9803 21.414 13.6827 21.5379 13.3725 21.5379H11.0026C10.3682 21.5379 9.84945 21.0296 9.83309 20.392L9.78189 18.3974C9.76492 17.7361 10.2935 17.1908 10.9514 17.1908H12.9918C13.302 17.1908 13.5996 17.0669 13.819 16.8463L18.7082 11.9307C18.9276 11.7101 19.2252 11.5862 19.5355 11.5862Z" />
        <path d="M19.5355 2.9796L22.8301 2.9796C23.4762 2.9796 24 3.50622 24 4.15583V6.1094C24 6.75901 23.4762 7.28563 22.8301 7.28563H19.957C19.6467 7.28563 19.3491 7.40955 19.1297 7.63014L14.1997 12.5868C13.9803 12.8074 13.6827 12.9313 13.3725 12.9313H10.493C10.1913 12.9313 9.90126 13.0485 9.68346 13.2583L4.14867 18.5917C3.93087 18.8016 3.64085 18.9187 3.33917 18.9187H1.32174C0.675616 18.9187 0.151832 18.3921 0.151832 17.7425V15.7343C0.151832 15.0846 0.675616 14.558 1.32174 14.558H3.32468C3.63496 14.558 3.93253 14.4341 4.15193 14.2135L9.40827 8.92878C9.62767 8.70819 9.92524 8.58427 10.2355 8.58427H12.9918C13.302 8.58427 13.5996 8.46034 13.819 8.23976L18.7082 3.32411C18.9276 3.10353 19.2252 2.9796 19.5355 2.9796Z" />
      </svg>
      <div className={styles.emptyScreenInfo}>
        <Text fontSize="20px" fontWeight={600} lineHeight="22px">
          New chat
        </Text>
        <Text fontSize="14px" fontWeight={400} lineHeight="16px">
          Test your flow with a chat prompt
        </Text>
      </div>
    </div>
  );
};

export default EmptyScreen;
