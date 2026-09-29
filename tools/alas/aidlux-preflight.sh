#!/usr/bin/env sh
# Alas / AidLux final-live environment probe.
#
# READ-ONLY PREP TOOL: it does not install packages, clone repositories,
# alter ADB, or start Alas.

set -eu

echo "=== identity ==="
uname -a || true
uname -m || true

echo "=== executables expected by Alas AidLux template ==="
for p in /usr/bin/git /usr/bin/python /usr/bin/adb; do
  if [ -x "$p" ]; then
    echo "OK $p"
  else
    echo "MISSING $p"
  fi
done

echo "=== versions ==="
/usr/bin/git --version 2>/dev/null || true
/usr/bin/python --version 2>/dev/null || true
/usr/bin/python -m pip --version 2>/dev/null || true
/usr/bin/adb version 2>/dev/null || true

echo "=== python architecture ==="
/usr/bin/python - <<'PY' 2>/dev/null || true
import platform, struct, sys
print("python_executable=", sys.executable)
print("python_version=", sys.version.replace("\n", " "))
print("machine=", platform.machine())
print("pointer_bits=", struct.calcsize("P") * 8)
PY

echo "=== adb server / devices (read-only query) ==="
/usr/bin/adb devices -l 2>/dev/null || true

echo "=== candidate Python imports already present ==="
/usr/bin/python - <<'PY' 2>/dev/null || true
mods = [
    "numpy", "scipy", "PIL", "cv2", "adbutils", "uiautomator2",
    "av", "cnocr", "mxnet", "yaml", "uvicorn", "pywebio"
]
for name in mods:
    try:
        mod = __import__(name)
        print("IMPORT_OK", name, getattr(mod, "__version__", "unknown"))
    except Exception as e:
        print("IMPORT_MISSING", name, type(e).__name__, str(e))
PY
