// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'perfectionist', 'unused-imports'],
  rules: {
    'perfectionist/sort-imports': ['error'],
    'perfectionist/sort-interfaces': ['error'],
    // sort-objects is intentionally disabled: alphabetizing runtime object literals
    // reorders things like useMutation/useInfiniteQuery option bags, which breaks
    // TanStack Query's property-order-dependent generic inference (TContext, TPageParam, etc).
    'prettier/prettier': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
  },
  settings: {
    perfectionist: {
      partitionByComment: true,
      type: 'line-length',
    },
  },
};
