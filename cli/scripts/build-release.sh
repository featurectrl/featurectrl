#!/bin/sh
# Cross-compile featurectrl release artifacts.
# Run from the cli/ directory.
#
# Required env:
#   VERSION       stripped semver, e.g. "1.0.0"
#   COMMIT        full git sha
#   BUILD_DATE    RFC3339 UTC timestamp
#
# Optional env:
#   DIST          output directory (default: dist)

set -eu

: "${VERSION:?VERSION is required}"
: "${COMMIT:?COMMIT is required}"
: "${BUILD_DATE:?BUILD_DATE is required}"
DIST="${DIST:-dist}"

PKG="github.com/featurectrl/featurectrl/cli/cmd"
LDFLAGS="-s -w -X ${PKG}.version=${VERSION} -X ${PKG}.commit=${COMMIT} -X ${PKG}.date=${BUILD_DATE}"

rm -rf "$DIST"
mkdir -p "$DIST"

build_one() {
    os=$1
    arch=$2
    name="featurectrl_${VERSION}_${os}_${arch}"
    workdir=$(mktemp -d)

    GOOS="$os" GOARCH="$arch" CGO_ENABLED=0 \
        go build -trimpath -ldflags "$LDFLAGS" \
        -o "$workdir/featurectrl" .

    cp ../LICENSE "$workdir/LICENSE"

    tar -C "$workdir" -czf "$DIST/${name}.tar.gz" featurectrl LICENSE
    rm -rf "$workdir"
    printf '  built %s\n' "${name}.tar.gz"
}

printf 'building featurectrl %s (commit %s)\n' "$VERSION" "$COMMIT"
build_one linux amd64
build_one linux arm64
build_one darwin amd64
build_one darwin arm64

if command -v sha256sum >/dev/null 2>&1; then
    (cd "$DIST" && sha256sum ./*.tar.gz | sed 's| \./| |' > checksums.txt)
else
    (cd "$DIST" && shasum -a 256 ./*.tar.gz | sed 's| \./| |' > checksums.txt)
fi

printf '\nartifacts in %s:\n' "$DIST"
ls -lh "$DIST"
