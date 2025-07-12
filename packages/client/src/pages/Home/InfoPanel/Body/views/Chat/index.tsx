import React from "react";
import { inject, observer } from "mobx-react";

import Chat from "@docspace/shared/components/chat";

const ChatView = ({ userAvatar }: { userAvatar?: string }) => {
  return <Chat roomId="1" userAvatar={userAvatar ?? ""} />;
};

export default inject(({ userStore }: TStore) => {
  return { userAvatar: userStore.user?.avatarSmall };
})(observer(ChatView));
