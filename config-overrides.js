const path = require('path');
const { addWebpackAlias, override } = require('customize-cra');
// %if app_type == portal
const { addWebpackPlugin, overrideDevServer } = require('customize-cra');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
// %endif

module.exports = {
  webpack: override(
    addWebpackAlias({
      '@': path.resolve(__dirname, 'src'),
    }),
    // %if app_type == portal
    addWebpackPlugin(
      new NodePolyfillPlugin({ additionalAliases: ['process'] })
    ),
    // %endif
  ),
  // %if app_type == portal
  devServer: overrideDevServer((config) => {
    return {
      ...config,
      proxy: {
        '/web/v2': {
          target: 'https://api.sandbox.cobo.com',
          changeOrigin: true,
          secure: false,
        },
        '/app/v2': {
          target: 'https://api.sandbox.cobo.com',
          changeOrigin: true,
          secure: false,
        },
      },
    };
  }),
  // %endif
};
