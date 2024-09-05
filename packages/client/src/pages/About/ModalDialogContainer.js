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

import styled from "styled-components";
import { tablet } from "@docspace/shared/utils";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Base } from "@docspace/shared/themes";

const ModalDialogContainer = styled(ModalDialog)`
  .invite-link-dialog-wrapper {
    display: flex;

    @media ${tablet} {
      display: grid;
      grid-gap: 8px;
      grid-template-columns: auto;
    }
  }

  .text-dialog {
    margin: 16px 0;
  }

  .input-dialog {
    margin-top: 16px;
  }

  .warning-text {
    margin: 20px 0;
  }

  .textarea-dialog {
    margin-top: 12px;
  }

  .link-dialog {
    transition: opacity 0.2s;
    margin-inline-end: 12px;
    opacity: ${(props) => (props.ChangeTextAnim ? 0 : 1)};
  }

  .error-label {
    position: absolute;
    max-width: 100%;
  }

  .field-body {
    position: relative;
  }

  .toggle-content-dialog {
    .heading-toggle-content {
      font-size: 16px;
    }

    .modal-dialog-content {
      padding: 8px 16px;
      border: ${(props) => props.theme.client.about.border};

      .modal-dialog-checkbox:not(:last-child) {
        padding-bottom: 4px;
      }
    }
  }
`;

ModalDialogContainer.defaultProps = { theme: Base };

export default ModalDialogContainer;
