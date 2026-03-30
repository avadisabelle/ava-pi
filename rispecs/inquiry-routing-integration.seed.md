# SEED — Inquiry Routing Integration for ava-pi

> Status: 🌱 Seed (future-oriented, not an implementation spec)
> Upstream: `ava-langchain-inquiry-routing@0.1.0`, `ava-langgraph-inquiry-routing-engine@0.1.0`
> Conceptual ancestor: medicine-wheel-pi `inquiry-router.md`

## Desired Outcome

ava-pi's agent pipeline system integrates inquiry routing as a first-class pipeline stage. When a pipeline runs PDE decomposition, the resulting `DecompositionResult` flows into the `InquiryRoutingGraph` to produce classified, relationally-enriched inquiries before tool execution. The medicine-wheel-pi `inquiry-router.md` conceptual prototype finds its production implementation here.

## Current Reality

- ava-pi has pipeline infrastructure (`packages/`) but no inquiry routing stage
- medicine-wheel-pi defined the *concept* of directional inquiry routing but as prose, not executable code
- No connection between PDE output and structured inquiry classification

## Structural Tension

medicine-wheel-pi envisioned inquiry routing; `ava-langchain-inquiry-routing` implemented it as chain primitives; ava-pi needs to *embed* it as a pipeline stage. The tension between conceptual prototype and production pipeline resolves through integrating the published packages.

## Integration Path

1. **Add dependencies:**
   - `ava-langchain-inquiry-routing: >=0.1.0`
   - `ava-langgraph-inquiry-routing-engine: >=0.1.0`

2. **Pipeline stage:** Create an `InquiryRoutingStage` that accepts `DecompositionResult` and produces `InquiryRoutingState`

3. **Ceremony awareness:** Pipeline must respect `ceremony_hold` — do not auto-advance past validation when `ceremonyRequired === true`

4. **Directional dispatch:** Use `FormattedDispatch` payloads to feed downstream pipeline stages (QMD queries, deep-search calls, workspace scans)

5. **Lineage link:** Document medicine-wheel-pi `inquiry-router.md` as conceptual ancestor in pipeline stage metadata

## RISE Compliance

| Phase | Status |
|-------|--------|
| **R**everse-engineer | 🌱 Pending — analyze ava-pi pipeline architecture and medicine-wheel-pi precedent |
| **I**ntent-extract | 🌱 Seed — intent is pipeline-integrated inquiry routing with ceremony gating |
| **S**pecify | 🌱 This seed |
| **E**xport | ⏳ Not started |
