import Progress from "./Progress";
import { DialogReassignmentSkeleton } from "@docspace/shared/skeletons/dialog";
import AccountInfo from "./AccountInfo";
import Description from "./Description";
import NewOwner from "./NewOwner";

const Body = ({
  t,
  tReady,
  showProgress,
  isReassignCurrentUser,
  user,
  selectedUser,
  percent,
  currentColorScheme,
  isAbortTransfer,
  dataReassignmentUrl,
  onTogglePeopleSelector,
  onTerminate,
}) => {
  if (!tReady) return <DialogReassignmentSkeleton />;

  if (showProgress)
    return (
      <Progress
        isReassignCurrentUser={isReassignCurrentUser}
        fromUser={user.displayName}
        toUser={
          selectedUser.displayName
            ? selectedUser.displayName
            : selectedUser.label
        }
        percent={percent}
        isAbortTransfer={isAbortTransfer}
        onTerminate={onTerminate}
      />
    );

  return (
    <>
      <AccountInfo user={user} />
      <NewOwner
        t={t}
        selectedUser={selectedUser}
        currentColorScheme={currentColorScheme}
        onTogglePeopleSelector={onTogglePeopleSelector}
      />
      <Description t={t} dataReassignmentUrl={dataReassignmentUrl} />
    </>
  );
};

export default Body;
