import * as Styled from "./index.styled";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { inject, observer } from "mobx-react";
import Loaders from "@docspace/common/components/Loaders";

const AccountsSubmenu = ({
  showBodyLoader,
  setPeopleSelection,
  setGroupsSelection,
  setPeopleBufferSelection,
  setGroupsBufferSelection,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { groupId } = useParams();

  const isPeople = location.pathname.includes("/accounts/people");

  const onPeople = () => {
    setGroupsSelection([]);
    setGroupsBufferSelection(null);
    navigate("/accounts/people/filter");
  };

  const onGroups = () => {
    setPeopleSelection([]);
    setPeopleBufferSelection(null);
    navigate("/accounts/groups/filter");
  };

  if (groupId !== undefined) return null;

  if (showBodyLoader) return <Loaders.SectionSubmenuLoader />;

  return (
    <Styled.AccountsSubmenu
      className="accounts-tabs"
      forsedActiveItemId={isPeople ? "people" : "groups"}
      data={[
        {
          id: "people",
          name: "People",
          onClick: onPeople,
          content: null,
        },
        {
          id: "groups",
          name: "Groups",
          onClick: onGroups,
          content: null,
        },
      ]}
    />
  );
};

export default inject(({ peopleStore, clientLoadingStore }) => ({
  showBodyLoader:  clientLoadingStore.showBodyLoader,
  setPeopleSelection: peopleStore.selectionStore.setSelection,
  setPeopleBufferSelection: peopleStore.selectionStore.setBufferSelection,
  setGroupsSelection: peopleStore.groupsStore.setSelection,
  setGroupsBufferSelection: peopleStore.groupsStore.setBufferSelection,

}))(observer(AccountsSubmenu));
