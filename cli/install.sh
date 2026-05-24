#!/bin/sh
# featurectrl CLI installer
#
# Usage:
#   curl -fsSL https://featurectrl.io/cli/install.sh | sh
#
# Environment overrides:
#   FEATURECTRL_VERSION       Tag to install, e.g. "cli-v1.0.0". Defaults to the latest cli-v* release.
#   FEATURECTRL_INSTALL_DIR   Target directory for the binary. Defaults to /usr/local/bin.

set -eu

REPO="featurectrl/featurectrl"
BINARY="featurectrl"
INSTALL_DIR="${FEATURECTRL_INSTALL_DIR:-/usr/local/bin}"

log() { printf '%s\n' "$*" >&2; }
err() { printf 'error: %s\n' "$*" >&2; exit 1; }

require() {
    command -v "$1" >/dev/null 2>&1 || err "missing required command: $1"
}

require uname
require tar
require mktemp

if command -v curl >/dev/null 2>&1; then
    DL='curl -fsSL'
elif command -v wget >/dev/null 2>&1; then
    DL='wget -qO-'
else
    err "need curl or wget to download release artifacts"
fi

detect_os() {
    os=$(uname -s)
    case "$os" in
        Linux)  printf 'linux' ;;
        Darwin) printf 'darwin' ;;
        *)      err "unsupported OS: $os (supported: Linux, Darwin)" ;;
    esac
}

detect_arch() {
    arch=$(uname -m)
    case "$arch" in
        x86_64|amd64)  printf 'amd64' ;;
        arm64|aarch64) printf 'arm64' ;;
        *)             err "unsupported architecture: $arch (supported: x86_64, arm64)" ;;
    esac
}

resolve_version() {
    if [ -n "${FEATURECTRL_VERSION:-}" ]; then
        printf '%s' "$FEATURECTRL_VERSION"
        return
    fi
    # Pick the most recent release whose tag starts with cli-v, ignoring platform v* tags.
    tag=$($DL "https://api.github.com/repos/${REPO}/releases" \
        | grep -m1 '"tag_name": *"cli-v' \
        | sed -E 's/.*"tag_name": *"(cli-v[^"]+)".*/\1/')
    [ -n "$tag" ] || err "could not resolve latest cli-v* release from GitHub API"
    printf '%s' "$tag"
}

sha256_of() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$1" | awk '{print $1}'
    elif command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$1" | awk '{print $1}'
    else
        err "need sha256sum or shasum to verify download"
    fi
}

install_binary() {
    src=$1
    dst="${INSTALL_DIR}/${BINARY}"

    if mkdir -p "$INSTALL_DIR" 2>/dev/null && [ -w "$INSTALL_DIR" ]; then
        mv "$src" "$dst"
        chmod +x "$dst"
    elif command -v sudo >/dev/null 2>&1; then
        log "installing to $INSTALL_DIR requires elevated permissions"
        sudo mkdir -p "$INSTALL_DIR"
        sudo mv "$src" "$dst"
        sudo chmod +x "$dst"
    else
        err "cannot write to $INSTALL_DIR and sudo is unavailable. Re-run with FEATURECTRL_INSTALL_DIR=\$HOME/.local/bin or move $src manually."
    fi

    printf '%s' "$dst"
}

OS=$(detect_os)
ARCH=$(detect_arch)
TAG=$(resolve_version)
VERSION=${TAG#cli-v}

ARCHIVE="${BINARY}_${VERSION}_${OS}_${ARCH}.tar.gz"
BASE_URL="https://github.com/${REPO}/releases/download/${TAG}"
ARCHIVE_URL="${BASE_URL}/${ARCHIVE}"
CHECKSUMS_URL="${BASE_URL}/checksums.txt"

log "installing ${BINARY} ${TAG} (${OS}/${ARCH})"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT INT TERM

# shellcheck disable=SC2086
$DL "$ARCHIVE_URL" > "$TMP/$ARCHIVE" || err "failed to download $ARCHIVE_URL"
# shellcheck disable=SC2086
$DL "$CHECKSUMS_URL" > "$TMP/checksums.txt" || err "failed to download $CHECKSUMS_URL"

expected=$(grep " $ARCHIVE\$" "$TMP/checksums.txt" | awk '{print $1}')
[ -n "$expected" ] || err "no checksum entry for $ARCHIVE in checksums.txt"

actual=$(sha256_of "$TMP/$ARCHIVE")
[ "$expected" = "$actual" ] || err "checksum mismatch for $ARCHIVE (expected $expected, got $actual)"

tar -xzf "$TMP/$ARCHIVE" -C "$TMP" "$BINARY"
[ -f "$TMP/$BINARY" ] || err "archive did not contain $BINARY"

DEST=$(install_binary "$TMP/$BINARY")
log "${BINARY} ${TAG} installed to ${DEST}"
log "run '${BINARY} --help' to get started"
