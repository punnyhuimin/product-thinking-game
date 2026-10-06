import type { ComponentType } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { L1Triage } from "./L1Triage";
import { L2WhyLadder } from "./L2WhyLadder";
import { L3Statement } from "./L3Statement";

export const LEVEL_COMPONENTS: Record<number, ComponentType<LevelProps>> = {
  1: L1Triage,
  2: L2WhyLadder,
  3: L3Statement,
};
