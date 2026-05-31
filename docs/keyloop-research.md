# Keyloop Research Notes for Scenario D

These notes capture the public product context I used while choosing and shaping Scenario D. They do not claim access to private Keyloop systems or real Keyloop APIs.

## Research Objective

This document connects Keyloop's public product direction to Scenario D, the Unified Document Viewer.

Scenario D asks for a single VIN search interface that aggregates vehicle documents from two mocked dealership systems: a Sales System API and a Service System API. That fits Keyloop's public focus on connected automotive retail and open platform integration.

## Keyloop Philosophy

### Experience-First Automotive Retail

Keyloop presents Fusion as an automotive retail platform for the retail journey across retailers and consumers. For Scenario D, the relevant point is fragmentation: document lookup becomes slower and less trustworthy when sales and service context live in separate tools.

Relevant source: [Fusion Automotive Retail Platform](https://keyloop.com/fusion-arp)

Product ideas reflected in the challenge:

- Reduce disjointed journeys across departments and systems.
- Give dealership staff better visibility into consumers and vehicles.
- Use connected data to improve speed and confidence.
- Support omnichannel workflows where online, in-store, sales, and aftersales context should remain connected.

I framed Scenario D as a workflow continuity problem: a dealership user should not have to switch between sales and service tools or manually reconcile records to answer a vehicle-related question.

### Operate Domain Fit

Keyloop's Fusion platform is organized into domains: Demand, Supply, Ownership, and Operate. Scenario D fits best with the Operate domain because it is about unifying data from different dealership systems and making operational work faster and less error-prone.

Relevant source: [Fusion Automotive Retail Platform](https://keyloop.com/fusion-arp)

Operate-oriented positioning:

- Connect systems in real time.
- Let data flow between systems with high availability.
- Reduce repeated manual entry.
- Improve agility and operational efficiency.

The Unified Document Viewer is an operational integration layer: it hides fragmentation from the user while preserving source-system transparency.

### Open Platform Mindset

The Keyloop Developer portal describes Keyloop's Open Platform as a single interface to dealer management systems across multiple regions. It lists APIs across inventory, customer vehicles, vehicle contracts, ownership changes, service history, inspections, service appointment booking, sales leads, sales activities, event subscriptions, and aftersales video workflows.

Relevant source: [Keyloop Developer](https://developer.keyloop.io/)

Scenario D follows the same integration pattern:

- Use stable API contracts.
- Normalize data from different systems into a consistent response shape.
- Preserve source-system metadata instead of hiding data lineage.
- Treat external system failure as an expected integration condition.
- Make the integration observable and diagnosable.

### Connected DMS and Partner Ecosystem

Keyloop's DMS messaging describes an open platform that connects retailers, manufacturers, and partner applications. It also talks about real-time connectivity, data sharing, integrations, and access to accurate data.

Relevant source: [Keyloop DMS](https://keyloop.com/en-ca/dms)

Scenario D follows that shape by treating the Sales System and Service System as separate systems in the dealership ecosystem. The implementation uses adapters so each upstream contract stays isolated from the internal document model.

### Company Values

Keyloop's public careers page highlights three values: Bold, Authentic, and United.

Relevant source: [Keyloop Careers](https://keyloop.com/en-ca/empowering-auto-careers)

How I reflected those values:

- Bold: choose a design that handles realistic integration failures, not just the happy path.
- Authentic: document assumptions, trade-offs, and AI usage clearly.
- United: design the workflow around multiple dealership roles and systems working together.

## Implications for Scenario D

The strongest product framing is:

> A dealership user needs one reliable place to search a VIN and see all related vehicle documents from sales and service systems, without switching tools, re-entering data, or manually reconciling inconsistent records.

The strongest technical framing is:

> A backend aggregation service accepts a VIN, queries sales and service document systems in parallel, normalizes the results, returns a consolidated document list with source metadata, and persists audit data for observability and support.

## Submission Angle

The submission keeps the main story focused on integration quality:

- Clean API boundary.
- Parallel upstream calls.
- Normalized document contract.
- Partial failure handling.
- Readable workflow logs and audit persistence.
- Clear source-system visibility.
- Tests that prove correctness beyond the happy path.

That is the part of the problem I chose to solve fully.
