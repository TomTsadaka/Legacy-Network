#!/usr/bin/env bash
#
# Sets up the macOS C++ toolchain for The Chamber (Unreal Engine 5.8).
#
# Automates everything except the one step that cannot be automated: Apple
# requires an authenticated download, so xcodes will prompt for your Apple ID.
# It is a free account -- a paid developer membership is not needed.
#
# Usage:  bash Tools/setup-mac-toolchain.sh
#
set -euo pipefail

# Epic documents Xcode 26.4 as incompatible with Unreal Engine, so this is pinned
# deliberately. Do not "upgrade" it without checking Epic's macOS requirements page.
readonly TARGET_XCODE="26.1.1"
readonly MIN_FREE_GB=45

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m[ok]\033[0m   %s\n' "$1"; }
warn() { printf '  \033[33m[warn]\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m[fail]\033[0m %s\n' "$1"; }

bold "The Chamber -- macOS toolchain setup"
echo

# --- 1. Platform guard ------------------------------------------------------
if [[ "$(uname -s)" != "Darwin" ]]; then
	fail "This script only runs on macOS. You are on $(uname -s)."
	exit 1
fi

# --- 2. macOS version -------------------------------------------------------
bold "1/7  Checking macOS"
MACOS_VERSION="$(sw_vers -productVersion)"
MACOS_MAJOR="${MACOS_VERSION%%.*}"
echo "       macOS $MACOS_VERSION"

case "$MACOS_MAJOR" in
	15) ok "Sequoia -- the combination Epic recommends for UE 5.8." ;;
	14) warn "Sonoma works, but Shader Model 6 needs macOS 15 or newer." ;;
	13) warn "The minimum supported version. Consider upgrading." ;;
	26)
		warn "Not a combination Epic tests against, but workable."
		warn "Two things matter on macOS 26: pin Xcode to $TARGET_XCODE (26.4 and 26.5"
		warn "are both known bad), and install the Metal Toolchain -- step 6 does that."
		;;
	27)
		fail "UE 5.8.1/5.8.2 is reported to fail on macOS 27 at 'Touch UBT generated"
		fail "tiles' with Bad File Descriptor. Check for a newer hotfix before continuing."
		;;
	*)
		if [[ "$MACOS_MAJOR" -lt 13 ]]; then
			fail "UE 5.8 needs macOS 13 or newer. Upgrade macOS before continuing."
			exit 1
		fi
		warn "Untested macOS version for this project."
		;;
esac
echo

# --- 3. Disk space ----------------------------------------------------------
bold "2/7  Checking disk space"
FREE_GB="$(df -g / | awk 'NR==2 {print $4}')"
echo "       ${FREE_GB}GB free"
if [[ "$FREE_GB" -lt "$MIN_FREE_GB" ]]; then
	fail "Need at least ${MIN_FREE_GB}GB free for Xcode plus its components."
	exit 1
fi
ok "Enough room."
echo

# --- 4. Homebrew ------------------------------------------------------------
bold "3/7  Checking Homebrew"
if ! command -v brew >/dev/null 2>&1; then
	fail "Homebrew is not installed. Install it first, then re-run this script:"
	echo
	echo '       /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
	echo
	exit 1
fi
ok "Homebrew present."
echo

# --- 5. xcodes --------------------------------------------------------------
bold "4/7  Installing the xcodes CLI"
if command -v xcodes >/dev/null 2>&1; then
	ok "xcodes already installed."
else
	brew install xcodesorg/made/xcodes
	ok "xcodes installed."
fi

# aria2 makes the 15GB download several times faster. Nice to have, not required.
if ! command -v aria2c >/dev/null 2>&1; then
	echo "       Installing aria2 (downloads Xcode several times faster)..."
	brew install aria2 || warn "aria2 failed to install; falling back to the slower download."
fi
echo

# --- 6. Xcode ---------------------------------------------------------------
bold "5/7  Installing Xcode $TARGET_XCODE"
if xcodes installed 2>/dev/null | grep -q "$TARGET_XCODE"; then
	ok "Xcode $TARGET_XCODE is already installed."
else
	echo "       Apple requires a sign-in for this download."
	echo "       You will be prompted for your Apple ID -- a free account is enough."
	echo "       This is a ~15GB download and will take a while."
	echo
	xcodes install "$TARGET_XCODE"
	ok "Xcode $TARGET_XCODE installed."
fi
echo

# --- 7. Metal Toolchain -----------------------------------------------------
# Since Xcode 16, Apple ships the Metal Toolchain as a separate on-demand download
# rather than inside Xcode.app. Unreal compiles Metal shaders during the build, so
# without this component the build dies with a Metal compiler error that looks like
# an engine bug. This single step is behind most "UE will not build on macOS 26"
# reports.
bold "6/7  Downloading the Metal Toolchain"
if xcodebuild -downloadComponent MetalToolchain 2>/dev/null; then
	ok "Metal Toolchain present."
else
	warn "Could not fetch it as the current user; retrying with sudo."
	sudo xcodebuild -downloadComponent MetalToolchain \
		|| warn "Failed. If the build later reports a Metal compiler error, run this by hand."
fi
echo

# --- 8. Select and verify ---------------------------------------------------
bold "7/7  Selecting the toolchain"
echo "       These steps need administrator rights."
sudo xcodes select "$TARGET_XCODE"
sudo xcodebuild -license accept
xcodebuild -runFirstLaunch
echo

ACTIVE_RAW="$(xcodebuild -version | head -1)"
case "$ACTIVE_RAW" in
	*26.4*|*26.5*)
		fail "Xcode ${ACTIVE_RAW#Xcode } is known bad with Unreal Engine."
		fail "Epic documents 26.4 as incompatible, and 26.5 is reported to crash UE 5.8."
		fail "Select $TARGET_XCODE instead:  sudo xcodes select $TARGET_XCODE"
		exit 1
		;;
esac

bold "Verification"
ACTIVE_PATH="$(xcode-select -p)"
ACTIVE_VERSION="$(xcodebuild -version | head -1)"
echo "       Active path:    $ACTIVE_PATH"
echo "       Active version: $ACTIVE_VERSION"
echo

if [[ "$ACTIVE_VERSION" == *"$TARGET_XCODE"* ]]; then
	ok "Toolchain ready."
	echo
	bold "Next: right-click TheChamber.uproject -> Services -> Generate Xcode project files"
elif [[ "$ACTIVE_PATH" == *"CommandLineTools"* ]]; then
	fail "xcode-select still points at Command Line Tools instead of full Xcode."
	echo "       Fix with:  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
	exit 1
else
	warn "Active version is not $TARGET_XCODE. Unreal may refuse to build."
	echo "       Installed versions:"
	xcodes installed || true
	exit 1
fi
