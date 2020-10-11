module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "docs",
        "feat",
        "fix",
        "improv",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
  },
};
