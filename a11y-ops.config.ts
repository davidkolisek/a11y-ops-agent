/**
 * a11y-ops-agent project configuration.
 *
 * Loaded automatically from the current working directory.
 * CLI flags override these values when provided.
 *
 * Example:
 *   export default {
 *     maxPages: 50,
 *     ignorePaths: ['/admin'],
 *     includePaths: ['/checkout'],
 *     ai: { enabled: true },
 *   }
 */
export default {
  maxPages: 50,

  ignorePaths: ['/admin'],

  includePaths: ['/checkout'],

  ai: {
    enabled: true,
  },
};
