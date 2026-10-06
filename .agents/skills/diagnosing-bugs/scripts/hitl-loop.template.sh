#!/usr/bin/env bash
# Human-in-the-loop reproduction loop. Copy this file, edit the steps, and run it;
# the user answers the prompts in their terminal.
#
#   step "<instruction>"        show instruction, wait for Enter
#   capture VAR "<question>"    show question, read the answer into VAR
#
# Captured answers are printed as KEY=VALUE at the end for the agent to read,
# so capture observations only. Signing in, passwords and the like go in a `step`.

set -euo pipefail

captured=""

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [Enter when done] " _
}

capture() {
  printf '\n>>> %s\n' "$2"
  read -r -p "    > " "$1"
  captured+=" $1"
}

# --- edit below ---------------------------------------------------------

step "Open the app at http://localhost:3000 and sign in."

capture ERRORED "Click the 'Export' button. Did it throw an error? (y/n)"

capture ERROR_MSG "Paste the error message (or 'none'):"

# --- edit above ---------------------------------------------------------

printf '\n--- Captured ---\n'
for var in $captured; do printf '%s=%s\n' "$var" "${!var}"; done
