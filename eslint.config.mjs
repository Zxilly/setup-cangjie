import antfu from "@antfu/eslint-config";

export default antfu({
    rules: {
        "no-console": "off",
    },
    stylistic: {
        indent: 2,
        quotes: "double",
        semi: true,
    },
}, {
    ignores: [
        "dist",
    ],
});
