export default [
    {
        files: ["**/*.js"],
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "no-console": "warn",
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
    },
];