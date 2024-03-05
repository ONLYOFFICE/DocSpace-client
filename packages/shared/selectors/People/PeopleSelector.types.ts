import PeopleFilter from "../../api/people/filter";
import {
  TSelectorCancelButton,
  TSelectorCheckbox,
  TSelectorHeader,
  TSelectorSubmitButton,
} from "../../components/selector/Selector.types";

export interface UserTooltipProps {
  avatarUrl: string;
  label: string;
  email: string;
  position: string;
}

export type PeopleSelectorProps = TSelectorHeader &
  TSelectorCancelButton &
  TSelectorCheckbox &
  TSelectorSubmitButton & {
    id?: string;
    className?: string;
    style?: React.CSSProperties;

    filter?: PeopleFilter | Function;
    excludeItems?: string[];
    currentUserId: string;
    withOutCurrentAuthorizedUser?: boolean;
    withAbilityCreateRoomUsers?: boolean;
    filterUserId?: string;
  };
