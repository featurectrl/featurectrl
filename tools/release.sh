#!/usr/bin/env sh

set -e

REMOTE="origin"
BRANCH="main"

die() {
  printf 'error: %s\n' "$1" >&2
  exit 1
}

# Pre-flight guards.
current_branch=$(git rev-parse --abbrev-ref HEAD)
[ "$current_branch" = "$BRANCH" ] || die "must be on $BRANCH (currently on $current_branch)"

[ -z "$(git status --porcelain)" ] || die "working tree is not clean"

git fetch "$REMOTE" "$BRANCH" --quiet
local_head=$(git rev-parse HEAD)
remote_head=$(git rev-parse "$REMOTE/$BRANCH")
[ "$local_head" = "$remote_head" ] || die "local $BRANCH is not in sync with $REMOTE/$BRANCH"

# Find latest vX.Y.Z tag (semver-sorted).
latest=$(git tag --list 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -n1)
if [ -z "$latest" ]; then
  printf 'No existing vX.Y.Z tag found — this will be the first release.\n'
  latest="v0.0.0"
fi

version=${latest#v}
major=${version%%.*}
rest=${version#*.}
minor=${rest%%.*}
patch=${rest#*.}

case "$major$minor$patch" in
  *[!0-9]*) die "could not parse semver from tag '$latest'" ;;
esac

printf 'Current version: %s\n' "$latest"
printf 'Bump which part? [M]ajor / [m]inor / [p]atch: '
read -r bump

case "$bump" in
  M|major)
    major=$((major + 1)); minor=0; patch=0 ;;
  m|minor)
    minor=$((minor + 1)); patch=0 ;;
  p|patch)
    patch=$((patch + 1)) ;;
  *)
    die "unknown bump '$bump' (expected M, m, or p)" ;;
esac

new="v${major}.${minor}.${patch}"

printf '\n  %s  →  %s\n\n' "$latest" "$new"
printf 'Create and push tag %s? [y/N]: ' "$new"
read -r confirm

case "$confirm" in
  y|Y|yes|YES) ;;
  *) printf 'Aborted.\n'; exit 0 ;;
esac

git tag -a "$new" -m "Release $new"

if ! git push "$REMOTE" "$new"; then
  printf '\npush failed. To undo the local tag run:\n  git tag -d %s\n' "$new" >&2
  exit 1
fi

printf '\nReleased %s\n' "$new"
