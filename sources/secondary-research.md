# IDG Product Thinking: research notes

Researched 2026-10-06.

## READ FIRST: how reliable these notes are

**I could not open a single idg.gov.sg page, or any other `*.gov.sg` page.** Every one returned HTTP 403 with the message `Approval required for www.idg.gov.sg:443`. That is the sandbox network firewall asking for approval. It is not the site blocking us. Archive.org, r.jina.ai, medium.com, govinsider.asia and nus.edu.sg returned the same 403. Section 6 lists every blocked URL.

So nothing below was read from IDG's own pages. Each claim has one of these provenance tags:

| Tag | Meaning | Trust |
|---|---|---|
| **[SEARCH]** | A web-search engine's summary or snippet of the named official page. It is paraphrased, so the exact wording is not guaranteed. | Medium |
| **[REPO-QUOTE]** | Text shown in quotation marks as IDG's wording inside the unofficial open-source project `melmelchew/servicelink-problem`. Its README says: "The frameworks, quoted passages and the health appointment booking case study are IDG's, reproduced here for study and linked back to source throughout." Each quote is tied to the module URL it came from. | Medium. This is a second-hand quote, so check it against the source. |
| **[REPO-PARAPHRASE]** | The same project's own explanation of a module. It is not quoted. | Low to medium |
| **[REPO-PV]** | The unofficial project `rayray39/product-valley`. It openly mixes IDG with Marty Cagan/SVPG, Teresa Torres and Brian Chesky, and translates "Singapore public-service framing to general product and AI work". | Low as evidence of IDG wording |
| **[UNSOURCED]** | I could not tie this to any source. | Do not use without verifying |

**Before this goes into teaching material:** ask the user to approve `www.idg.gov.sg` on their host. They can run `sbx policy approval ls` and then respond to the pending approval, or run `sbx policy allow network www.idg.gov.sg`. Then fetch the 9 URLs in Section 1 and swap every REPO and SEARCH item for verbatim text.

---

## 1. Map of IDG's product thinking material

### 1.1 Context pages

| Page | URL | What it covers |
|---|---|---|
| Product Thinking (landing page) | https://www.idg.gov.sg/product-thinking/ | **Blocked. I have not seen its contents.** Both community projects link to it as "the IDG Product Thinking pathway" or "curriculum". [SEARCH]: "With product thinking as the foundation, IDG's learning pathways cater to different public officers." Product thinking means "understanding user needs and defining the right problem to solve before considering how technology can help." |
| AI Build 301 | https://www.idg.gov.sg/ai-build-301/ | [SEARCH]: it "applies product thinking to define workplace problems and desired outcomes before identifying AI-enabled solutions." The guides-and-resources summary describes "AI 301" as being "for officers who want to move beyond using AI for individual tasks and design, prototype, and deploy AI-powered solutions at work." The servicelink README calls the product thinking material "Product Thinking pathway (AI Build 301)". [SEARCH] also calls "Start With The Whys" "the second guide in the AI 301: Build with AI product thinking journey". |
| Guides and resources (index) | https://www.idg.gov.sg/guides-and-resources/ | [SEARCH]: the index of IDG guides. Besides the product thinking guides it holds AI how-to guides: "AI 201: Everyday Tasks", ChatGPT meeting minutes, email drafting, and "How do we use AI at work?". The site motto is reported as "Learn. Build. Serve." |
| AI Apply 201 | https://www.idg.gov.sg/ai-apply-201/ | [SEARCH]: "for those ready to put AI to work for everyday tasks like building slide decks and drafting emails." This is not product thinking content. It is listed here to show where AI Build 301 sits in the sequence. |
| AI Aware 101 | URL not found | [SEARCH]: "for those just starting out with AI." |

### 1.2 The seven product thinking guides (the AI Build 301 "product thinking journey")

The URLs and module titles come from the servicelink-problem README and source code, which link to each one. The number in each URL suggests the intended order (see Section 4).

| # | Title (as the repo gives it) | URL | What it teaches (sourced as tagged) |
|---|---|---|---|
| 1 | Understanding the Problem | https://www.idg.gov.sg/guides-and-resources/productthinking1/ | Projects can fail even when execution is strong, because they address the wrong problem. [REPO-QUOTE]: "great digital products start with problems, not solutions." [REPO-PARAPHRASE]: "Execution quality cannot rescue a misdiagnosis." |
| 2 | Start With The Whys | https://www.idg.gov.sg/guides-and-resources/productthinking2/ | Root-cause analysis by asking "why" repeatedly. [REPO-QUOTE]: "problems rarely have one root cause." [REPO-PARAPHRASE]: choose the cause to target with two tests. It must be "within your control" and "closely connected to the outcome". Going deepest is a common misreading. [SEARCH] confirms the title and that it is the 2nd guide. |
| 3 | Craft a Clear Problem Statement | https://www.idg.gov.sg/guides-and-resources/productthinking3/ | A problem statement framework the repos call "the Four Cs". [REPO-QUOTE]: the goal is "one sharp, data-backed problem statement before any build begins." **The names of the four Cs are not confirmed.** The terms may only appear inside a graphic (see the glossary). [SEARCH] snippet tied to this pathway: "users and their problem statement should be kept at the core of every stage of the lifecycle, and it's important to be able to change the problem statement at any time to ensure that products delivered will always meet users' needs." |
| 4 | Metrics | https://www.idg.gov.sg/guides-and-resources/productthinking4/ | Outcome metrics, leading and lagging indicators, and the Value-Cost Ratio (VCR). [REPO-QUOTE]: "not all public-sector value can or should be expressed in dollars." [REPO-QUOTE]: ask not "what is my ratio" but "what would need to change to improve it?" [REPO-PARAPHRASE]: "Leading gives early feedback; lagging measures outcomes," and a leading indicator earns its place only if it causes the lagging one. The repo implies an exercise on mapping a chain from leading to lagging indicators. |
| 5 | Assumptions and Risks | https://www.idg.gov.sg/guides-and-resources/productthinking5/ | Test the riskiest assumptions as cheaply as possible before building. Case study: health appointment booking, which started on a FormSG form feeding a spreadsheet and used an A/B test. [REPO-QUOTE]: "this is not scalable, but it was the lowest-cost way to validate." [REPO-PARAPHRASE] of the result: zero bookings from control and 24 from treatment, with users sharing the link without being asked. |
| 6 | A Good Customer Experience | https://www.idg.gov.sg/guides-and-resources/productthinking6/ | Customer experience in services that people cannot opt out of, plus the 11-Star Framework. [REPO-QUOTE]: "This matters especially for essential public services, where people may not have alternatives." [REPO-PARAPHRASE]: "11-Star Framework: imagine an absurdly good experience, then work backwards to what is feasible," because starting from "what is realistic" anchors you to a mediocre product. |
| 7 | Key Takeaways | https://www.idg.gov.sg/guides-and-resources/productthinking7/ | A synthesis. [REPO-QUOTE]: define success "by the change achieved, not the features delivered." [REPO-PARAPHRASE]: "Outputs are what you delivered; outcomes are what changed." [REPO-PV] summarises the curriculum as "three shifts": "From solutions to problems", "From outputs to outcomes", and "From one big launch to staged delivery". **This may be the repo author's synthesis rather than IDG's wording. Unverified.** |

---

## 2. Glossary: core concepts and vocabulary

Exact IDG wording has not been verified for any entry, because no primary page loaded. Use the tags to judge each entry.

| Term | Definition and wording | Source |
|---|---|---|
| **Product thinking** | "understanding user needs and defining the right problem to solve before considering how technology can help". Learning should start with "What are we trying to do better?" rather than "What can AI do?" | [SEARCH] summarising the MDDI factsheet (https://www.mddi.gov.sg/newsroom/launch-of-institute-of-digital-government/) and the GovInsider launch article |
| **Problems before solutions** | "great digital products start with problems, not solutions." | [REPO-QUOTE], productthinking1 |
| **Root cause / "the Whys"** | "problems rarely have one root cause." Pick a cause that is "within your control" and "closely connected to the outcome". | [REPO-QUOTE] and [REPO-PARAPHRASE], productthinking2 |
| **Problem statement** | The goal is "one sharp, data-backed problem statement before any build begins." | [REPO-QUOTE], productthinking3 |
| **The Four Cs (problem statement)** | The two repos disagree, and **neither is verified**. servicelink-problem gives **Clarity, Consequence, Cause, Confirmation**, with Confirmation meaning "the evidence the problem exists". product-valley says: "IDG presents the Four Cs inside a graphic and never spells the four terms out in text", so its list is "a reconstruction, not a quotation". | [REPO-PARAPHRASE] for productthinking3. Needs checking against the graphic. |
| **Outputs vs outcomes** | Success is defined "by the change achieved, not the features delivered." | [REPO-QUOTE], productthinking7 |
| **Leading vs lagging indicators** | "Leading gives early feedback; lagging measures outcomes." The repo says this is "Straight from the module." | [REPO-PARAPHRASE], productthinking4 |
| **Value-Cost Ratio (VCR)** | Treat it as one input among other considerations. "not all public-sector value can or should be expressed in dollars." The useful question is "what would need to change to improve it?" | [REPO-QUOTE], productthinking4 |
| **SMART metrics** | "specific, measurable, achievable, relevant, time-bound" | [REPO-PV] only. It is not clear whether IDG uses this term. |
| **Riskiest assumption / lowest-cost validation** | "this is not scalable, but it was the lowest-cost way to validate." | [REPO-QUOTE], productthinking5 |
| **PoC, PoV, Scale, Maturity** (staged delivery) | "Proof of concept. Proof of value. Scale. Maturity." | [REPO-PV] only. Unverified as IDG wording. |
| **11-Star Framework** | Imagine an absurdly good experience, then work back to what is feasible. The exercise itself comes from Brian Chesky of Airbnb (general knowledge, not an IDG claim). | [REPO-PARAPHRASE], productthinking6 |
| **Essential services / no alternatives** | "This matters especially for essential public services, where people may not have alternatives." | [REPO-QUOTE], productthinking6 |
| **Swap Test** | "Swap the proposed thing for a different thing. Does the sentence still read as a sensible goal?" If it does, you are holding a solution, not a problem. | [REPO-PV] only. **Possibly not IDG.** |

---

## 3. Practical tools, templates and exercises

None of these was seen first-hand.

| Tool | Where | Notes |
|---|---|---|
| "Whys" causal chain exercise | productthinking2 | Map a chain of causes, then pick the link to target using the control and outcome tests. [REPO-PARAPHRASE] |
| Four Cs problem statement framework | productthinking3 | Reportedly presented as a graphic. The terms are unconfirmed. |
| Leading-to-lagging indicator chain mapping | productthinking4 | [REPO-PARAPHRASE]: "map your chain and you often find the metric you have been reporting is a leading indicator your team quietly started treating as the outcome itself." |
| Value-Cost Ratio calculation | productthinking4 | Formula not seen. [UNSOURCED] beyond its name and the caveats above. |
| Low-cost validation / A/B test (health appointment booking case study using FormSG and a spreadsheet) | productthinking5 | The case study is IDG's, according to the repo README. |
| 11-Star Framework exercise | productthinking6 | |
| Community learning games (unofficial) | https://github.com/melmelchew/servicelink-problem (play at https://melmelchew.github.io/servicelink-problem/) and https://github.com/rayray39/product-valley (play at https://rayray39.github.io/product-valley/) | Unofficial. Useful as an example of exercise design, and they include 8 and 33 quiz items respectively. |

I found no downloadable canvases or templates. The landing page may link some, but it was blocked.

---

## 4. Suggested learning sequence

- **Where product thinking sits in IDG's pathways.** [SEARCH] (MDDI): product thinking is "the foundation". Officers "first build foundational skills in product thinking" before AI-related courses. The AI ladder is reported as **AI Aware 101**, then **AI Apply 201**, then **AI Build 301**, with the product thinking guides inside AI Build 301.
- **Within product thinking**, follow the URL numbering, which looks like IDG's intended order:
  1. Understanding the Problem (problems, not solutions). This is the foundation.
  2. Start With The Whys (root cause). Foundation.
  3. Craft a Clear Problem Statement (Four Cs). Foundation.
  4. Metrics (outcomes, leading and lagging indicators, VCR). Intermediate.
  5. Assumptions and Risks (cheap validation). Intermediate to advanced.
  6. A Good Customer Experience (11-Star). Intermediate to advanced.
  7. Key Takeaways (outputs vs outcomes synthesis). Review.

  The split into foundation, intermediate and advanced is my inference from the order, not something IDG labels. servicelink-problem asks its "Key Takeaways" question 4th, before Metrics. That is a choice of game narrative, not evidence about IDG's order.
- **Further study:** the GovTech Digital Academy "Product Thinking for Organisations" course, which is organisation-level and aimed at PMs, PMOs and team leads (Section 5).

---

## 5. Communities of practice, events and courses

| Item | URL | Notes |
|---|---|---|
| Institute of Digital Government (launch) | https://www.mddi.gov.sg/newsroom/launch-of-institute-of-digital-government/ and https://www.mddi.gov.sg/newsroom/new-institute-of-digital-government-to-build-an-ai-ready-public-service/ | [SEARCH]: set up by MDDI with the Civil Service College. Reportedly launched 18 Sep 2026, and announced at COS 2026 (https://www.mddi.gov.sg/committee-of-supply/cos-2026/). The aim is to equip "more than 150,000 public officers" with digital, data and AI skills by end-2028. Nearly 150 senior leaders have done foundational training covering "product thinking, modernisation, cybersecurity & resilience, data and AI." |
| CRAFT by GovTech | URL not found | [SEARCH]: "a micro-learning platform offering bite-sized, practical lessons and practices contextualized to product work in government." A second search for CRAFT found nothing more. |
| GovTech Digital Academy: Product Thinking for Organisations | https://www.thedigitalacademy.tech.gov.sg/course/detail/product-thinking-for-organisation | [SEARCH]: 2 days in person (programme code D52). Outcomes: "Recommend steps for an organisation to implement product thinking", "Articulate the benefits and mindsets of product thinking", "Apply product thinking techniques and structures". Also offered as 4-week blended learning through NUS-ISS (https://www.iss.nus.edu.sg/executive-education/course/detail/product-thinking-for-organisations-/digital-products-platforms) and on MySkillsFuture (https://courses.myskillsfuture.gov.sg/courses/TGS-2020001490). |
| GovTech Digital Academy post on a product-centric mindset | https://www.thedigitalacademy.tech.gov.sg/posts/empowering-a-product-centric-mindset-through-govtech-digital-academy | Search result only. Not read. |
| GovTech GTO Practices portal (Product Practice) | https://public.practice.gto.tech.gov.sg/ | [SEARCH]: a unified documentation platform for GTO practices: Software Engineering, Product, Design, Data, AI and Ops. The Product Practice provides "product management guidelines, frameworks, and best practices." **Likely the richest related source. Fetch it once access is approved.** |
| GovTech PM Unconference | https://medium.com/aibots/3-takeaways-on-product-management-in-the-singapore-government-from-govtechs-first-pm-0a91a59e682c | [SEARCH]: a ground-up PM community event. The first one had about 30 PMs. |
| Product Community of Practice (PCoP) Forum, NUS-ISS (2018) | https://www.iss.nus.edu.sg/community/events/event-details/2018/04/06/default-calendar/the-2nd-product-community-of-practice-(pcop)-forum-a-conversation-the-product-thinking-mindset | A historical event: "2nd PCoP Forum: a conversation on the product thinking mindset". |
| Digital Service Standards (DSS) | https://www.tech.gov.sg/products-and-services/for-government-agencies/digital-service-standards/ and https://info.standards.tech.gov.sg/control-catalog/dss/ | [SEARCH]: "set the baseline for usability and accessibility across all Singapore Government digital services". Incorporates WCAG Levels A and AA. Principles: "Intuitive Design and Usability, Accessibility and Inclusivity, and Relevance and Consistency." |
| Singapore Government Design System (SGDS) | https://www.designsystem.tech.gov.sg/ and https://github.com/GovTechSG/sgds | [SEARCH]: components, patterns and templates aligned with the DSS and WCAG. Version 3 is current. Open source. |

---

## 6. Pages I could not access

Every URL below returned **HTTP 403 "Approval required for <host>:443"** from the sandbox egress proxy, through both WebFetch and curl:

- https://www.idg.gov.sg/product-thinking/
- https://www.idg.gov.sg/ai-build-301/
- https://www.idg.gov.sg/guides-and-resources/productthinking1/ through productthinking7/ (the whole host is blocked, so I did not request these one by one)
- https://www.mddi.gov.sg/newsroom/launch-of-institute-of-digital-government/
- https://www.thedigitalacademy.tech.gov.sg/course/detail/product-thinking-for-organisation
- https://www.tech.gov.sg/, https://www.designsystem.tech.gov.sg/, https://www.developer.tech.gov.sg/, https://info.standards.tech.gov.sg/, https://public.practice.gto.tech.gov.sg/
- https://www.dsaid.gov.sg/, https://www.csc.gov.sg/, https://courses.myskillsfuture.gov.sg/
- https://govinsider.asia/, https://medium.com/, https://www.iss.nus.edu.sg/
- Workarounds I tried, which were also blocked: https://web.archive.org/..., https://r.jina.ai/...

Reachable: github.com and api.github.com, which is how I got the two community repos.

**Still open even after access is granted:**
- The full contents of the landing page. It may link templates, courses or a community that is not listed here.
- The exact names of the Four Cs.
- How VCR is calculated.
- Whether "three shifts", "Swap Test", "SMART" and "PoC/PoV/Scale/Maturity" are IDG's terms.
- A URL for CRAFT by GovTech.
- The AI Aware 101 URL.
