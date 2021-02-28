// 项目发布阶段用到的数组
const prodPlugins = []
if (process.env.MODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  'presets': [
    '@vue/app'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    ...prodPlugins,
    // 配置路由懒加载插件
    '@babel/plugin-syntax-dynamic-import'
  ]
}
