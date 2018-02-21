'use strict';
const os = require('os');
const isCygwin = require('is-cygwin');
const isMinGW = require('is-mingw');
const isWsl = require('is-wsl');

const env = process.env;

const supportsAnsi = () => {
  if (!process.stdout.isTTY) {
    return false;
  }

  // Be natively supported on Unix-like systems.
  if (process.platform !== 'win32') {
    return true;
  }

  // Be natively supported on Windows 10 after v.1607 ("Anniversery Update",
  // OS build 14393).
  // @link https://api.dartlang.org/stable/1.24.3/dart-io/Stdout/supportsAnsiEscapes.html
  const osRelease = os.release().split('.');
  if (
    parseInt(osRelease[0], 10) >= 10 && // major version
    parseInt(osRelease[2], 10) >= 14393 // build number
  ) {
    return true;
  }

  // Be supported on Cygwin/MinGW(MSYS2)/WSL with Mintty.
  if (isCygwin || isMinGW || isWsl) {
    return true;
  }

  // ConEmu (from build 120520d) can process ANSI X3.64 when the environment
  // variable `ConEmuANSI` is set to `ON`.
  // @link https://conemu.github.io/en/AnsiEscapeCodes.html#Environment_variable
  const isConEmuAnsiOn = (env.ConEmuANSI || '').toLowerCase() === 'on';
  if (isConEmuAnsiOn) {
    return true;
  }

  // ANSICON provides ANSI escape sequences for Windows console programs. It
  // will create an `ANSICON` environment variable.
  // NOTE: ANSICON supports only a subset of ANSI escape sequences.
  // @link https://github.com/adoxa/ansicon/blob/master/ANSI.c#L38
  if (!!env.ANSICON) {
    return true;
  }

  return false;
};

module.exports = supportsAnsi();
