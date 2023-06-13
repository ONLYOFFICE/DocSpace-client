import { DefaultIcon, icons, isDone, isInterrupted } from "./Icon.helper";
import IconProps from "./Icon.props";

function Icon(props: IconProps): JSX.Element {
  if (isDone(props) || isInterrupted(props)) {
    const { BoardRoleDone, BoardRoleInterrupted } = icons[props.size];
    return isInterrupted(props) ? <BoardRoleInterrupted /> : <BoardRoleDone />;
  }

  return <DefaultIcon color={props.color} size={props.size} />;
}

export default Icon;
