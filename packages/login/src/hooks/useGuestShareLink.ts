import { TError } from "@/types";
import { addGuest } from "@docspace/shared/api/people";
import Filter from "@docspace/shared/api/people/filter";
import { toastr } from "@docspace/shared/components/toast";
import {  useState } from "react";

export const useGuestShareLink = () => {

    const [isLoading, setIsLoading] = useState(false);
    
    const onGuestsShareLinkInvalid = () => {
        sessionStorage.setItem("guestShareLinkInvalid", "true");
        window.location.replace("/");
    };

  const onApproveInvite = async (email: string, confirmHeader: string) => {
    setIsLoading(true);

    try {
      setIsLoading(false);

      await addGuest(email, confirmHeader, true);
      const newFilter = Filter.getDefault();
      newFilter.area = "guests";
      newFilter.group = null;

      window.location.replace(
        `/accounts/guests/filter?${newFilter.toUrlParams()}`,
      );
    } catch (error) {
      const knownError = error as TError;
      let errorMessage: string;

      if (typeof knownError === "object") {
        if (knownError.response?.status === 401) {
          window.location.replace("/");
        }

        errorMessage =
          knownError?.response?.data?.error?.message ||
          knownError?.statusText ||
          knownError?.message ||
          "";
      } else {
        errorMessage = knownError;
      }
      console.error(errorMessage);

      setIsLoading(false);
      toastr.error(errorMessage);
    }
  };

  const onDenyInvite = () => {
    window.location.replace("/");
  };


    return {
        onGuestsShareLinkInvalid,
        onApproveInvite,
        onDenyInvite,
        isLoading,
    }
}