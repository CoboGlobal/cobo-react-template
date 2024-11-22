import { useCallback, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { accessTokenAtom, refreshTokenAtom } from '@/atoms/auth';
import coboApi from '@/services/coboApi';
import { getAuthInfo } from '@cobo/cobo-ui-toolkit';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const [logging, setLogging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const [refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);

  const isLoggedIn = useMemo(() => {
    return !!(accessToken && refreshToken);
  }, [accessToken, refreshToken]);

  const decodeAuthInfo = async () => {
    const authInfo = await getAuthInfo();
    const portalToken = authInfo?.token;
    const userId = authInfo?.userID;
    if (!authInfo || !portalToken || !userId) {
      throw new Error('Get access token from portal failed. Please run this app in portal and try again.')
    }
    const decoded = jwtDecode<{
        org_id: string;
      }>(portalToken);
    const orgId = decoded.org_id;
    return {
      portalToken,
      userId,
      orgId,
    }
  }

  const setDefaultAccessToken = useCallback(async() => {
    const { orgId, userId } = await decodeAuthInfo()
    if (!userId || !orgId) return;
    setAccessToken(localStorage.getItem(`app_access_token_${orgId}_${userId}`) || '');
    setRefreshToken(localStorage.getItem(`app_refresh_token_${orgId}_${userId}`) || '');
  }, [setAccessToken, setRefreshToken]);

  const login = useCallback(async () => {
    setLogging(true);
    try {
      const { portalToken, orgId, userId } = await decodeAuthInfo()
      const {token, refresh_token} = await coboApi.login(portalToken);
      setAccessToken(token);
      setRefreshToken(refresh_token);
      coboApi.setAuthToken(token);
      localStorage.setItem(`app_access_token_${orgId}_${userId}`, token);
      localStorage.setItem(`app_refresh_token_${orgId}_${userId}`, refresh_token);
    } finally {
      setLogging(false)
    }
  }, [setAccessToken, setRefreshToken]);

  const refresh = useCallback(async () => {
    if (!refreshToken) return;
    setRefreshing(true);
    try {
      const {token} = await coboApi.refreshToken(refreshToken);
      setAccessToken(token);
      coboApi.setAuthToken(token);
      localStorage.setItem('app_access_token', token);
    } finally {
      setRefreshing(false)
    }
  }, [refreshToken, setAccessToken]);

  return {
    isLoggedIn,
    accessToken,
    refreshToken,
    logging,
    refreshing,
    login,
    refresh,
    setDefaultAccessToken,
  }
};

export default useAuth;