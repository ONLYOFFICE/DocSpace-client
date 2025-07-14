import { inject, observer } from "mobx-react";

import Chat from "@docspace/shared/components/chat";

const ChatView = ({ userAvatar, id }: { userAvatar?: string; id: string }) => {
  return <Chat roomId={id} userAvatar={userAvatar ?? ""} />;
};

export default inject(({ userStore, selectedFolderStore }: TStore) => {
  return {
    userAvatar: userStore.user?.avatarSmall,
    id: selectedFolderStore.id,
  };
})(observer(ChatView));
