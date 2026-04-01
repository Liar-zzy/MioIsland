<div align="center">

```
    /\_/\
   ( o.o )  ♪
    > ^ <
   /|   |\
  (_|   |_)
```

# CodeIsland

**Your AI agents live in the notch.**

[![Release](https://img.shields.io/github/v/release/xmqywx/CodeIsland?style=flat-square&color=4ADE80)](https://github.com/xmqywx/CodeIsland/releases)
[![macOS](https://img.shields.io/badge/macOS-14%2B-black?style=flat-square&logo=apple)](https://github.com/xmqywx/CodeIsland/releases)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE.md)

</div>

---

A native macOS app that turns your MacBook's notch into a real-time control surface for AI coding agents. Monitor sessions, approve permissions, and jump to the right terminal tab — without leaving your flow.

## Preview

```
 ╭──────────────────────────────────────╮
 │  🐱 myproject  working...        ❶  │  ← collapsed notch
 ╰──────────────────────────────────────╯

 ╭──────────────────────────────────────╮
 │  1 sessions                      ⚙  │
 │                                      │
 │  ● fix auth bug                 12m  │  ← glow dot + colored title
 │    Bash: npm test                    │
 │  ─────────────────────────────────── │
 │  ● optimize queries              5m  │
 │    Read: schema.prisma               │
 ╰──────────────────────────────────────╯
```

## Features

**Pixel Cat Companion** — A tiny animated cat lives in your notch. It blinks when idle, eyes dart when working, waves when it needs you, and shows X eyes on errors.

**Zero Config** — Launch once. CodeIsland auto-installs hooks into `~/.claude/settings.json` and starts monitoring all Claude Code sessions.

**Notch Approval** — When Claude needs permission, approve or deny right from the notch. Code diff preview included — see exactly what will change before allowing.

**Smart Jump** — Click any session to jump to the exact cmux tab or Ghostty terminal, matched by working directory.

**Session at a Glance** — Glow dots show status. Cyan = working. Amber = needs you. Green = done. Each title is colored to match.

**8-bit Sounds** — Chiptune alerts for every event. Configurable per-event. Mute what you don't need.

**Project Grouping** — Toggle in settings to group sessions by project directory. Or keep the flat list.

## Install

**Download** the latest `.dmg` from [Releases](https://github.com/xmqywx/CodeIsland/releases), open it, drag to Applications.

Or build from source:

```bash
git clone https://github.com/xmqywx/CodeIsland.git
cd CodeIsland
xcodebuild -project ClaudeIsland.xcodeproj -scheme ClaudeIsland \
  -configuration Release CODE_SIGN_IDENTITY="-" \
  CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO \
  DEVELOPMENT_TEAM="" build
```

## Supported Agents

| Agent | Status |
|-------|--------|
| Claude Code | Full support (hooks + approval) |
| OpenAI Codex | Via hooks |
| Gemini CLI | Via hooks |
| Cursor Agent | Via hooks |

## Supported Terminals

cmux, Ghostty, iTerm2, Warp, Terminal.app, Alacritty, Kitty, WezTerm, VS Code, Cursor, and more.

## The Cat

```
  Idle       Working     Needs You    Thinking     Error      Done

 /\_/\      /\_/\       /\_/\  /    /\_/\        /\_/\      /\_/\
( -.- )    ( o ᐳ o )   ( o.o )/    ( -.- )      ( x.x )   ( ^.^ )
 > ^ <      > ^ <       > ^ <    zzZ> ^ <        > ^ <      > ^ <
  blink      eyes dart   wave!      breathe       oops       yay!
```

## Requirements

- macOS 14+ (Sonoma)
- MacBook with notch (floating mode available for external displays)

## Credits

Forked from [Claude Island](https://github.com/farouqaldori/claude-island) by farouqaldori. Rebuilt with pixel cat animations, cmux integration, and minimal glow-dot design.

## License

MIT
