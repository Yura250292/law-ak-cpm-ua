#!/bin/bash
# Збирає build/CallRecorder.app (universal: Apple Silicon + Intel), підпис ad-hoc.
set -euo pipefail
cd "$(dirname "$0")"
APP=build/CallRecorder.app
rm -rf build && mkdir -p "$APP/Contents/MacOS"
for arch in arm64 x86_64; do
  swiftc -O -swift-version 5 -target "$arch-apple-macos14.4" \
    -o "build/CallRecorder-$arch" Sources/*.swift
done
lipo -create build/CallRecorder-arm64 build/CallRecorder-x86_64 -output "$APP/Contents/MacOS/CallRecorder"
rm build/CallRecorder-arm64 build/CallRecorder-x86_64
cp Info.plist "$APP/Contents/Info.plist"
codesign --force --sign - "$APP"
echo "Готово: $APP"
