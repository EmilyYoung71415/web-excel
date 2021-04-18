module.exports = {
    extends: ['@ecomfe/eslint-config'],
    rules: {
        indent: ['error', 4], // 保存代码时缩进4个空格
        'no-multi-spaces': ['error', {ignoreEOLComments: true}],
    },
};
