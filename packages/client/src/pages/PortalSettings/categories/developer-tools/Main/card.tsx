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

import ArrowSvg from "PUBLIC_DIR/images/arrow2.react.svg";
import { useNavigate } from "react-router";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";

import styles from './main.module.scss';

type CardProps = {
    title: string;
    description: string;
    url: string;
    linkTitle: string;
    color: string;
    icon: React.ReactNode;
    isBlank?: boolean;
}

const Card = ({ title, description, url, linkTitle, color, icon, isBlank = false }: CardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (isBlank) {
            window.open(url, '_blank');
        } else {
            navigate(url);
        }
    };

    return (
        <div className={styles.card} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <div
                className={styles.cardIcon}
                style={{ backgroundColor: `${color}1a` }}
            >
                <span style={{ color }} className={styles.cardIconInner}>
                    {icon}
                </span>
            </div>
            <div className={styles.cardContent}>
                <Text fontSize="14px" fontWeight={600}>{title}</Text>
                <Text fontSize="12px">{description}</Text>
            </div>
            <hr className={styles.cardDivider} />
            <Link
                className={styles.cardLink}
                onClick={handleClick}
                color="accent"
                type={LinkType.page}
                fontSize="14px"
                fontWeight={600}
            >
                {linkTitle}
                <ArrowSvg />
            </Link>
        </div>
    );
};

export default Card;