import * as Styled from "./index.styled";
import { useNavigate, useLocation } from "react-router-dom";

const Tabs = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isPeople = location.pathname.includes("/accounts/people");

  const onPeople = () => {
    navigate("/accounts/people/filter");
  };

  const onGroups = () => {
    navigate("/accounts/groups/filter");
  };

  return (
    <Styled.Tabs
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

export default Tabs;
