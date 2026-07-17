# AI Evaluation Specification

## Purpose

GPT-5.6 provides formative educational feedback.

The evaluation system is not:

- A hiring system
- An academic grading system
- A psychological assessment
- An emotion detector
- An employability predictor

## Evaluation Pipeline

Question

→ Learner Response

→ Transcript

→ Server-Side Validation

→ GPT-5.6 Evaluation

→ Structured Output Validation

→ Feedback Report

→ Lesson Recommendation

→ Retry Activity.

## Interview Rubric

Each criterion uses a score from 0 to 4.

## Relevance

0:
Does not address the question.

1:
Minimally related.

2:
Partially answers the question.

3:
Clearly answers the question.

4:
Direct, complete, and focused.

## Structure

0:
No understandable organization.

1:
Very difficult to follow.

2:
Some organization.

3:
Clear logical progression.

4:
Strong structure appropriate to the question.

## Specificity

0:
No concrete details.

1:
Mostly vague statements.

2:
Some relevant details.

3:
Clear concrete examples.

4:
Specific and meaningful evidence.

## STAR Completeness

0:
No identifiable STAR components.

1:
One component is meaningfully present.

2:
Two components are meaningfully present.

3:
Three components are meaningfully present.

4:
Situation, Task, Action, and Result are clearly communicated.

Only use STAR Completeness when the question is appropriate for a STAR response.

## Reflection and Outcome

0:
No result, outcome, or reflection.

1:
Outcome is unclear.

2:
Mentions an outcome.

3:
Explains the result or lesson learned.

4:
Shows clear outcome and thoughtful reflection.

## Clarity

Evaluate:

- Understandable sentence structure
- Organization of ideas
- Unnecessary repetition
- Ability to follow the response

Do not penalize users simply for having an accent.

## Delivery Indicators

Possible descriptive indicators:

- Approximate speaking pace
- Filler-word frequency
- Long pauses
- Response duration
- Volume consistency when technically reliable

Delivery indicators must not be treated as universal measures of competence.

## Structured Output

GPT-5.6 should return structured data matching a validated schema.

Required fields:

summary

strengths

improvements

rubric

recommendedLessonId

nextPracticeAction

improvedExample

Each rubric criterion should contain:

score

explanation

evidence

improvementAction

## Example Structure

{
"summary": "",
"strengths": [],
"improvements": [],
"rubric": {
"relevance": {
"score": 0,
"explanation": "",
"evidence": "",
"improvementAction": ""
},
"structure": {
"score": 0,
"explanation": "",
"evidence": "",
"improvementAction": ""
},
"specificity": {
"score": 0,
"explanation": "",
"evidence": "",
"improvementAction": ""
},
"starCompleteness": {
"score": 0,
"explanation": "",
"evidence": "",
"improvementAction": ""
},
"reflection": {
"score": 0,
"explanation": "",
"evidence": "",
"improvementAction": ""
},
"clarity": {
"score": 0,
"explanation": "",
"evidence": "",
"improvementAction": ""
}
},
"recommendedLessonId": "",
"nextPracticeAction": "",
"improvedExample": ""
}

## Evidence Rules

Evidence must come from the learner transcript.

Do not fabricate quotes.

If sufficient evidence does not exist, state that clearly.

## Recommendation Rules

Lesson recommendations must map to real lessons.

Example mappings:

Missing Result
→ star-result

Vague answer
→ answer-specificity

Poor organization
→ answer-structure

Repeated filler words
→ reducing-filler-words

Unclear opening
→ clear-answer-openings

## Feedback Style

Feedback must be:

- Specific
- Concise
- Actionable
- Respectful
- Educational

Avoid generic praise.

Avoid exaggerated claims.

Avoid pretending the AI evaluation is perfectly accurate.
