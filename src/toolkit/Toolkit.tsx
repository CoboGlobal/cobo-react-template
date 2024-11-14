import React, { useEffect, useState } from 'react';
import {
  Button,
  getAuthInfo,
  getPortalLocale,
  parseJwtToken,
  removeGetLocaleListener,
  useAddUidToBody,
  useMFA,
  useTrackingScript,
  verifyJwtToken,
} from '@cobo/cobo-ui-toolkit';
import { getAccessToken, getMfaMethods, getVerifyInfo } from '@/toolkit/api';

interface UserInfo {
  email: string;
  roles: string[];
  roleNames: string[];
  userID?: string;
  orgID?: string;
  sub?: string;
}

const Toolkit: React.FC = () => {
  const isInIframe = window.frames.length !== window.parent.frames.length;

  const [locale, setLocale] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [accessToken, setAccessToken] = useState('');
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [accessTokenLoading, setAccessTokenLoading] = useState(false);

  // This hook injects a tracking script into the DOM, which collects data for app analytics, and ensures proper cleanup when the component unmounts.
  useTrackingScript('sandbox');
  // This hook converts a specified user ID from string to Base64 format and adds it as a `uid` attribute to the `<body>` tag of the HTML document.
  useAddUidToBody(userInfo?.userID || '');
  // This hook manages multi-factor authentication (MFA) methods within your application.
  const sendMfaMethods = useMFA();

  const onGetAuthInfo = async () => {
    try {
      setUserInfoLoading(true);
      // This function retrieves user authentication information from Cobo Portal.
      const { token, userID } = await getAuthInfo() || {};
      if (token) {
        const verifyInfo = await getVerifyInfo();
        // This function verifies a JSON Web Token (JWT) using the specified public keys, ensuring that the token has not been tampered with and is valid.
        const verified = await verifyJwtToken(token, verifyInfo);
        if (verified) {
          // This function parses a JSON Web Token (JWT) and returns the payload as a JSON object.
          const jwtInfo = parseJwtToken(token);
          setUserInfo({
            email: jwtInfo.email,
            roles: jwtInfo.roles,
            roleNames: jwtInfo.role_names,
            userID,
            orgID: jwtInfo.org_id,
            sub: jwtInfo.sub,
          });
          localStorage.setItem('orgID', jwtInfo.org_id || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUserInfoLoading(false);
    }
  };

  const onGetAccessToken = async () => {
    try {
      setAccessTokenLoading(true);
      const { access_token } = await getAccessToken();
      setAccessToken(access_token);
      localStorage.setItem('accessToken', access_token);
    } catch (e) {
      console.error(e);
    } finally {
      setAccessTokenLoading(false);
    }
  };

  const onGetMfaMethods = async () => {
    try {
      const { result } = await getMfaMethods(userInfo?.sub || '');
      const list = result.map((item: any) => {
        return {
          mfaMethod: item.mfa_method,
          mfaStatus: item.mfa_status,
        };
      });
      // [
      //   { mfaMethod: "google_auth", mfaStatus: "Active" },
      //   { mfaMethod: "cobo_guard", mfaStatus: "Active" },
      //   { mfaMethod: "security_key", mfaStatus: "Active" },
      // ]
      const requestId = await sendMfaMethods(list);
      console.log(requestId);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // This function listens for the current locale data of Cobo Portal and executes a callback when the locale data updates.
    getPortalLocale((locale) => {
      setLocale(locale.locale);
    });
    return () => {
      // This function removes the listener for the current locale data of Cobo Portal.
      removeGetLocaleListener();
    }
  }, []);

  return (
    <div className="flex-1 p-8">
      <h2 className="text-3xl font-bold mb-6">UI Toolkit</h2>
      {!isInIframe ? (
        <h3>Please Open in Portal Apps</h3>
      ) : (
        <>
          {locale && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p><strong>Locale:</strong> {locale}</p>
            </div>
          )}

          {!userInfo ? (
            <Button
              className='px-4 py-2'
              size="large"
              loading={userInfoLoading}
              onClick={onGetAuthInfo}>
              Get Auth Info
            </Button>
          ) : (
            <>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-2">User Information</h3>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Role Name:</strong> {userInfo.roleNames.join(', ')}</p>
                <p><strong>User ID:</strong> {userInfo.userID}</p>
                <p><strong>Organization ID:</strong> {userInfo.orgID}</p>
              </div>

              {!accessToken ? (
                <Button
                  className='px-4 py-2'
                  size="large"
                  loading={accessTokenLoading}
                  onClick={onGetAccessToken}>
                  Get Access Token
                </Button>
              ) : (
                <>
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <p><strong>Access Token:</strong> {accessToken}</p>
                  </div>
                  <Button className='px-4 py-2' size="large" onClick={onGetMfaMethods}>Send MFA</Button>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Toolkit;
