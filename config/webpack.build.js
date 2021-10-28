import { rootResolvePath } from '../scripts/utils.js'
import { getBuildLoaders } from './loaders.config.js'
import { getBuildPlugins } from './plugins.config.js'
import CopyPlugin from 'copy-webpack-plugin'
import path from 'path'

const PATHS = {
  output: rootResolvePath('build')
}

const reusedConfigs = {
  mode: 'development',
  module: {
    rules: [
      {
        oneOf: [...getBuildLoaders()]
      }
    ]
  },
  plugins: [
    ...getBuildPlugins(),
    // CopyPlugin configurations: https://github.com/webpack-contrib/copy-webpack-plugin
    new CopyPlugin([
      {
        from: './src/statics/favicons/',
        // to 可以写相对 webpack.config.output.path 的路径，比如 './statics/favicons/'
        // 但 CopyPlugin 插件的文档中没有明确说明 to 最终路径的计算规则
        // 所以我个人推荐手动计算绝对路径，如下
        to: path.resolve(PATHS.output, './statics/favicons/'),
        toType: 'dir'
      }
    ])
  ],
  // devtool: 'eval-source-map',
  devtool: 'source-map',
  // in ./scripts/dev.js
  devServer: {}
}

const webConfig = { ...reusedConfigs }
const serverConfig = { ...reusedConfigs }
serverConfig.plugins = serverConfig.plugins.slice(1)

export const getBuildConfig = () => ([
  {
    target: 'web',
    // node: {
    //   global: true
    // },
    entry: {
      // NOTE: entry sort matters style cascading
      static: './src/static.ts',
      index: './src/index.ts'
    },
    output: {
      path: PATHS.output
    },
    ...webConfig
  },
  {
    target: 'node',
    entry: {
      server: './src/server.ts'
    },
    output: {
      filename: '[name].cjs',
      // @refer: https://webpack.js.org/configuration/output/#outputlibrarytarget
      // @refer: https://webpack.js.org/configuration/output/#outputlibrarytype
      // libraryTarget: 'umd',
      library: {
        name: 'MobiusLib',
        type: 'commonjs2'
      },
      path: PATHS.output
    },
    ...serverConfig
  }
])
