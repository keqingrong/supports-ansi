'use strict';
const os = require('os');
const isCygwin = require('is-cygwin');
const isMinGW = require('is-mingw');

const env = process.env;

const supportsAnsi = () => {
  // Check if it is running in the terminal.
  // NOTE: `process.stdout.isTTY` always return undefined on Cygwin.
  // See https://github.com/nodejs/node/issues/3006
  if (!isCygwin && !process.stdout.isTTY) {
    return false;
  }

  // CMD/PowerShell/Mintty/ConEmu/ANSICON
  if (process.platform === 'win32') {
    // Be natively supported on Windows 10 after v.1607 ("Anniversery Update",
    // OS build 14393).
    // Reference: https://api.dartlang.org/stable/1.24.3/dart-io/Stdout/supportsAnsiEscapes.html
    const osRelease = os.release().split('.');
    if (
      parseInt(osRelease[0], 10) >= 10 && // major version
      parseInt(osRelease[2], 10) >= 14393 // build number
    ) {
      return true;
    }

    // Be supported on Cygwin/MinGW(MSYS2) with Mintty.
    // MinGW and MSYS2 may not create the environment variable `TERM`.
    if (isCygwin || isMinGW) {
      return true;
    }

    // ConEmu (from build 120520d) can process ANSI X3.64 when the environment
    // variable `ConEmuANSI` is set to `ON`.
    // See https://conemu.github.io/en/AnsiEscapeCodes.html#Environment_variable
    const isConEmuAnsiOn = (env.ConEmuANSI || '').toLowerCase() === 'on';
    if (isConEmuAnsiOn) {
      return true;
    }

    // ANSICON provides ANSI escape sequences for Windows console programs. It
    // will create an `ANSICON` environment variable.
    // NOTE: ANSICON supports only a subset of ANSI escape sequences.
    // See https://github.com/adoxa/ansicon/blob/master/ANSI.c#L38
    if (!!env.ANSICON) {
      return true;
    }
  }

  // Check if the terminal is of type VT100 compatible.
  // See http://invisible-island.net/ncurses/man/term.7.html
  // https://en.wikipedia.org/wiki/Computer_terminal#Dumb_terminals
  // https://en.m.wikipedia.org/wiki/Comparison_of_terminal_emulators#Capabilities
  // https://github.com/chalk/supports-color/blob/master/index.js#L105
  if (
    env.TERM &&
    env.TERM !== 'dumb' &&
    /^xterm|^screen|^rxvt|^vt100|^vt102|^vt220|^vt320|color|ansi|konsole|cygwin|linux/i.test(env.TERM)
  ) {
    return true;
  }

  return false;
};

module.exports = supportsAnsi();
