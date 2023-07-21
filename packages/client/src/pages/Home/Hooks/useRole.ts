import { useEffect } from "react";
import { Location, useNavigate, useParams } from "react-router-dom";

import RoleFilter from "@docspace/common/api/files/roleFilter";

import type RoleService from "SRC_DIR/services/Role.service";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

import { ParamType } from "../Dashboard/types";
import { getUserById } from "@docspace/common/api/people";

interface useRoleProps {
  isRolePage: boolean;
  roleService: RoleService;
  setIsLoading: (predicate: boolean, withTimer?: boolean) => void;
  location: Location;
}

function useRole({
  isRolePage,
  roleService,
  location,
  setIsLoading,
}: useRoleProps) {
  const navigate = useNavigate();
  const { roleId, boardId } = useParams<ParamType>();

  const fetchDefaultRoleFiles = (roleId: string, boardId: string) => {
    const filter = RoleFilter.getDefault();

    filter.roleid = roleId;

    const url = getCategoryUrl(CategoryType.Role, boardId, roleId);

    navigate(`${url}?${filter.toUrlParams()}`);
  };

  useEffect(() => {
    if (!isRolePage || !roleId || !boardId) return;

    const filterObj = RoleFilter.getFilter(window.location);
    const state = location.state;

    setIsLoading(true, !state?.fromDashboard);

    if (!filterObj) {
      return fetchDefaultRoleFiles(roleId, boardId);
    }

    let dataObj: { filter: RoleFilter; type?: string; itemId?: string } = {
      filter: filterObj,
    };

    if (filterObj.authorType) {
      const authorType: string = filterObj.authorType;
      const indexOfUnderscore = authorType.indexOf("_");
      const type = authorType.slice(0, indexOfUnderscore);
      const itemId = authorType.slice(indexOfUnderscore + 1);

      if (itemId) {
        dataObj = {
          type,
          itemId,
          filter: filterObj,
        };
      } else {
        filterObj.authorType = null;
        dataObj = { filter: filterObj };
      }
    }

    const { filter, itemId, type } = dataObj;

    const newFilter = filter.clone();

    const requests: [Promise<RoleFilter>, Promise<any>?] = [
      Promise.resolve(newFilter),
    ];

    if (type === "user") {
      requests.push(getUserById(itemId));
    }

    Promise.all(requests)
      .then((data) => {
        const [filter, result] = data;
        if (result) {
          const type = result.displayName ? "user" : "group";
          const selectedItem = {
            key: result.id,
            label: type === "user" ? result.displayName : result.name,
            type,
          };

          filter.selectedItem = selectedItem;
        }

        roleService.getRoleFiles(boardId, roleId, filter).finally(() => {
          setIsLoading(false);
        });
      })
      .catch(() => {
        Promise.resolve(RoleFilter.getDefault());
      });

    // ggetGroup(itemId).then()
  }, [isRolePage, location.state, roleId, boardId]);
}

export default useRole;
