# Scenario D Brief

Source: `Keyloop Coding Challange.pdf`.

## Chosen Scenario

**Scenario D: The Unified Document Viewer**

- **Domain:** Operate
- **Task:** Build a Unified Document Viewer that provides a single view of all documents related to a vehicle by connecting to two mocked dealership systems.

## Core Requirements

1. Provide a single search interface where a user can enter a VIN.
2. The backend must make parallel requests to two mocked external APIs:
   - Sales System API
   - Service System API
3. The UI must display one consolidated list of documents from both sources and clearly identify the source system for each document.

## Submission Requirements

- System Design Document with architecture, component roles, data flow, technology choices, observability strategy, and GenAI design-phase usage.
- Working code with README, build/run/test instructions, AI Collaboration Narrative, and tests for core business logic.
- 5-10 minute video covering introduction, design, implementation highlights, AI collaboration, demo, and learnings.

## Chosen Implementation Layer

Backend-first implementation:

- REST API implemented fully.
- Persistent database used for audit records.
- Frontend represented by API contract, cURL examples, and demo script.
