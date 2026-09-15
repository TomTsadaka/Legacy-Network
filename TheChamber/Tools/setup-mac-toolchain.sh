#!/usr/bin/env bash
#
# Sets up the macOS C++ toolchain for The Chamber (Unreal Engine 5.8).
#
# Apple requires an authenticated download for Xcode, so that one step needs
# your Apple ID. A free account is enough; no paid membership is required.
#
# Safe to run repeatedly -- it skips whatever is already done.
#
# Usage:  bash TheChamber/Tools/setup-mac-toolchain.sh
#
set -euo pipefail

# Epic documents Xcode 26.4 as incompatible with Unreal Engine, and 26.5 is
# reported to crash UE 5.8. Do not raise this without checking Epic's macOS
# requirements page first.
readonly TARGET_XCODE="26.1.1"
readonly MIN_FREE_GB=45

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m[ok]\033[0m   %s\n' "$1"; }
warn() { printf '  \033[33m[warn]\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m[fail]\033[0m %s\n' "$1"; }

# Xcodes.app installs side-by-side versions as /Applications/Xcode-26.1.1.app,
# so check every Xcode bundle rather than assuming the default path.
xcode_version_at() {
	plutil -extract CFBundleShortVersionString raw "$1/Contents/Info.plist" 2>/dev/null || true
}

find_xcode() {
	local want="$1" app
	for app in /Applications/Xcode*.app; do
		[[ -d "$app" ]] || continue
		[[ "$(xcode_version_at "$app")" == "$want" ]] && { echo "$app"; return 0; }
	done
	return 1
}

list_xcodes() {
	local app found=1
	for app in /Applications/Xcode*.app; do
		[[ -d "$app" ]] || continue
		echo "         $(xcode_version_at "$app")  ->  $app"
		found=0
	done
	[[ $found -eq 0 ]] || echo "         (none)"
}

bold "The Chamber -- macOS toolchain setup"
echo

# --- 1. Platform ------------------------------------------------------------
if [[ "$(uname -s)" != "Darwin" ]]; then
	fail "This script only runs on macOS. You are on $(uname -s)."
	exit 1
fi

bold "1/6  Checking macOS"
MACOS_VERSION="$(sw_vers -productVersion)"
MACOS_MAJOR="${MACOS_VERSION%%.*}"
echo "       macOS $MACOS_VERSION"
case "$MACOS_MAJOR" in
	15) ok "Sequoia -- the combination Epic recommends for UE 5.8." ;;
	14) warn "Sonoma works, but Shader Model 6 needs macOS 15 or newer." ;;
	13) warn "The minimum supported version." ;;
	26) warn "Workable, but pin Xcode to $TARGET_XCODE and install the Metal Toolchain." ;;
	27) fail "UE 5.8.x is reported to fail its build on macOS 27."; exit 1 ;;
	*)
		[[ "$MACOS_MAJOR" -lt 13 ]] && { fail "UE 5.8 needs macOS 13 or newer."; exit 1; }
		warn "Untested macOS version for this project."
		;;
esac
echo

# --- 2. Disk ----------------------------------------------------------------
bold "2/6  Checking disk space"
FREE_GB="$(df -g / | awk 'NR==2 {print $4}')"
echo "       ${FREE_GB}GB free"
[[ "$FREE_GB" -lt "$MIN_FREE_GB" ]] && { fail "Need at least ${MIN_FREE_GB}GB free."; exit 1; }
ok "Enough room."
echo

# --- 3. Is Xcode already here? ----------------------------------------------
bold "3/6  Looking for Xcode $TARGET_XCODE"
if XCODE_APP="$(find_xcode "$TARGET_XCODE")"; then
	ok "Found at $XCODE_APP"
	NEEDS_INSTALL=0
else
	warn "Not installed yet. Currently on this Mac:"
	list_xcodes
	NEEDS_INSTALL=1
fi
echo

# --- 4. Install Xcode -------------------------------------------------------
if [[ "$NEEDS_INSTALL" -eq 1 ]]; then
	bold "4/6  Installing Xcode $TARGET_XCODE"

	if ! command -v brew >/dev/null 2>&1; then
		# A fresh Homebrew install is not on PATH until a new shell starts.
		for BREW_PATH in /opt/homebrew/bin/brew /usr/local/bin/brew; do
			if [[ -x "$BREW_PATH" ]]; then
				eval "$("$BREW_PATH" shellenv)"
				SHELL_PROFILE="$HOME/.zprofile"
				grep -q "brew shellenv" "$SHELL_PROFILE" 2>/dev/null \
					|| echo "eval \"\$($BREW_PATH shellenv)\"" >> "$SHELL_PROFILE"
				break
			fi
		done
	fi

	if ! command -v brew >/dev/null 2>&1; then
		fail "Homebrew is required. Install it, then re-run this script:"
		echo
		echo '       /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
		echo
		exit 1
	fi

	# The xcodes COMMAND-LINE tool builds from source and that build needs a full
	# Xcode to already be present -- the exact thing we are trying to install
	# (XcodesOrg/xcodes#176, XcodesOrg/homebrew-made#4). So install the prebuilt
	# GUI app instead: no compiler needed, same downloader underneath.
	if [[ ! -d "/Applications/Xcodes.app" ]]; then
		echo "       Installing Xcodes.app (prebuilt -- nothing is compiled)..."
		brew install --cask xcodes-app || brew install --cask xcodes
	fi
	ok "Xcodes.app ready."
	echo
	open -a Xcodes || true

	bold "   >>> Over to you, in the Xcodes window that just opened <<<"
	echo
	echo "       1. Sign in with your Apple ID (free account is fine)."
	echo "       2. Optional but worth it: Preferences -> Advanced -> enable"
	echo "          'Experimental unxip'. Cuts install time substantially."
	echo "       3. Find $TARGET_XCODE in the list and click the download arrow."
	echo "          Do NOT pick 26.4 or 26.5 -- both are broken with Unreal."
	echo "       4. It is a ~15GB download. Leave it running."
	echo
	echo "       When it finishes, run this script again and it will pick up"
	echo "       from here:"
	echo
	echo "         bash TheChamber/Tools/setup-mac-toolchain.sh"
	echo
	exit 0
fi

bold "4/6  Xcode $TARGET_XCODE already installed"
ok "Skipping download."
echo

# --- 5. Metal Toolchain -----------------------------------------------------
# Since Xcode 16, Apple ships the Metal Toolchain as a separate on-demand
# download rather than inside Xcode.app. Unreal compiles Metal shaders during
# the build, so without this the build dies with a Metal compiler error that
# reads like an engine bug. This is behind most "UE will not build on macOS 26"
# reports.
bold "5/6  Selecting the toolchain and fetching Metal"
echo "       These steps need administrator rights."
sudo xcode-select -s "$XCODE_APP/Contents/Developer"
sudo xcodebuild -license accept
sudo xcodebuild -runFirstLaunch || warn "runFirstLaunch reported an error; continuing."

if xcodebuild -downloadComponent MetalToolchain 2>/dev/null; then
	ok "Metal Toolchain present."
else
	sudo xcodebuild -downloadComponent MetalToolchain \
		|| warn "Could not fetch it. If the build reports a Metal error, run this by hand."
fi
echo

# --- 6. Verify --------------------------------------------------------------
bold "6/6  Verification"
ACTIVE_PATH="$(xcode-select -p)"
ACTIVE_VERSION="$(xcodebuild -version | head -1)"
echo "       Active path:    $ACTIVE_PATH"
echo "       Active version: $ACTIVE_VERSION"
echo

case "$ACTIVE_VERSION" in
	*26.4*|*26.5*)
		fail "Xcode ${ACTIVE_VERSION#Xcode } is known bad with Unreal Engine."
		exit 1
		;;
esac

if [[ "$ACTIVE_VERSION" == *"$TARGET_XCODE"* ]]; then
	ok "Toolchain ready."
	echo
	bold "Next: right-click TheChamber.uproject -> Services -> Generate Xcode project files"
elif [[ "$ACTIVE_PATH" == *"CommandLineTools"* ]]; then
	fail "xcode-select still points at Command Line Tools, not full Xcode."
	echo "       Fix:  sudo xcode-select -s $XCODE_APP/Contents/Developer"
	exit 1
else
	warn "Active version is not $TARGET_XCODE. Unreal may refuse to build."
	exit 1
fi
