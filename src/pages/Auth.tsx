import { Button } from '@cobo/cobo-ui-toolkit';
import useAuth from '@/hooks/auth';
import coboApi from '@/services/coboApi';

const Auth = () => {
  const { logging, refreshing, accessToken, login, refresh } = useAuth();

  return (
    <div className="flex w-full flex-col justify-center items-center">
      <Button
        className="px-4 py-2"
        size="large"
        loading={logging}
        onClick={login}>
        Get Access Token
      </Button>
      {accessToken ? (
        <Button
          className="mt-5 px-4 py-2"
          size="large"
          loading={refreshing}
          onClick={refresh}
        >
          Refresh Access Token
        </Button>
      ) : null}
      {accessToken ? (
        <Button
          className="mt-5 px-4 py-2"
          size="large"
          onClick={() => {
            coboApi.getWallets();
          }}
        >
          Load Wallets
        </Button>
      ) : null}
    </div>
  )
};

export default Auth;
