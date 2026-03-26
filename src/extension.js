'use strict';

const vscode = require('vscode');
const path = require('path');
const { exec } = require('child_process');

// ─────────────────────────────────────────────────────────────────
// SOUND POOLS
// Each event maps to tiers: default[], streak3[], streak5[], streak10[]
// Drop files in sounds/ folder matching these names.
// null = skip streak escalation for this tier
// ─────────────────────────────────────────────────────────────────
const SOUND_POOLS = {
  error: {
    default:  ['error_fahh.mp3', 'error_meow.mp3', 'error_shocked.mp3', 'error_noooo.mp3'],
    streak3:  ['error_dexter.mp3', 'error_no_be_juju.mp3', 'error_serious_right_now.mp3'],
    streak5:  ['error_why.mp3', 'error_pain.mp3', 'error_hell_no.mp3'],
    streak10: ['error_uninstall.mp3'],
  },
  warning: {
    default:  ['warning_uhoh.mp3', 'warning_hmm.mp3', 'warning_suspicious.mp3'],
    streak3:  ['warning_yikes.mp3', 'warning_still_suspicious.mp3'],
    streak5:  ['warning_bro.mp3'],
  },
  success: {
    default:  ['success_gta.mp3', 'success_snopp_dogg.mp3','success_speed_oh.mp3', 'success_hey_boy.mp3', 'success_certified_cool_guy.mp3'],
    streak3:  ['success_on_fire.mp3'],
    streak5:  ['success_unstoppable.mp3'],
    streak10: ['success_goat.mp3'],
  },
  save: {
    default:  ['save_vine_boom.mp3', 'save_thud.mp3', 'save_click.mp3'],
    streak3:  null,
    streak5:  null,
    streak10: ['save_certified_cool_guy.mp3'],
  },
  debugStart: {
    default:  ['debug_start_windows.mp3', 'debug_lets_have_it.mp3'],
    streak3:  ['debug_start_again.mp3'],
    streak5:  null,
    streak10: null,
  },
  debugStop: {
    default:  ['debug_stop_shutdown.mp3', 'debug_stop_bye.mp3'],
    streak3:  null,
    streak5:  null,
    streak10: null,
  },
  testPass: {
    default:  ['test_pass_amogus.mp3', 'test_pass_ding.mp3', 'test_pass_poggers.mp3'],
    streak3:  ['test_pass_on_fire.mp3'],
    streak5:  ['test_pass_cracked.mp3'],
    streak10: ['test_pass_goat.mp3'],
  },
  testFail: {
    default:  ['test_fail_noo.mp3', 'test_fail_bruh.mp3', 'test_fail_rip.mp3'],
    streak3:  ['test_fail_why_god.mp3','test_fail_fehhh.mp3' ],
    streak5:  ['test_fail_quit.mp3'],
    streak10: ['test_fail_shut_up_rage_quit.mp3'],
  },
};

// ─────────────────────────────────────────────────────────────────
// STREAK TRACKER
// Tracks consecutive occurrences of the same event type.
// Resets after STREAK_DECAY_MS of inactivity on that event.
// ─────────────────────────────────────────────────────────────────
const STREAK_DECAY_MS = 10000; // 10 seconds

const streaks = {};

function getStreak(eventKey) {
  const now = Date.now();
  const s = streaks[eventKey];
  if (!s) return 0;
  if (now - s.lastTime > STREAK_DECAY_MS) {
    streaks[eventKey] = null;
    return 0;
  }
  return s.count;
}

function incrementStreak(eventKey) {
  const now = Date.now();
  const current = getStreak(eventKey);
  streaks[eventKey] = { count: current + 1, lastTime: now };
  return streaks[eventKey].count;
}

// ─────────────────────────────────────────────────────────────────
// SOUND RESOLUTION
// Picks the right tier based on streak count, then random within it.
// Falls back to default pool if streak tier is null or missing.
// ─────────────────────────────────────────────────────────────────
function resolveSound(eventKey, streak) {
  const pool = SOUND_POOLS[eventKey];
  if (!pool) return null;

  let tier;
  if (streak >= 10 && pool.streak10?.length) {
    tier = pool.streak10;
  } else if (streak >= 5 && pool.streak5?.length) {
    tier = pool.streak5;
  } else if (streak >= 3 && pool.streak3?.length) {
    tier = pool.streak3;
  } else {
    tier = pool.default;
  }

  if (!tier?.length) tier = pool.default;
  return tier[Math.floor(Math.random() * tier.length)];
}

// ─────────────────────────────────────────────────────────────────
// PLAYBACK — cross-platform
// ─────────────────────────────────────────────────────────────────
let soundsDir;
let isMuted = false;
const lastPlayed = {};
const warnedMissing = new Set();

function getConfig() {
  return vscode.workspace.getConfiguration('codeReacts');
}

function getCooldown() {
  return getConfig().get('cooldownMs') ?? 1500;
}

function playSound(eventKey) {
  if (isMuted) return;

  const now = Date.now();
  const cooldown = getCooldown();
  if (lastPlayed[eventKey] && now - lastPlayed[eventKey] < cooldown) return;
  lastPlayed[eventKey] = now;

  const streak = incrementStreak(eventKey);
  const soundFile = resolveSound(eventKey, streak);
  if (!soundFile) return;

  const customDir = getConfig().get('soundsDir') || '';
  const dir = customDir || soundsDir;
  const soundPath = path.join(dir, soundFile);

  const platform = process.platform;
  let cmd;
  if (platform === 'darwin') {
    cmd = `afplay "${soundPath}"`;
  } else if (platform === 'win32') {
    cmd = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;
  } else {
    cmd = `paplay "${soundPath}" 2>/dev/null || aplay "${soundPath}" 2>/dev/null`;
  }

  exec(cmd, (err) => {
    if (err && !warnedMissing.has(soundFile)) {
      warnedMissing.add(soundFile);
      vscode.window.showWarningMessage(
        `🔇 CodeReacts: Missing "${soundFile}". Run "CodeReacts: Open Sounds Folder" to add it.`
      );
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// LISTENERS
// ─────────────────────────────────────────────────────────────────
let prevErrorCount = 0;
let prevWarningCount = 0;

function registerDiagnosticsListener() {
  return vscode.languages.onDidChangeDiagnostics(() => {
    let errorCount = 0;
    let warningCount = 0;
    for (const [, diags] of vscode.languages.getDiagnostics()) {
      for (const d of diags) {
        if (d.severity === vscode.DiagnosticSeverity.Error)   errorCount++;
        if (d.severity === vscode.DiagnosticSeverity.Warning) warningCount++;
      }
    }
    if (errorCount > prevErrorCount)     playSound('error');
    if (warningCount > prevWarningCount) playSound('warning');
    prevErrorCount   = errorCount;
    prevWarningCount = warningCount;
  });
}

function registerTaskListener() {
  return vscode.tasks.onDidEndTaskProcess((e) => {
    playSound(e.exitCode === 0 ? 'success' : 'error');
  });
}

function registerSaveListener() {
  return vscode.workspace.onDidSaveTextDocument(() => {
    playSound('save');
  });
}

function registerDebugListeners() {
  return [
    vscode.debug.onDidStartDebugSession(()     => playSound('debugStart')),
    vscode.debug.onDidTerminateDebugSession(() => playSound('debugStop')),
  ];
}

// ─────────────────────────────────────────────────────────────────
// COMMANDS
// ─────────────────────────────────────────────────────────────────
function registerCommands() {
  return [
    vscode.commands.registerCommand('codeReacts.testSound', async () => {
      const pick = await vscode.window.showQuickPick(Object.keys(SOUND_POOLS), {
        placeHolder: 'Pick an event — plays a random sound from its pool',
      });
      if (!pick) return;
      lastPlayed[pick] = 0; // bypass cooldown for preview
      playSound(pick);
    }),

    vscode.commands.registerCommand('codeReacts.toggleMute', () => {
      isMuted = !isMuted;
      vscode.window.showInformationMessage(
        `CodeReacts: ${isMuted ? '🔇 Muted' : '🔊 Unmuted'}`
      );
    }),

    vscode.commands.registerCommand('codeReacts.openSoundsFolder', () => {
      const customDir = getConfig().get('soundsDir') || '';
      vscode.env.openExternal(vscode.Uri.file(customDir || soundsDir));
    }),

    vscode.commands.registerCommand('codeReacts.showStreaks', () => {
      const now = Date.now();
      const active = Object.entries(streaks)
        .filter(([, v]) => v && now - v.lastTime < STREAK_DECAY_MS)
        .map(([k, v]) => `${k}: ${v.count}x 🔥`)
        .join('\n') || 'No active streaks.';
      vscode.window.showInformationMessage(`CodeReacts Streaks:\n${active}`);
    }),
  ];
}

// ─────────────────────────────────────────────────────────────────
// ACTIVATE / DEACTIVATE
// ─────────────────────────────────────────────────────────────────
function activate(context) {
  soundsDir = path.join(context.extensionPath, 'sounds');

  const disposables = [
    registerDiagnosticsListener(),
    registerTaskListener(),
    registerSaveListener(),
    ...registerDebugListeners(),
    ...registerCommands(),
  ];

  context.subscriptions.push(...disposables);
  vscode.window.showInformationMessage('⚡ CodeReacts activated. Your IDE has feelings now.');
}

function deactivate() {}

module.exports = { activate, deactivate };
