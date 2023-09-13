import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useCookies } from 'react-cookie';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [cookies] = useCookies(['XSRF-TOKEN']);

  const login = async () => {
    const formData  = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("_csrf", cookies['XSRF-TOKEN']);
    await fetch(`${process.env.REACT_APP_AUTHORIZATION_SERVER}/login?${searchParams.toString()}`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-XSRF-TOKEN': cookies['XSRF-TOKEN'],
      },
      credentials: "include",
      redirect: "manual"
    });
    
    window.location.href = `${process.env.REACT_APP_AUTHORIZATION_SERVER}/oauth2/authorize?${searchParams.toString()}&continue`;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          {searchParams.get("error") && (            
            <div>
              <div className="alert alert-danger">Invalid Email or Password</div>
            </div>
          )}
          {searchParams.get("logout") && (
            <div>
              <div className="alert alert-success"> You have been logged out.</div>
            </div>
          )}
          <div className="card">
            <div className="card-header">
              <h2 className="text-center">Login Form</h2>
            </div>
            <div className="card-body">
              <div
                className="form-horizontal"
              >
                <div className="form-group mb-3">
                  <label className="control-label"> Email</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    placeholder="Enter email address"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="control-label"> Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-group mb-3">
                  <button type="button" className="btn btn-primary" onClick={login}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
