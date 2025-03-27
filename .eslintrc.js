// .eslintrc.js
module.exports = {
    extends: ['react-app'],
    // Turn off all rules completely
    rules: {
        'no-unused-vars': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'import/no-anonymous-default-export': 'off',
        'jsx-a11y/alt-text': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'react/jsx-no-undef': 'off',
        // Add any other rules causing warnings
    }
}