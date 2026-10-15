#!/usr/bin/env bash
# Runs inside the emulator step of .github/workflows/app-screenshots.yml.
# Installs the release APK, logs in, runs the Maestro capture flow, and collects
# every screenshot/recording plus a UI hierarchy dump into capture-output/.
set -uo pipefail

ROOT="$(pwd)"
OUT="$ROOT/capture-output"
mkdir -p "$OUT/screens"

adb install -r android/app/build/outputs/apk/release/app-release.apk

# Dark system UI (keyboard, dialogs) to match the app, and a clean status bar.
adb shell cmd uimode night yes
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0941
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false

# `adb shell input text` goes through the device shell: escape everything but safe chars.
adb_type() {
  local escaped
  escaped=$(printf '%s' "$1" | sed 's/[^A-Za-z0-9@._-]/\\&/g')
  adb shell input text "$escaped"
}

run_flow() {
  maestro test "$ROOT/.maestro/$1" --test-output-dir "$OUT/maestro"
}

# Maestro writes takeScreenshot/startRecording files relative to the working directory.
cd "$OUT/screens"
status=0
if run_flow login-open.yaml; then
  adb_type "$DEMO_EMAIL"
  run_flow login-password.yaml && adb_type "$DEMO_PASSWORD" && run_flow capture.yaml || status=$?
else
  status=$?
fi
cd "$ROOT"

# Hierarchy of whatever screen the flow ended on, to help author the next flow.
maestro hierarchy > "$OUT/final-hierarchy.json" 2>/dev/null || true
adb exec-out screencap -p > "$OUT/screens/zz-final.png" || true
adb logcat -d -s ReactNativeJS:V > "$OUT/react-native.log" || true

ls -la "$OUT/screens"
exit $status
