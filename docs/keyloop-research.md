# Keyloop Research Notes for Scenario D

These notes summarize the public product context used during the design phase. They are included to show how the technical solution was grounded in Keyloop's domain, not to claim access to private Keyloop systems or real Keyloop APIs.

## Research Objective

This document connects Keyloop's public product philosophy to Scenario D, the Unified Document Viewer. The goal is to make the challenge submission feel grounded in Keyloop's actual business context instead of reading like a generic coding exercise.

Scenario D asks for a single VIN search interface that aggregates vehicle documents from two mocked dealership systems: a Sales System API and a Service System API. This maps naturally to Keyloop's stated focus on connected automotive retail, open platform integration, and operational efficiency.

## Keyloop Philosophy

### Experience-First Automotive Retail

Keyloop presents Fusion as an automotive retail platform that supports the full retail journey and improves the experience for both retailers and consumers. The important idea for Scenario D is that experience quality is affected by fragmented systems, repeated data entry, and incomplete context.

Relevant source: [Fusion Automotive Retail Platform](https://keyloop.com/fusion-arp)

Key product ideas to reflect in the challenge:

- Reduce disjointed journeys across departments and systems.
- Give dealership staff better visibility into consumers and vehicles.
- Use connected data to improve speed, transparency, and confidence.
- Support omnichannel workflows where online, in-store, sales, and aftersales context should remain connected.

Scenario D should therefore be framed as a workflow continuity problem: dealership users should not have to switch between sales and service tools or manually reconcile records when answering a vehicle-related question.

### Operate Domain Fit

Keyloop's Fusion platform is organized into domains: Demand, Supply, Ownership, and Operate. Scenario D fits best with the Operate domain because it is about unifying data from different dealership systems and making operational work faster and less error-prone.

Relevant source: [Fusion Automotive Retail Platform](https://keyloop.com/fusion-arp)

Operate-oriented positioning:

- Connect systems in real time.
- Let data flow between systems with high availability.
- Reduce repeated manual entry.
- Improve agility and operational efficiency.

The Unified Document Viewer should therefore be designed as an operational integration layer: it hides fragmentation from the user while preserving source-system transparency.

### Open Platform Mindset

The Keyloop Developer portal describes Keyloop's Open Platform as a single interface to dealer management systems across multiple regions. It lists APIs across inventory, customer vehicles, vehicle contracts, ownership changes, service history, inspections, service appointment booking, sales leads, sales activities, event subscriptions, and aftersales video workflows.

Relevant source: [Keyloop Developer](https://developer.keyloop.io/)

Scenario D should align with this platform mindset:

- Use stable API contracts.
- Normalize data from different systems into a consistent response shape.
- Preserve source-system metadata instead of hiding data lineage.
- Treat external system failure as an expected integration condition.
- Make the integration observable and diagnosable.

### Connected DMS and Partner Ecosystem

Keyloop's DMS messaging emphasizes an open, collaborative, flexible platform that connects retailers, manufacturers, and partner applications. It also emphasizes real-time connectivity, data sharing, insights, powerful integrations, and easy access to accurate real-time data.

Relevant source: [Keyloop DMS](https://keyloop.com/en-ca/dms)

Scenario D can echo this by treating the Sales System and Service System as two systems in a broader dealership ecosystem. The solution should not assume that all source systems behave identically. Instead, it should use adapters to isolate upstream contracts from the internal document model.

### Company Values

Keyloop's public careers page highlights three values: Bold, Authentic, and United.

Relevant source: [Keyloop Careers](https://keyloop.com/en-ca/empowering-auto-careers)

How to reflect these values in the challenge:

- Bold: choose a design that handles realistic integration failures, not just the happy path.
- Authentic: document assumptions, trade-offs, and AI usage clearly.
- United: design the workflow around multiple dealership roles and systems working together.

## Implications for Scenario D

The strongest product framing is:

> A dealership user needs one reliable place to search a VIN and see all related vehicle documents from sales and service systems, without switching tools, re-entering data, or manually reconciling inconsistent records.

The strongest technical framing is:

> A backend aggregation service accepts a VIN, queries sales and service document systems in parallel, normalizes the results, returns a consolidated document list with source metadata, and persists audit data for observability and support.

## Submission Angle Used

The submission keeps the main evaluation story focused on integration quality:

- Clean API boundary.
- Parallel upstream calls.
- Normalized document contract.
- Partial failure handling.
- Structured logging and audit persistence.
- Clear source-system visibility.
- Tests that prove correctness beyond the happy path.

This shows product understanding, system design judgment, and ownership of an AI-assisted solution.
