module.exports = {
    root: true,
    extends: ['@ecomfe/eslint-config', 'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
    parser: '@typescript-eslint/parser',
    rules: {
        indent: ['error', 4], // 保存代码时缩进4个空格
        'no-multi-spaces': ['error', {ignoreEOLComments: true}],
    },
};
