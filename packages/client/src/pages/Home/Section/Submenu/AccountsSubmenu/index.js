import * as Styled from "./index.styled";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const AccountsSubmenu = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { groupId } = useParams();

  const isPeople = location.pathname.includes("/accounts/people");

  const onPeople = () => {
    navigate("/accounts/people/filter");
  };

  const onGroups = () => {
    navigate("/accounts/groups/filter");
  };

  if (groupId !== undefined) return null;

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

export default AccountsSubmenu;
