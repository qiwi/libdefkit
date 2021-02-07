module.exports = {
    extends: [
        'eslint-config-qiwi',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    ignorePatterns: ['src/test/temp/*'],
    overrides: [
        {
            files: ['./src/test/**/*.ts'],
            rules: {
                'unicorn/no-null': 'off',
            }
        }
    ]
};
