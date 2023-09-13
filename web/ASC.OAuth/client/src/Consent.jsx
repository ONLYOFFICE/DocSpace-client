import React from "react";
import { useSearchParams } from "react-router-dom";
import { useCookies } from 'react-cookie';

export default function Consent() {
  const [searchParams] = useSearchParams();
  const [cookies] = useCookies(['XSRF-TOKEN']);
  const clientId = searchParams.get("clientId") || "";
  const principalName = searchParams.get("principalName") || "";
  const state = searchParams.get("state") || "";
  const scopes = searchParams.get("scopes").split(",") || [];
  const previouslyApprovedScopes = searchParams.get("previouslyApprovedScopes") ? searchParams.get("previouslyApprovedScopes").split(",") : [];

  const approve = async () => {
    const formData  = new FormData();
    formData.append("client_id", clientId);
    formData.append("state", state);
    scopes.forEach(scope => {
      formData.append("scope", scope);
    });
    const resp = await fetch(`${process.env.REACT_APP_AUTHORIZATION_SERVER}/oauth2/authorize`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-XSRF-TOKEN': cookies['XSRF-TOKEN'],
      },
      credentials: "include",
      redirect: "follow"
    });

    if (resp.redirected)
      window.location.href = resp.url;
  }

  // TODO: Loader, error page and so on
  return (
    <div className="container">
      <div className="py-5">
        <h1 className="text-center text-primary">App permissions</h1>
      </div>
      <div className="row">
        <div className="col text-center">
          <p>
            <span className="px-1">
              The application
            </span>
            <span className="font-weight-bold text-primary">{clientId}</span>
            <span className="px-1">
              wants to access your account
            </span>
            <span className="font-weight-bold">{principalName}</span>
          </p>
        </div>
      </div>
      <div className="row pb-3">
        <div className="col text-center">
          <p>
            The following permissions are requested by the above app.
            <br />
            Please review these and consent if you approve.
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col text-center">
          <div name="consent_form">
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="state" value={state} />
            {scopes.length > 0 && (
              <div className="form-group form-check py-1">
                {scopes.map((scope) => (<>
                    <span
                      className="font-weight-bold px-1"
                      key={scope}
                    >
                      {scope}
                    </span>
                  </>))}
              </div>
            )}
            {previouslyApprovedScopes.length > 0 && (
              <>
                <p>
                  You have already granted the following permissions to the
                  above app:
                </p>
                {previouslyApprovedScopes.map((scope) => (
                  <>
                    <div className="form-group form-check py-1">
                      <span
                        className="font-weight-bold"
                      >
                        {scope}
                      </span>
                    </div>
                  </>
                ))}
              </>
            )}
            <div className="form-group pt-3">
              <button
                className="btn btn-primary btn-lg"
                id="submit-consent"
                onClick={approve}
              >
                Submit Consent
              </button>
            </div>
            <div className="form-group">
              <button
                className="btn btn-link regular"
                type="button"
                id="cancel-consent"
                onClick={() => window.close()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row pt-4">
        <div className="col text-center">
          <p>
            <small>
              Your consent to provide access is required.
              <br />
              If you do not approve, click Cancel, in which case no information
              will be shared with the app.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
}

/*
FORMDATA

client_id: fc8482ff-b1e4-4397-8a48-13b88f3c25fe
state: huIv-Dc0E01S_lGYPbjXAdSz4Fo5r3pA4eFhaU5G23I=
scope: accounts:read
*/
