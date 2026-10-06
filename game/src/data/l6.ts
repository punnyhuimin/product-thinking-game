import type { MCQ } from "../components/MultiChoice";

// Airbnb's 11-star framework as told in IDG Guide 6. IDG describes stars 1, 2 and 5 to 11 only.
// `cost` is an invented game number (effort units) for the budget challenge, not from IDG.
export const STARS = [
  { star: 1, text: "You knock at the door and no one answers.", cost: 0 },
  { star: 2, text: "You wait 20 minutes for the host to show up.", cost: 0 },
  { star: 5, text: "Baseline: you knock, someone opens the door and lets you in. “All they mean is I knocked, someone opened the door.”", cost: 1 },
  { star: 6, text: "The host welcomes you warmly, shows you around, and the place is clean and well stocked.", cost: 2 },
  { star: 7, text: "The host learns you like surfing, leaves a surfboard and a car, and recommends the best local restaurants.", cost: 3 },
  { star: 8, text: "A private chef.", cost: 5 },
  { star: 9, text: "A personalised itinerary waiting on the table.", cost: 6 },
  { star: 10, text: "A limousine from the airport and a press conference at the door.", cost: 9 },
  { star: 11, text: "Elon Musk shows up and tells you you're going to space.", cost: 12 },
];

export const BUDGET = 4;

export const CX_QS: MCQ[] = [
  {
    prompt: "ParkingSG auto-calculates fees, lets you extend remotely and refunds partial sessions. What principle is that?",
    options: [
      "The product does the thinking so the user doesn't have to",
      "Add a tutorial for every feature",
      "Charge more for convenience",
    ],
    answer: 0,
    why: "“If your service requires a lengthy tutorial to navigate, it's a signal. It's not about your users, it's about your design.”",
  },
  {
    prompt: "RedeemSG serves campaign organisers, consumers and merchants, who can't all be equally happy. What did the team do?",
    options: [
      "Waited until all three agreed",
      "Understood each user's core problem, made smart trade-offs, got the essentials right first and kept a roadmap for the rest",
      "Built for consumers only",
    ],
    answer: 1,
    why: "“Get the essentials right first and build a road map for everything else. That clarity is what enabled them to deliver value quickly.”",
  },
  {
    prompt: "Why does good CX matter most for compulsory services?",
    options: ["Citizens have no option to go elsewhere", "They cost less to build", "Compliance is optional"],
    answer: 0,
    why: "“Especially important when our services are compulsory because citizens don't have options to go elsewhere.”",
  },
];
