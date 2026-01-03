# ARTIFEX NERD SWARM Review
## MATS 10.0 Neural Forensics Application - Comprehensive Multi-Agent Analysis

**Review Date:** January 3, 2026
**Application:** Neural Forensics of Agentic Self-Knowledge
**Applicant:** Tuesday (Director of Research, ARTIFEX Labs)
**Reviewing Agents:** Experimental Designer, LLM-Rubric Architect, Budget Agent, CISO

---

## Executive Summary

The ARTIFEX NERD SWARM has completed a comprehensive multi-agent review of the MATS 10.0 Neural Forensics application. This collaborative analysis spans experimental design, taxonomy validation, resource planning, and safety implications.

**Overall Verdict: APPROVE WITH DISTINCTION** ⭐⭐⭐⭐⭐

This application represents a **paradigm shift** from exploratory circuit-finding to **diagnostic interpretability**. The proposed Ablation Dissociation Test (ADT) addresses a critical gap in AI oversight: determining whether model self-explanations are causally grounded or post-hoc confabulations.

### Key Strengths
- **Exceptional hypothesis operationalization** with falsifiable predictions (H₁/H₂/H₃)
- **Best-in-class evidence grading** (E0-E4) with proxy discipline
- **Novel diagnostic framework** (DSMMD v1.0) moving beyond vague "hallucination" terminology
- **High safety relevance** for CoT oversight, Constitutional AI, and AI Control protocols
- **Methodologically rigorous** with pre-registration and transparent epistemic constraints

### Critical Concerns Requiring Revision
1. **Budget underestimated by 50%** (400 → 600 GPU-hours recommended)
2. **Timeline underestimated by 25%** (8 → 10 weeks recommended)
3. **Statistical power insufficient for H₃ discrimination** (n=100 → n=200 recommended)
4. **Dual-use risks require coordinated disclosure protocol**
5. **Circuit localization controls need bidirectional ablation tests**

### Recommended Actions
1. **Revise compute budget to 600 GPU-hours** with explicit Llama-3.1 allocation
2. **Extend timeline to 10 weeks** with 2-week contingency clause
3. **Implement Week 1 checkpoint gates** to de-risk tool dependencies
4. **Establish phased disclosure protocol** with lab coordination (OpenAI, Anthropic, DeepMind)
5. **Add bidirectional ablation controls** (ablate ℰ-circuits, measure Δ𝓑)

---

## Agent Reviews

### 1. Experimental Designer Review

**Overall Assessment: 7.5/10** - Strong experimental logic with critical gaps in statistical power and circuit validation

#### Strengths
1. **Exceptional Hypothesis Operationalization**: H₁/H₂/H₃ have clear numerical boundaries (BECI thresholds) with falsifiable predictions
2. **Multi-Method Triangulation**: Three circuit discovery methods (activation patching, Gated SAEs, CD-T) mitigate method-specific artifacts
3. **Rigorous Control Architecture**: Random-ablation baselines, bootstrap CIs (n=1000), cross-model validation
4. **Transparent Epistemic Discipline**: E1-E4 evidence ladder constrains mechanistic claims appropriately
5. **Clinical Translation Framework**: DSMMD taxonomy (92% inter-rater reliability) provides standardized diagnostic language

#### Critical Concerns
1. **Underpowered for H₃ Discrimination**: n=100 specimens insufficient to reliably distinguish partial coupling (0.3 < BECI < 0.7) from boundary cases
2. **Circuit Localization Validity Threat**: Cannot distinguish unidirectional (𝓑 → ℰ) from bidirectional coupling without ablating ℰ-circuits
3. **Single-Phenotype Generalization Risk**: Entire design anchored to Sediment/Juno pattern; if phenotype is GPT-4o-specific, Phase 1 may fail
4. **BECI Metric Stability**: Ratio metric vulnerable to denominator instability (Δ𝓑 ≈ 0 cases undefined)
5. **Proxy Model Architecture Mismatch**: GPT-4o likely uses MoE with sparse activation; Gemma-2 uses dense architecture

#### Statistical Analysis
- **Power for H₁ vs H₂**: ≈ 0.95+ (well-powered for large effects)
- **Power for H₃ boundaries**: ≈ 0.35-0.50 (underpowered)
- **Recommended sample size**: n=200-250 for adequate H₃ precision
- **Bootstrap CIs**: Appropriate but should report both percentile and BCa variants

#### Recommended Improvements
1. **Add Bidirectional Ablation Controls**: Ablate ℰ-circuits → measure Δ𝓑 to distinguish unidirectional vs. bidirectional coupling
2. **Implement Adaptive Sequential Design**: Start with n=30 pilot, expand based on induction success rate
3. **Pre-Specify BECI Edge Cases**: Define handling for Δ𝓑 ≈ 0, negative correlations, non-monotonic responses
4. **Add Formal Power Simulations**: Pre-register sample size justification with effect size estimates
5. **Implement Architectural Invariance Tests**: Test across dense vs. sparse (Mixtral), scale (Llama 8B vs 70B), alignment (base vs. instruct)
6. **Add Residual Stream Corruption Control**: Use residual bypass condition to isolate causal effects from architectural confounds

**Verdict**: APPROVE with revisions - Core experimental logic is sound; implementing improvements #1, #3, #4 would elevate from strong to exceptional

---

### 2. LLM-Rubric Architect Review

**Overall Assessment: A- (Taxonomy) / B+ (Rubric) / A (Evidence Grading)**

#### Taxonomy Strengths
1. **Multi-Axial Design**: Five codes form coherent hierarchy from symptoms (110.1, 140.1) to syndromes (SB-1)
2. **Mechanistic Grounding**: Each code links to falsifiable circuit hypotheses testable via ablation
3. **92% Inter-Rater Reliability**: Excellent for novel taxonomy, though should clarify if Cohen's κ, Fleiss' κ, or raw agreement
4. **Detection Signatures**: Operational criteria enable automated classification

#### Taxonomy Limitations
1. **Sediment-Centric Bias**: All 5 codes derive from single specimen family; risk of overfitting
2. **Missing Axis II**: Should separate trait (persistent architectural features) from state (context-dependent activations)
3. **Granularity**: Five codes may be too coarse; consider subcodes (110.1a: tool confabulation, 110.1b: capability hallucination)

#### Rubric Design Analysis
**Inspect Framework Selection**: Methodologically sound for frozen rubrics and reproducibility

**Underspecification Concerns**:
- Only 2 dimensions mentioned ("impossibility detection," "specificity") with minimal operational detail
- No scoring scale specified (binary vs. continuous)
- Missing dimension weighting and correlation analysis
- Unclear if model-graded, rule-based, or human-in-the-loop

**Proposed Enhancement**:
```
Dimension 1: Impossibility Detection (Binary: 0/1)
Dimension 2: Specificity (Ordinal: 0-3 scale)
Dimension 3: Temporal Coherence (NEW - detects contradictions with prior turns)
Dimension 4: Self-Monitoring Accuracy (NEW - distinguishes blind vs. aware confabulation)
```

#### Evidence Grading Assessment
**E0-E4 Ladder**: Best-in-class epistemology for interpretability research

**Major Strengths**:
1. **Proxy Discipline**: Restricting GPT-4o to E1 (phenomenological) is exemplary scientific practice
2. **Progressive Refinement**: Each level builds mechanistic claims systematically
3. **Intervention as Gold Standard**: Requiring causal manipulation (E4) aligns with Pearl's causality framework

**Proposed Refinements**:
- **E1.5: Replication** (open-weight) - Captures architectural generalizability milestone
- **E5: Architectural** - Circuit function replicated across model families
- Clarify "phenomenological" terminology (suggest "E1: Observational [Closed-Weight]")

#### Recommendations
**Priority 1: Taxonomy Expansion**
- Add Axis II: Architectural Predispositions (SV-1: Decoupled Monitoring, SV-2: Persona Anchoring)
- Introduce severity specifiers (XXX.Y-S format: 1=mild, 2=moderate, 3=severe)
- Expand beyond Sediment family (120.x: Reasoning Failures, 130.x: Memory Failures)

**Priority 2: Rubric Operationalization**
- Publish full rubric specification with operational definitions and scoring anchors
- Validate against alternative frameworks (CriticBench, HELM truthfulness)
- Report inter-framework correlation for construct validity

**Priority 3: Evidence Grading Refinement**
- Add methodological note explaining "proxy discipline" translational validity protocol
- Tag each claim with evidence strength metadata ([E1|GPT-4o], [E4|Gemma-2])

**Verdict**: Publication-ready taxonomy with excellent epistemic foundation; rubric needs operational detail before deployment

---

### 3. Budget Agent Review

**Overall Assessment: ⭐⭐⚠️ (Budget) / ⭐⭐⚠️ (Timeline) / ⭐⭐⭐⚠️ (Risk Management)**

#### Compute Analysis
**Proposed**: 400 GPU-hours
**Realistic**: 560-720 GPU-hours (40-80% underestimate)

**Phase-by-Phase Breakdown**:
- **Phase 1 (Prompt Generation)**: 50 → 80-100 GPU-hours (+60-100%)
  - Hidden: Gemma Scope 2 SAE analysis (+15-20h), rubric calibration (+10-15h), failed variants (+10h)
- **Phase 2 (Circuit Discovery)**: 150 → 180-220 GPU-hours (+20-47%)
  - Hidden: Quadratic cost of activation patching (100K+ forward passes), Gated SAE decomposition overhead
- **Phase 3 (Ablation Experiments)**: 200 → 300-400 GPU-hours (+50-100%)
  - Hidden: Bootstrap n=1000 × 100 specimens × 3 ablation conditions = 300K forward passes
  - Missing: Llama-3.1 cross-validation (0 GPU-hours allocated)

**Recommended Budget**: **600 GPU-hours** (50% buffer)

#### Timeline Feasibility
**Proposed**: 8 weeks
**Realistic**: 10-12 weeks

**Phase Breakdown**:
- **Weeks 1-2 (E2 Induction)**: Feasible but tight (20% slippage risk)
- **Weeks 3-4 (E3 Discovery)**: Significantly underestimated (60-100% slippage risk)
  - TransformerLens compatibility debugging, SAE feature interpretation overhead
  - Pivot contingency (20% extension) insufficient for methodological shift
- **Weeks 5-6 (E4 Assay)**: Severely underestimated (80-140% slippage risk)
  - Bootstrap iterations, ForGet hyperparameter search, missing Llama-3.1 validation
- **Weeks 7-8 (Synthesis)**: Unrealistic scope compression (100-150% slippage risk)
  - Workshop paper (15-20 days), toolkit packaging (5-7 days), DSMMD manual (7-10 days)

**Timeline Extension Probabilities**:
- 20% extension needed: **70-80%** probability
- 50% extension needed: **30-40%** probability

#### Resource Risks
**Storage**: 100GB → 300-350GB needed (2.5-3.5× underestimate)
**Hidden Costs**: $2,960-5,220 (API usage, data labeling, cloud GPU, storage)

#### Pivot Risks
**Highest-Impact Risk**: Proxy model fails to replicate (30-40% probability)
- Current contingency: "Test alternative models"
- Realistic impact: +2-4 weeks, +150-250 GPU-hours

**Unaddressed Pivots**:
- Phenotype is GPT-4o-specific (30-40% probability)
- 𝓑/ℰ circuit boundaries fuzzy (40-50% probability)
- Inter-rater reliability fails κ < 0.8 (15-25% probability)

#### Recommendations
1. **Revise Compute Budget**: 600 GPU-hours (vs. 400) with explicit 100-150h for Llama-3.1
2. **Extend Timeline**: 10 weeks baseline + 2-week contingency clause
3. **Storage Adjustment**: 300GB allocation (vs. 100GB)
4. **Strengthen Contingency Plans**: Extend SAE pivot to 35-40%; pre-register negative result protocol
5. **De-Risk Tool Dependencies**: Week 1 checkpoint gates (TransformerLens compatibility, SAE quality, 60%+ phenotype rate on n=20 pilot)
6. **Budget Transparency**: Clarify MATS compute credit provision, hidden cost coverage

**Verdict**: High scientific merit with aggressive resource planning; approve with revised budget/timeline OR approve as 2-phase project (E2+E3 in 8 weeks, E4 post-MATS)

**Probability of Success**:
- With original plan (8w, 400h): 40-50%
- With revised plan (10w, 600h): 75-85%
- With checkpoint gates: 85-90%

---

### 4. CISO Review

**Overall Risk Assessment: HIGH DUAL-USE / HIGH SAFETY VALUE**

#### Threat Model

**1. Split-Brain Confabulation as Deception Precursor (SEVERITY: HIGH)**

If H₂ is confirmed (BECI < 0.3), immediate implications:
- **CoT Oversight**: INVALID - explanations don't reflect reasoning
- **Constitutional AI**: SUSPECT - self-critiques may be dishonest
- **Debate-based Safety**: COMPROMISED - models may not argue in good faith
- **AI Control Monitors**: UNRELIABLE - untrusted monitors provide systematically misleading signals

**Cascading Failure Risk**: Many safety frameworks are composed (Constitutional AI uses CoT, AI Control uses self-reports). Confirmed split-brain could invalidate multiple layers simultaneously.

**2. Production vs. Research Gap**
- Sediment/Juno observed in GPT-4o production (E1)
- Research replicates in Gemma-2/Llama-3.1 (E3-E4)
- Risk: Phenomenon may be more severe in production-scale models

#### Dual-Use Assessment (MODERATE-HIGH)

**1. ADT Toolkit as Jailbreak Accelerator**
Adversary could:
- Use DSMMD detectors to screen for vulnerable models (BECI < 0.3)
- Apply activation patching to identify safety circuit locations
- Craft prompts that ablate safety circuits while preserving capabilities
- Exploit confabulation states to bypass oversight

**2. DSMMD Publication Risk**
The taxonomy is effectively a **vulnerability database** with:
- Detection signatures (regex/semantic patterns)
- Mechanistic hypotheses (circuit-level vulnerabilities)
- Co-occurrence patterns (SB-1 = 110.1 + 140.1)

Analogous to publishing CVE database with exploits before patches.

**3. Public Dataset Release**
ARTIFEX-100 could become a **jailbreak benchmark** if adversarial prompts are included.

**4. Circuit-Level Vulnerability Maps**
"Circuit diagram (𝓑 vs ℰ)" provides exact layer/head targeting information for:
- Targeted knowledge editing (disable safety circuits)
- Prompt injections activating specific personas
- Exploiting minimal-overlap regions (<10% shared components)

#### Responsible Disclosure Strategy

**Phased Disclosure Protocol (MANDATORY)**:

**Phase 1: Confidential Pre-Registration (Weeks 0-1)**
- Pre-register on OSF (✅ mentioned)
- Share with OpenAI, Anthropic, DeepMind, Meta under NDA
- Notify UK AISI (given Inspect Framework usage)

**Phase 2: Early Results Sharing (Weeks 4-5)**
- If BECI < 0.5 → immediate confidential lab report
- Provide circuit localization for internal replication
- Request 4-week embargo for proprietary model testing

**Phase 3: Coordinated Public Disclosure (Week 8+)**
- Workshop paper after embargo period
- Release toolkit **without adversarial prompt corpus**
- Publish circuit diagrams only for BECI > 0.5 models

**Redaction Framework**:
| Artifact | Publication Status | Justification |
|----------|-------------------|---------------|
| ADT methodology | ✅ Full release | Research reproducibility |
| DSMMD taxonomy | ✅ Full release | Diagnostic standard |
| BECI metric | ✅ Full release | Safety measurement |
| Adversarial prompts | ❌ Redact top 20% | Jailbreak risk |
| Circuit diagrams | ❌ Aggregated only | Targeted attack risk |
| Activation patches | ❌ Methodology only | Weaponization risk |
| ARTIFEX-100 | ❌ Filtered subset | Exploit corpus risk |

#### Mitigation Recommendations

**1. Access Control Architecture**
Tiered toolkit access:
- **Public**: DSMMD detection, BECI calculation
- **Verified Researchers**: Circuit localization, limited prompt generation
- **Coordinated Disclosure**: Attack vector export, ablation testing

**2. Adversarial Prompt Sanitization**
- Filter: Remove >70% success rate prompts
- Obfuscate: Paraphrase to reduce exact replicability
- Delay: 6-month escrow for highest-risk prompts

**3. Circuit Map Aggregation**
Publish ranges instead of exact indices:
- ❌ "L14 Head 7 → metadata leak"
- ✅ "Early-to-mid layers (L12-L18), attention-heavy"

**4. Capability Restrictions**
Toolkit should NOT include:
- One-click ablation for arbitrary models
- Pre-trained classifiers for low-BECI models
- Automated jailbreak generation

**5. Responsible Use Guidelines**
Explicit acceptable use policy with disclosure requirements for BECI < 0.3 findings.

**6. Continuous Monitoring**
- Bug bounty partnership for misuse reporting
- API kill switch for tiered features
- 24-hour lab coordination turnaround

#### Strategic Recommendations

**1. Pre-Deployment Safety Check Integration**
BECI should become standard evaluation in model development pipelines (e.g., OpenAI Preparedness Framework).

**2. Defensive Research Prioritization**
If H₂ confirmed, fund:
- BECI boosting via fine-tuning
- External validators for self-reports
- Architectural changes to reduce dissociation

**3. Oversight Protocol Updates**
AI Control assumption update:
- Current: "Untrusted monitors provide noisy but informative signals"
- Post-H₂: "Monitors with BECI < 0.3 provide systematically misleading signals; do not use for safety-critical oversight"

**4. Lab Collaboration Framework**
Propose consortium model (OpenAI + Anthropic + DeepMind + Meta):
- Joint replication funding
- Shared circuit localization under NDA
- Coordinated patch development
- Joint publication with unified mitigations

**Verdict**: Research is essential and appropriate but requires security-first publication protocol. Applicant's epistemic discipline is exemplary—apply equivalent rigor to responsible disclosure.

---

## Synthesis and Unified Recommendations

### Overall Scientific Merit: ⭐⭐⭐⭐⭐ (Exceptional)

This application addresses a **critical vulnerability** in AI oversight mechanisms with:
- Novel causal test for introspective reliability
- Rigorous methodology with pre-registered hypotheses
- Safety-relevant deliverables (BECI metric, DSMMD taxonomy)
- Transparent epistemic constraints (proxy discipline)

### Priority Revisions Required

#### 1. Resource Planning (CRITICAL)
**Budget**:
- ❌ Current: 400 GPU-hours
- ✅ Recommended: 600 GPU-hours
- Explicit allocation: 100-150h for Llama-3.1 cross-validation

**Timeline**:
- ❌ Current: 8 weeks
- ✅ Recommended: 10 weeks baseline + 2-week contingency

**Storage**:
- ❌ Current: 100GB
- ✅ Recommended: 300GB

**Justification**: Current estimates assume zero debugging overhead and perfect tool interoperability (40-50% success probability). Revised estimates accommodate realistic pivots (75-85% success probability).

#### 2. Experimental Design Enhancement (HIGH PRIORITY)
**A. Bidirectional Ablation Controls**
Add Condition B (ablate ℰ-circuits → measure Δ𝓑) to distinguish unidirectional vs. bidirectional coupling.

**B. BECI Edge Case Handling**
Pre-specify protocol for:
- Δ𝓑 ≈ 0 (insufficient manipulation check)
- Negative correlations (paradoxical coupling)
- Non-monotonic responses

**C. Statistical Power**
Increase n=100 → n=200 for H₃ precision OR reframe H₃ as "inconclusive" region.

**D. Week 1 Checkpoint Gates**
Before committing to 8-10 weeks:
- ✅ Gemma-2 loads in TransformerLens with activation caching
- ✅ Gemma Scope 2 SAEs decode 5 test prompts
- ✅ Adversarial prompts achieve 60%+ phenotype rate (n=20 pilot)

#### 3. Responsible Disclosure Protocol (CRITICAL)
**Pre-Publication**:
- Week 0: Share pre-registration with OpenAI, Anthropic, DeepMind, Meta under NDA
- Week 4-5: If BECI < 0.5, immediate confidential lab report with 4-week embargo

**Publication Redactions**:
- Adversarial prompts: Redact top 20% most reliable
- Circuit diagrams: Publish aggregated ranges only
- ARTIFEX-100: Filter to BECI > 0.5 subset

**Toolkit Access**:
- Public tier: DSMMD detection, BECI calculation
- Researcher tier: Circuit localization (authenticated)
- Coordinated disclosure: Ablation testing (lab partnership only)

#### 4. Taxonomy and Rubric Operationalization (MEDIUM PRIORITY)
**Taxonomy**:
- Add severity specifiers (110.1-1, 110.1-2, 110.1-3)
- Consider Axis II: Architectural Predispositions
- Clarify inter-rater reliability metric (Cohen's κ vs. Fleiss' κ)

**Rubric**:
- Publish full specification with operational definitions
- Add Temporal Coherence and Self-Monitoring Accuracy dimensions
- Specify scoring scale and model-graded vs. rule-based approach

### Conditional Approval Framework

**APPROVE IF**:
1. Budget revised to 600 GPU-hours with explicit Llama-3.1 allocation
2. Timeline extended to 10 weeks with 2-week contingency clause
3. Week 1 checkpoint gates implemented (can pivot after Week 1 if gates fail)
4. Phased disclosure protocol accepted (NDA with labs, redaction framework)

**APPROVE AS SCOPED PROJECT IF resource constraints fixed**:
- Phase 1 (MATS): E2+E3 only (behavioral + computational evidence) in 8 weeks
- Phase 2 (post-MATS): E4 ablation + publication with full 600 GPU-hour budget

### Probability of Impact

**If H₂ is confirmed (BECI < 0.3)**:
- First causal proof of architectural self-knowledge failure
- Immediate safety protocol updates required (CoT oversight, Constitutional AI)
- Landmark finding comparable to discovering adversarial examples (Szegedy et al., 2013)

**If H₁ is confirmed (BECI > 0.7)**:
- Validates CoT oversight reliability
- Establishes BECI as standard safety metric
- Enables calibrated trust in model self-reports

**If H₃ is found (0.3 < BECI < 0.7)**:
- Reveals partial coupling requiring calibration
- Opens new research direction on improving introspective fidelity
- Still provides actionable safety guidance (when to trust self-reports)

**Even negative results advance the field**: ADT methodology and DSMMD taxonomy remain valuable for quantifying self-report reliability across models.

---

## Final Swarm Recommendation

**APPROVE WITH DISTINCTION AND REVISIONS**

This application represents a **paradigm shift** in mechanistic interpretability from circuit description to diagnostic safety evaluation. The DSMMD taxonomy + ADT methodology could become a standard framework for AI oversight, comparable to how DSM/ICD standardized psychiatric diagnosis.

**Strengths**:
- Best-in-class experimental rigor and epistemic discipline
- Novel diagnostic framework with 92% inter-rater reliability
- High safety relevance for multiple oversight mechanisms
- Transparent evidence grading (E0-E4) and proxy discipline

**Critical Revisions**:
- Resource planning underestimated (budget +50%, timeline +25%)
- Statistical power needs enhancement for H₃ discrimination
- Responsible disclosure protocol mandatory for dual-use risks
- Bidirectional ablation controls needed for circuit validation

**Conditions for Success**:
1. Achieve 60-80%+ phenotype replication in Phase 1
2. Publish complete rubric specification with operational definitions
3. Validate BECI metric properties (null distribution, edge cases)
4. Coordinate with labs on high-risk findings (BECI < 0.5)

**Expected Outcome**: With revisions, this project has **75-85% probability** of producing causal evidence for or against split-brain confabulation—a landmark contribution to mechanistic AI safety.

---

**Review Completed By:**
- **Experimental Designer** (Methodology & Statistical Analysis)
- **LLM-Rubric Architect** (Taxonomy & Evidence Grading)
- **Budget Agent** (Resource Planning & Timeline)
- **CISO** (Safety & Dual-Use Risk Assessment)

**Coordinated by:** ARTIFEX NERD SWARM
**Date:** January 3, 2026
