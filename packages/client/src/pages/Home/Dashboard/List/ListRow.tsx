import { useMemo } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { useParams, useNavigate } from "react-router-dom";

import { Badge } from "@docspace/components";
import Link from "@docspace/components/link";
import { classNames } from "@docspace/components/utils/classNames";

import SettingsStore from "@docspace/common/store/SettingsStore";

import Icon from "../Icon";
import { RoleRow, RoleRowContent, RoleRowWrapper } from "./List.styled";

import { ListRowProps } from "./List.props";
import { StoreType, ParamType } from "../types";

function ListRow({
  role,
  theme,
  isActive,
  isChecked,
  sectionWidth,
}: ListRowProps) {
  const { roomId } = useParams<ParamType>();
  const navigate = useNavigate();

  const href = useMemo(
    () => roomId && `/rooms/shared/${roomId}/dashboard/${role.id}`,

    [roomId, role.id]
  );

  const onClickLink = (event: MouseEvent) => {
    event.preventDefault();

    if (href) {
      navigate(href);
    }
  };

  const element = useMemo(
    () => <Icon size="medium" type={role.type} color={role.color} />,
    [role.type, role.color]
  );

  const onSelect = (checked: boolean, role: any) => {
    console.log("onSelect", { checked, role });
  };

  return (
    <div
      className={
        classNames("row-wrapper", {
          ["row-selected"]: isChecked || isActive,
        }) as string
      }
    >
      <RoleRowWrapper>
        <RoleRow
          data={role}
          mode="modern"
          element={element}
          checked={isChecked}
          isActive={isActive}
          className="role-row"
          sectionWidth={sectionWidth}
          onSelect={onSelect}
          contextOptions={[{ key: "Separator", isSeparator: true }]}
        >
          <RoleRowContent
            isMobile={isMobile}
            sectionWidth={sectionWidth}
            sideColor={theme?.filesSection.rowView.sideColor}
          >
            <Link
              type="page"
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
            <span>{`Queue number: ${role.queue}`}</span>
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
