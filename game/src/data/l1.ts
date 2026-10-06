import type { SortItem } from "../components/Sorter";
import type { MCQ } from "../components/MultiChoice";

export const PROBLEM_FIRST: SortItem[] = [
  { text: "“We are not using enough AI.”", answer: "Solution-first",
    why: "AI is “a means to an end, not an end in itself.” The real issue might be officers struggling to decide from large, unruly data sets. (Guide 2)" },
  { text: "“We don't have a CRM platform.”", answer: "Solution-first",
    why: "“But why do we need one?” The real issue might be cumbersome processes causing long wait times. (Guide 2)" },
  { text: "“Many elderly residents miss clinic appointments because reminders only go out by email.”", answer: "Problem-first",
    why: "It names who (elderly residents), what they are trying to do (attend), and what is in the way (email-only reminders)." },
  { text: "“Let's build a dashboard so managers can see all the case data.”", answer: "Solution-first",
    why: "A dashboard is a tool. What are managers trying to do, and what is getting in their way?" },
  { text: "“Small businesses abandon the licence application halfway and call the hotline instead.”", answer: "Problem-first",
    why: "Users struggling with a task, with no fix assumed." },
  { text: "“Our product is reaching end of life.”", answer: "Solution-first",
    why: "It talks about the product. What is really at stake is that some citizens and officers will lose access to a critical service. (Guide 2)" },
  { text: "“We need a super app.”", answer: "Solution-first",
    why: "IDG's own example of a solution dressed up as a problem. Grab started with one goal: taxis that are safer, more reliable and easier to book." },
];

export const OUTPUT_OUTCOME: SortItem[] = [
  { text: "Launched a website with five buttons.", answer: "Output", why: "IDG's own example of an output. Something produced, not a change for anyone." },
  { text: "More citizens complete their transactions.", answer: "Outcome", why: "IDG's own example of an outcome." },
  { text: "Trained 200 officers on the new system.", answer: "Output", why: "Activity completed. The outcome is whatever changes because of it." },
  { text: "Fewer applicants need to call the hotline to finish a form.", answer: "Outcome", why: "It measures the change for users, not what was built." },
  { text: "Released 12 new features this quarter.", answer: "Output", why: "“Features delivered” instead of “change achieved”." },
];

export const PRINCIPLES_QUIZ: MCQ[] = [
  {
    prompt: "Which three questions keep you on the problem, not the solution?",
    options: [
      "Who are our users? What are they trying to do? What is getting in their way?",
      "What is our budget? Who is our vendor? When is the deadline?",
      "Which tech is available? What did peers build? What is cheapest?",
    ],
    answer: 0,
    why: "Principle 1: focus on the problem, not the solution.",
  },
  {
    prompt: "“No initiative succeeds when these three work in silos.” Which three?",
    options: ["Policy, operations and technology", "Design, code and test", "Budget, schedule and scope"],
    answer: 0,
    why: "Principle 3: integrate policy, ops and tech.",
  },
  {
    prompt: "Quick test for an output: “Could you finish it and still help no one?”",
    options: ["Yes, that means it is an output", "Yes, that means it is an outcome", "It means the metric is lagging"],
    answer: 0,
    why: "If you can finish it and still help no one, it is something produced, not a change achieved.",
  },
];
