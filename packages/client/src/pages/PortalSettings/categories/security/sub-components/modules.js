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

import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { ToggleContent } from "@docspace/shared/components/toggle-content";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";

const ProjectsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  flex-wrap: wrap;
`;

const RadioButtonContainer = styled.div`
  margin-inline-end: 150px;
  margin-bottom: 16px;
  width: 310px;
`;

const ToggleContentContainer = styled.div`
  .toggle_content {
    margin-bottom: 24px;
  }

  .wrapper {
    margin-top: 16px;
  }

  .remove_icon {
    margin-inline-start: 120px;
  }

  .button_style {
    margin-inline-end: 16px;
  }

  .advanced-selector {
    position: relative;
  }

  .filter_container {
    margin-bottom: 50px;
    margin-top: 16px;
  }
`;

const ProjectsBody = styled.div`
  width: 280px;
`;

class PureModulesSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { t } = this.props;

    console.log("Modules render_");

    return (
      <ToggleContentContainer>
        <ToggleContent
          className="toggle_content"
          label={t("Common:People")}
          isOpen={true}
        >
          <ProjectsContainer>
            <RadioButtonContainer>
              <Text>
                {t("AccessRightsAccessToProduct", {
                  product: t("Common:People"),
                })}
                :
              </Text>
              <RadioButtonGroup
                name="selectGroup"
                selected="allUsers"
                options={[
                  {
                    value: "allUsers",
                    label: t("AccessRightsAllUsers", {
                      users: t("Employees"),
                    }),
                  },
                  {
                    value: "usersFromTheList",
                    label: t("AccessRightsUsersFromList", {
                      users: t("Employees"),
                    }),
                  },
                ]}
                orientation="vertical"
                spacing="10px"
              />
            </RadioButtonContainer>
            <ProjectsBody>
              <Text className="projects_margin" fontSize="12px">
                {t("AccessRightsProductUsersCan", {
                  category: t("Common:People"),
                })}
              </Text>
              <Text fontSize="12px">
                <li>{t("ProductUserOpportunities")}</li>
              </Text>
            </ProjectsBody>
          </ProjectsContainer>
        </ToggleContent>
      </ToggleContentContainer>
    );
  }
}

export default withTranslation(["Settings", "Common"])(PureModulesSettings);
