import { useMemo } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Badge } from "@docspace/components";
import Link from "@docspace/components/link";
import { classNames } from "@docspace/components/utils/classNames";

import SettingsStore from "@docspace/common/store/SettingsStore";

import Icon from "../Icon";
import { RoleRow, RoleRowContent, RoleRowWrapper } from "./List.styled";

import type { ListRowProps } from "./List.props";
import type { IRole } from "@docspace/common/Models";
import type { StoreType } from "SRC_DIR/types";

function ListRow({ role, theme, sectionWidth, getModel }: ListRowProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onClickLink = (event: MouseEvent) => {
    event.preventDefault();

    navigate(role.url, { state: { fromDashboard: true } });
  };

  const onSelect = (checked: boolean, role: IRole) => {
    role.onChecked(role, checked);
  };

  const onRowClick = () => {
    role.onContentRowCLick(role, !role.isChecked);
  };

  const onRowContextClick = (withSelection?: boolean) => {
    if (withSelection === undefined) return;

    role.onContentRowCLick(role, false, withSelection);
  };

  const contextOptions = useMemo(() => getModel(role, t), [role, t]);

  return (
    <div
      className={
        classNames("row-wrapper", {
          ["row-selected"]: role.isChecked || role.isActive,
        }) as string
      }
    >
      <RoleRowWrapper>
        <RoleRow
          data={role}
          mode="modern"
          element={<Icon size="medium" type={role.type} color={role.color} />}
          className="role-row"
          isActive={role.isActive}
          checked={role.isChecked}
          sectionWidth={sectionWidth}
          onSelect={onSelect}
          onRowClick={onRowClick}
          contextOptions={contextOptions}
          onContextClick={onRowContextClick}
        >
          <RoleRowContent
            isMobile={isMobile}
            sectionWidth={sectionWidth}
            sideColor={theme?.filesSection.rowView.sideColor}
          >
            <Link
              type="page"
              href={role.url}
              isTextOverflow
              fontSize="14px"
              fontWeight={600}
              title={role.title}
              noHover={isMobile}
              containerWidth="28%"
              enableUserSelect={false}
              onClick={onClickLink}
            >
              {role.title}
            </Link>
            <Badge
              fontSize="9px"
              maxWidth="5px"
              fontWeight={800}
              lineHeight="12px"
              label={role.badge}
              borderRadius="100%"
            />
            <span>{`Queue number: ${role.queueNumber}`}</span>
          </RoleRowContent>
        </RoleRow>
      </RoleRowWrapper>
    </div>
  );
}

export default inject<StoreType>(({ auth }) => {
  const theme = (auth.settingsStore as unknown as SettingsStore).theme;

  return {
    theme,
  };
})(observer(ListRow)) as (arg: Omit<ListRowProps, "theme">) => JSX.Element;
