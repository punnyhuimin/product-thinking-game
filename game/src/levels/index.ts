import type { ComponentType } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { L1Triage } from "./L1Triage";
import { L2WhyLadder } from "./L2WhyLadder";

export const LEVEL_COMPONENTS: Record<number, ComponentType<LevelProps>> = {
  1: L1Triage,
  2: L2WhyLadder,
};
