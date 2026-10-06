export type TripInputs = {
  arriveBy: Date;
  bufferMin: number;
  walkToStopMin: number;
  busWaitMin: number;
  rideMin: number;
  walkFromStopMin: number;
  raining: boolean;
};

export type LeavePlan = {
  leaveAt: Date;
  totalMin: number;
  umbrella: boolean;
};

// Rain slows the walking legs, not the ride or the bus wait.
export const RAIN_WALK_FACTOR = 1.3;

export function computeLeaveTime(t: TripInputs): LeavePlan {
  const walkFactor = t.raining ? RAIN_WALK_FACTOR : 1;
  const walking = (t.walkToStopMin + t.walkFromStopMin) * walkFactor;
  const totalMin = Math.ceil(walking + t.busWaitMin + t.rideMin + t.bufferMin);
  return {
    leaveAt: new Date(t.arriveBy.getTime() - totalMin * 60_000),
    totalMin,
    umbrella: t.raining,
  };
}
