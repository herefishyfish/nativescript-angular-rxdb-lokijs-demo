const webpack = require('@nativescript/webpack');
const { resolve } = require('path');

module.exports = (env) => {
  webpack.init(env);

  webpack.chainWebpack((config) => {
    const fallback = config.resolve.get("fallback");
    config.resolve.set(
      "fallback",
      webpack.Utils.merge(fallback || {}, {
        fs: require.resolve("@nativescript/core/file-system"),
      })
    );

    const nodeModulesPath = webpack.Utils.project.getProjectFilePath('node_modules');
    config.resolve.alias.set('ws', resolve(nodeModulesPath, '@valor/nativescript-websockets'));
    config.resolve.alias.set('pouchdb-md5', resolve(nodeModulesPath, '@herefishyfish/rxdb/pouchdb'));
    config.resolve.alias.set('uuid', resolve(nodeModulesPath, '@herefishyfish/rxdb/uuid'));
    config.resolve.alias.set('isomorphic-fetch', resolve(nodeModulesPath, '@nativescript/core'));
    config.resolve.alias.set('broadcast-channel', resolve(nodeModulesPath, 'broadcast-channel/dist/esbrowser'));
    config.resolve.alias.set(resolve(nodeModulesPath, 'unload/dist/es/browser.js'), resolve(nodeModulesPath, '@herefishyfish/rxdb/unload/browser.js'));
  });

  return webpack.resolveConfig();
};
