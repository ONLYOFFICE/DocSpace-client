import { SelectorProps } from "../../components/selector";
import PeopleFilter from "../../api/people/filter";

export interface UserTooltipProps {
  avatarUrl: string;
  label: string;
  email: string;
  position: string;
}

export interface PeopleSelectorProps extends SelectorProps {
  filter: PeopleFilter | Function;
  excludeItems: string[];
  currentUserId: string;
  withOutCurrentAuthorizedUser: boolean;
  withAbilityCreateRoomUsers: boolean;
  filterUserId: string;
}
