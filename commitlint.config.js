const automaticCommitPattern = /^chore\(release\):.*\[skip ci]/

export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [commit => automaticCommitPattern.test(commit)]
}
