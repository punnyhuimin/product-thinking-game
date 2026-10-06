import type { TripView } from "./types";

// Sample trip for checking the trip view without the backend. Loaded only with ?mock.
export const MOCK_TRIP: TripView = {
  ok: true,
  from: {
    label: "Kings Ville",
    address: "1 Kings Road, Singapore 266439",
    postal: "266439",
    lat: 1.3197,
    lng: 103.8064,
  },
  to: {
    label: "Hwa Chong Institution",
    address: "661 Bukit Timah Road, Singapore 269734",
    postal: "269734",
    lat: 1.3268,
    lng: 103.8037,
  },
  arriveBy: "2026-10-06T07:45:00+08:00",
  bufferMin: 10,
  leaveAt: "2026-10-06T07:16:00+08:00",
  route: {
    totalMin: 19,
    walkMin: 7,
    transitMin: 12,
    legs: [
      {
        mode: "WALK",
        service: null,
        fromName: "Kings Ville",
        toName: "Opp Kings Ville",
        fromStopCode: null,
        durationMin: 4,
        path: [[1.3197, 103.8064], [1.3203, 103.8066], [1.3209, 103.8070], [1.3213, 103.8072]],
      },
      {
        mode: "BUS",
        service: "61",
        fromName: "Opp Kings Ville",
        toName: "Hwa Chong Instn",
        fromStopCode: "41041",
        durationMin: 12,
        path: [
          [1.3213, 103.8072], [1.3221, 103.8066], [1.3230, 103.8058],
          [1.3240, 103.8050], [1.3249, 103.8044], [1.3257, 103.8040],
        ],
      },
      {
        mode: "WALK",
        service: null,
        fromName: "Hwa Chong Instn",
        toName: "Hwa Chong Institution",
        fromStopCode: null,
        durationMin: 3,
        path: [[1.3257, 103.8040], [1.3262, 103.8036], [1.3268, 103.8037]],
      },
    ],
  },
  live: { busWaitMin: 4, forecast: "Light Showers", umbrella: true },
};
