export default {
  extends: "stylelint-config-standard",
  rules: {
    "no-invalid-position-at-import-rule": null,
    "import-notation": "string",
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": [
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hwb",
      "lab",
      "lch",
      "oklab",
      "oklch",
      "color",
    ],
    "declaration-property-value-disallowed-list": {
      "/^font-family$/": ["/^(?!var\\()/"],
      "/^font$/": ["/^(?!inherit$|var\\()/"],
      "/-radius$/": ["/^(?!0$|var\\()/"],
      "/^(?:min-|max-)?width$/": ["/^(?!var\\()/"],
      "/^(font-size|gap|(padding|margin)(-.+)?)$/": [
        "/^(?!(?:0|auto|inherit|var\\([^)]*\\)|\\s)+$)/",
      ],
    },
  },
}
