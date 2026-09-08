module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order',
  ],
  plugins: [],
  rules: {
    // 颜色
    'color-hex-length': 'short',
    'color-named': 'never',

    // 字体
    'font-family-name-quotes': 'always-unless-keyword',
    'font-weight-notation': 'numeric',

    // 字符串
    'string-quotes': 'single',

    // 长度
    'length-zero-no-unit': true,
    'unit-case': 'lower',

    // 值
    'value-keyword-case': 'lower',
    'value-no-vendor-prefix': true,

    // 属性
    'property-no-vendor-prefix': true,
    'property-case': 'lower',

    // 声明
    'declaration-colon-space-after': 'always',
    'declaration-colon-space-before': 'never',
    'declaration-empty-line-before': 'never',

    // 声明块
    'declaration-block-trailing-semicolon': 'always',
    'declaration-block-single-line-max-declarations': 1,
    'declaration-block-semicolon-newline-after': 'always',
    'declaration-block-semicolon-space-before': 'never',

    // 块
    'block-opening-brace-space-before': 'always',
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always',

    // 选择器
    'selector-type-case': 'lower',
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['page', 'view', 'text', 'image', 'swiper', 'swiper-item'],
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global'],
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'],
      },
    ],

    // 规则
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],

    // 注释
    'comment-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['stylelint-commands'],
      },
    ],

    // 通用
    'indentation': 2,
    'max-nesting-depth': 5,
    'max-line-length': 120,
    'no-duplicate-selectors': true,
    'no-empty-source': null,
    'no-eol-whitespace': true,
    'no-missing-end-of-source-newline': true,

    // SCSS 特定规则
    'scss/at-import-partial-extension': 'never',
    'scss/at-import-no-partial-leading-underscore': true,
    'scss/dollar-variable-colon-space-after': 'always',
    'scss/dollar-variable-colon-space-before': 'never',
    'scss/operator-no-unspaced': true,
    'scss/selector-no-redundant-nesting-selector': true,
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
}

