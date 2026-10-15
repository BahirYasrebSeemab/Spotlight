#!/usr/bin/env bash
# Runs inside the emulator step of .github/workflows/app-screenshots.yml.
# Installs the release APK, runs the Maestro capture flow, and collects every
# screenshot plus a UI hierarchy dump into capture-output/.
set -uo pipefail

ROOT="$(pwd)"
OUT="$ROOT/capture-output"
mkdir -p "$OUT/screens"

adb install -r android/app/build/outputs/apk/release/app-release.apk

# Keep the screen awake and hide the status-bar clutter for clean frames.
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0941
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false

# Maestro writes takeScreenshot files relative to the working directory.
cd "$OUT/screens"
maestro test "$ROOT/.maestro/capture.yaml" \
  --test-output-dir "$OUT/maestro" \
  -e DEMO_EMAIL="$DEMO_EMAIL" \
  -e DEMO_PASSWORD="$DEMO_PASSWORD"
status=$?
cd "$ROOT"

# Hierarchy of whatever screen the flow ended on, to help author the next flow.
maestro hierarchy > "$OUT/final-hierarchy.json" 2>/dev/null || true
adb exec-out screencap -p > "$OUT/screens/zz-final.png" || true
adb logcat -d -s ReactNativeJS:V > "$OUT/react-native.log" || true

ls -la "$OUT/screens"
exit $status
