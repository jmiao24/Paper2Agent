<a id="p0001"></a>

# Reimagining research papers as interactive and reliable AI agents

<a id="p0002"></a>

Jiacheng Miao<sup>1,2</sup><sup>,\*</sup>, Joe R. Davis<sup>1</sup>, Yaohui Zhang<sup>3</sup>, Jonathan K. Pritchard<sup>1,4</sup>, James Zou<sup>2,3,5</sup><sup>,\*</sup>

<a id="p0003"></a>

1 Department of Genetics, Stanford University, Stanford, California, USA

<a id="p0004"></a>

2 Department of Biomedical Data Science, Stanford University, Stanford, California, USA

<a id="p0005"></a>

3 Department of Electrical Engineering, Stanford University, Stanford, California, USA

<a id="p0006"></a>

4 Department of Biology, Stanford University, Stanford, California, USA

<a id="p0007"></a>

5 Department of Computer Science, Stanford University, Stanford, California, USA

<a id="p0008"></a>

<sup>\*</sup>Correspondence to: jcmiao@stanford.edu; jamesz@stanford.edu

<a id="p0009"></a>

## Abstract

<a id="p0010"></a>

We introduce Paper2Agent, an automated framework that converts research papers into AI agents. Paper2Agent transforms research output from passive artifacts into active systems that accelerate use and discovery. Conventional research papers require readers to understand and adapt a paper’s code, data, and methods to their work, creating barriers to dissemination and reuse. Paper2Agent addresses this challenge by converting a paper into an AI agent that functions as a virtual corresponding author, exposing its manuscript, supplementary materials, datasets, code, and workflows as active, agent-native knowledge rather than static text. It analyzes the paper and codebase using multiple agents to construct a Model Context Protocol (MCP) server, then generates and runs tests to refine and robustify the MCP. These paper MCPs can be connected to a chat agent (e.g., Claude Code) to carry out complex scientific queries through natural language while invoking tools and workflows from the paper. We demonstrate Paper2Agent’s effectiveness through case studies. Paper2Agent created an agent leveraging AlphaGenome<sup>1</sup> to interpret genomic variants and agents based on Scanpy<sup>2</sup> and TISSUE<sup>3</sup> to conduct single-cell and spatial transcriptomics analyses. We validate that these agents reproduce the original papers’ results and carry out novel user queries. Paper2Agent created multiple agents that collaborate to prioritize a causal gene for psoriasis. By turning static papers into interactive AI agents, Paper2Agent introduces a paradigm for knowledge dissemination and a collaborative ecosystem of AI co-scientists. 

<a id="p0011"></a>

## Introduction

<a id="p0012"></a>

The research paper is the traditional unit of scientific communication. It remains the norm for documenting methods, results, and insights, and is the primary way research is shared with the broader community. However, papers are fundamentally passive objects: a reader must discover the paper (not an easy task given the flood of publications), parse its contributions, and manually determine how to apply them to their own work. In particular, when a paper describes a new computational method, significant technical barriers often remain before the method can be used on new data<sup>4</sup>. A reader might need to locate the corresponding code repository, install dependencies, configure environments, and interpret the correct inputs and outputs<sup>5</sup>. Even with well-maintained repositories, this process is often non-trivial.

<a id="p0013"></a>

For instance, consider AlphaGenome, which provides a powerful framework for genome-scale foundation modeling<sup>1</sup>. Despite its utility, this system requires substantial technical expertise to set up and deploy, limiting accessibility for biologists who could otherwise benefit. Using AlphaGenome in code involves installing the environment, creating client objects with API keys, constructing inputs such as variant objects, and selecting desired output modalities. Users must understand the API hierarchy and parameter semantics, which imposes a learning curve for biologists unfamiliar with these abstractions.

<a id="p0014"></a>

This illustrates a broader challenge: research outputs are passively siloed behind technical barriers. Paper2Agent reimagines research dissemination by turning static papers into active AI agents. Each agent serves as an interactive expert on the corresponding paper, capable of demonstrating, applying, and adapting its methods to new projects.

<a id="p0015"></a>

AI agents are autonomous systems that can reason about tasks and act to achieve goals by leveraging external tools and resources<sup>6</sup>. Modern AI agents are typically powered by large language models (LLMs) connected to external tools or APIs, and can adapt based on feedback<sup>7</sup>. Importantly, because agents are built on top of LLMs, users can interact with agents through human language, substantially reducing usage barriers for scientists. A range of recent systems, including general-purpose scientist agents<sup>8–12</sup> and domain-specialized agents<sup>13,14</sup>, have begun to demonstrate the potential of this paradigm, alongside efforts to automatically generate code from scientific text<sup>15,16</sup>. Paper2Agent complements this emerging paradigm by generalizing the concept: any research paper can be converted into an agent that embodies the knowledge and methods described in the publication.

<a id="p0016"></a>

Paper2Agent provides an automated workflow for converting a scientific paper into an agent. The core idea is to represent the paper as a Model Context Protocol (MCP) server<sup>17</sup>. MCP is a standardized protocol that allows structured APIs and tools to be exposed in a way that is directly accessible to LLMs and agent frameworks. The conversion process identifies a paper’s key contributions, encapsulates them through an MCP server, and links the server to LLM-based agents for natural language querying and autonomous execution. Users can then interact with the paper by asking questions, requesting demonstrations, or applying the method to new data. As an illustration, applying Paper2Agent to AlphaGenome would expose its genome foundation model as an MCP, so that instead of cloning repositories and configuring dependencies, a user could simply ask: "Interpret the expected effect of this variant on chromatin accessibility in muscle cells."

<a id="p0017"></a>

Earlier efforts have sought to make research outputs more executable and accessible, including executable papers<sup>18,19</sup>, the Papers with Code initiative<sup>20</sup>, containerized artifact platforms such as Binder<sup>21</sup> and CodeOcean<sup>22</sup>, and paper-to-code systems<sup>15</sup>. While these efforts improved reproducibility, substantial barriers remained for understanding, customizing, and applying the code to new projects.

<a id="p0018"></a>

Paper2Agent substantially extends this trajectory by providing a new framework: a paper can be transformed into a capable agent accessible via natural language. In contrast to previous efforts, Paper2Agent shifts the research output from a document or codebase encoding knowledge to a knowledgeable entity capable of execution and dialogue. This extends beyond retrieval-augmented generation over paper text. Paper2Agent agentifies the full research outputs, including manuscripts, supplementary materials, code, datasets, executable examples, and analysis workflows. In this framework, a paper becomes an executable research artifact that can answer questions, reproduce analyses, apply methods to new data, and interoperate with other paper agents. This represents a new mode of scientific communication, moving beyond static dissemination to interactive collaboration.

<a id="p0019"></a>

## Results

<a id="p0020"></a>

### Overview of Paper2Agent

<a id="p0021"></a>

Paper2Agent is a multi-agent AI system that automatically transforms research papers into interactive AI agents with minimal human input. The paper agents created via this framework are:

<a id="p0022"></a>

- Interactive and easy to use: Users can execute complex scientific analyses through natural language prompts, eliminating the need for programming expertise.

<a id="p0023"></a>

- Reliable and reproducible: Each tool used by a paper agent is validated against the reference codebase’s reported results and figures using example datasets, then locked to ensure reproducibility. This design mitigates the risk of “code hallucination”, where executing inaccurate LLM-generated code could lead to incorrect scientific results. It also minimizes randomness in code generation, further strengthening reproducibility. Finally, every tool includes a code reference from the original paper to provide transparency and traceability.

<a id="p0024"></a>

MCP has recently become an industry standard for connecting LLM-based agents with external resources, providing a unified interface for accessing datasets and tools without custom integration<sup>17</sup>. Paper2Agent builds on this ecosystem with two components: (i) Paper2MCP, which extracts information from papers and their codebases to build remote MCP servers; and (ii) an agent layer, which wraps each MCP server as a context provider to instantiate paper-specific AI agents (Figure 1A). Any LLM or external agent can invoke the servers’ tools through MCP without extra setup. For presentation clarity, we assign one MCP server and one paper agent to each paper. The same approach can create MCPs and agents for a group of related papers. Each MCP server includes three core components:

<a id="p0025"></a>

- MCP Tools are executable functions that encapsulate a paper’s methodological contributions. For example, one AlphaGenome MCP tool takes a genetic variant as input and generates predictions and visualizations of its effects on gene expression, chromatin accessibility, and other modalities. These tools come with a pre-configured environment for seamless execution.

<a id="p0026"></a>

- MCP Resources serve as a repository of static assets, including the manuscript text, the associated codebase, and supplementary materials such as datasets, tables, and figures. As an illustration, the AlphaGenome MCP resources include links to the training data used to train the model. All resources are stored in accessible, standardized formats to enable efficient querying and integration by AI agents.

<a id="p0027"></a>

- MCP Prompts contain concise instructions that guide AI agents through complex, multi-step scientific workflows derived from a paper’s text or codebase. For example, a Scanpy MCP Prompt encodes the sequence of steps for preprocessing and clustering single-cell data, which we present later in the manuscript. These templates orchestrate tools and resources to ensure reproducible, systematic analyses while reducing the barriers to effective prompting.

<a id="p0028"></a>

The paper MCP servers can be hosted remotely on platforms like Hugging Face Spaces, eliminating local dependency issues. MCP standardizes communication, enabling secure and scalable integration with AI agents. The agent layer wraps each Paper2MCP server as a context provider, creating paper-specific conversational agents. Any compatible LLM or agent can connect to these servers to perform tasks such as reproducibility checks, new data analyses, or figure regeneration. We use Claude Sonnet 4 for all the Paper2Agent applications in this paper. For example, a user might ask, “Apply the method in this paper to the newly generated dataset”, and the agent will automatically run the pipeline, produce results, and present interpretable outputs. By abstracting away technical details, the agent lowers barriers to method adoption, ensures reproducibility, and helps researchers focus on insights rather than implementation.

<a id="p0029"></a>

We implemented Paper2Agent with Claude Code<sup>23</sup>, an AI coding agent specialized in managing complex coding tasks. The workflow begins by identifying the codebase associated with a paper (Figure 1B). Two specialized agents are then invoked: the environment agent, which configures the necessary software environment, and the extraction agent, which translates core methods into implemented tools. These tools are validated through a testing agent that runs automated checks, refining both the code and environment until results match the reference outputs. A test passes when expected files are generated, numerical results fall within tolerance thresholds, and figures match references; tools that repeatedly fail validation are excluded from the final MCP server. Once validated, the tools and environment are packaged into an MCP Python file that can be deployed on a remote server such as Hugging Face. Finally, the paper MCP server is connected with an AI agent to create a fully functional Paper Agent, enabling interactive access to the paper’s knowledge and method through natural language queries. We use Claude Code as the downstream AI agent in our case studies, though the paper MCPs can be flexibly integrated with different chat agents. Because MCPs are modular, multiple MCPs can be connected to the same chat agent, enabling users to leverage tools and resources across multiple papers simultaneously.

<a id="p0030"></a>

Next, we present case studies demonstrating Paper2Agent’s ability to convert diverse research papers into reliable, interactive AI agents for different scientific tasks.

<a id="p0031"></a>

### AlphaGenome Agent for Genomics

<a id="p0032"></a>

The first case study showcases the AlphaGenome agent. AlphaGenome is an AI model designed to predict the impact of single-nucleotide variants or mutations in human DNA sequences on a wide range of regulatory processes<sup>1</sup>. Paper2Agent transforms the AlphaGenome paper into an interactive AlphaGenome agent, enabling automated interpretation of genomics data. Through natural language queries, users can leverage this agent to prioritize causal genes for disease-associated variants, clarify the regulatory impact of individual variants, and inform the design of synthetic DNA with specific regulatory functions.

<a id="p0033"></a>

Paper2Agent generated 22 AlphaGenome MCP tools, all of which passed automated validation, in around 45 minutes costing $14 on a personal laptop without human intervention, comprehensively covering its methodological innovations. This one-time process produced reusable tools for future applications. These MCP tools span single- and batch-variant scoring across functional assays, sequence-level prediction, tissue ontology exploration, and an extensive visualization suite (Figure 2A). For example, score\_variant\_effect() is an MCP tool that predicts the functional consequences of genetic variants across multiple modalities—such as gene expression, splicing, and chromatin accessibility—within a wide range of tissues and cell types. Complementing this, visualize\_variant\_effects() generates modality-specific visualizations that simplify the interpretation of regulatory impact.

<a id="p0034"></a>

Importantly, the tools generated by Paper2Agent are designed with flexible, well-annotated input parameters. For example, the visualize\_variant\_effects() tool exposes a rich set of options that make it adaptable to diverse use cases (Supplementary Figure 1). Given an input genetic variant, the AlphaGenome agent can adjust the sequence context length around the variant, and toggle different modalities—such as RNA-seq, ATAC-seq, or ChIP-seq histone tracks. Moreover, each MCP tool embeds a traceable link to the original source code, ensuring transparency and reproducibility. By connecting an AI agent with the AlphaGenome MCP, the system creates the AlphaGenome agent.

<a id="p0035"></a>

Next, we benchmarked the AlphaGenome agent against human-executed ground truth, Claude Code with direct repository access (Claude + Repo), and Biomni (Figure 2B). The Paper2Agent-generated agent did not have access to the manuscript or raw repository during evaluation, and results were graded by two independent human experts using predefined rubrics (inter-rater agreement: 96.7%). Benchmark queries included tutorial-derived tasks such as "Score variant chr3:58394738:A&gt;T using ATAC-seq predictions for motor neuron cells (CL:0000100). What is the quantile\_score for this cell type?" and novel tasks such as "Analyze variant chr9:98765432:T&gt;C with DNASE predictions for muscle cells (CL:0000187). What is the quantile\_score for muscle tissue?" Across five independent runs, it achieved 98.7% ± 1.3% accuracy on 15 tutorial-derived queries and 100.0% ± 0.0% accuracy on 15 novel queries, outperforming Claude + Repo (82.7% ± 3.4% and 78.7% ± 4.4%) and Biomni (37.3% ± 4.0% and 56.0% ± 3.4%). On 30 open-ended researcher-style queries requiring multi-step tool composition and biological synthesis, such as "Analyze the predicted accessibility and gene expression effects for chr22:45969257:G&gt;A, associated with reduced bone mineral density. What is a likely mechanism of action and causal gene for this variant?", Paper2Agent achieved 82.7% ± 2.4% accuracy, compared with 56.7% ± 2.3% for Claude + Repo and 72.2% ± 2.2% for Biomni. These gains were robust to prompt paraphrasing and persisted when the Claude + Repo baseline was upgraded to newer models such as Claude Opus 4.6 (Supplementary Figures 2 and 3, Supplementary Note). The AlphaGenome agent also reduces median runtime by 1.9× and 3.1× relative to Claude + Repo and Biomni on tutorial-derived queries, and by 2.9× and 3.8× on novel queries (Figure 2C). These results indicate that Paper2Agent improves both reliability and efficiency relative to using a general-purpose agent directly on the repository.

<a id="p0036"></a>

Finally, we demonstrated that the AlphaGenome agent enables automatic interpretation of Genome-Wide Association Study (GWAS) loci and validation of the analysis in the original paper. We considered the example of interpreting why the genetic variant chr1:109274968:G&gt;T is associated with low-density lipoprotein cholesterol that was presented in the original AlphaGenome paper (Figure 2D). Based on the tools available, the AlphaGenome agent constructs a step-by-step plan to solve this task. This plan includes generating input files, scoring variants across multiple modalities, filtering results for trait-relevant tissues, creating modality-specific visualizations, and assembling an interpretation report. The agent then executes these actions using implemented tools, automatically refining its strategy through iterative observation and feedback. A final report is then presented to provide a unified interpretation of the regulatory impact of the variant, integrating evidence across modalities and tissues.

<a id="p0037"></a>

Interestingly, the AlphaGenome agent prioritizes SORT1 as the most likely causal gene, whereas the original paper emphasized CELSR2 and PSRC1. The agent favors SORT1 for two reasons: 1) a high quantile score (0.99982) indicating a strong predicted impact on SORT1 expression in liver tissue. Here, the quantile score reflects how extreme the variant’s predicted effect is relative to other variants; 2) SORT1 encodes sortilin, directly involved in LDL/VLDL secretion<sup>24</sup>. We queried the GTEx eQTL data and confirmed that this variant is a significant eQTL for SORT1 (p = 1.1e-65) in liver<sup>25</sup>. However, both CELSR2 and PSRC1 also exhibit high AlphaGenome quantile scores (0.99998 each) and significant eQTL associations in GTEx liver (p = 4.7e-46 and 8.5e-50, respectively). This result shows the inherent difficulty in confidently assigning causal genes at complex GWAS loci where the variants are eQTLs for multiple nearby genes<sup>26,27</sup>.

<a id="p0038"></a>

This discrepancy highlights a key strength of Paper2Agent: with a single prompt, users can re-evaluate published conclusions using independent model-based evidence, without the need to design new analysis pipelines. Rather than treating the original interpretation as fixed, the agent enables dynamic hypothesis re-assessment and, at scale, provides a systematic way to revisit conclusions across many studies.

<a id="p0039"></a>

### Scanpy Agent for Single-Cell Analysis

<a id="p0040"></a>

Next, we demonstrate the application of the Paper2Agent-generated Scanpy agent for single-cell data analysis. Scanpy is a widely used package for analyzing large-scale single-cell transcriptomic data<sup>2</sup>. We focus on Scanpy’s most common use case: preprocessing and clustering single-cell data. Paper2Agent generated 7 tools for this feature, all of which passed automated validation, in around 45 minutes costing $13 on a personal laptop. The resulting tools included quality\_control() for calculating and visualizing QC metrics, filtering cells and genes, and detecting doublets (Figure 3A). This allows users to prompt the Scanpy agent to perform quality control on their single-cell data.

<a id="p0041"></a>

In practice, many users prefer an end-to-end workflow for preprocessing and clustering, where the implemented tools are executed sequentially in the correct order. This type of analysis workflow is not unique to single-cell analysis but is common across many scientific domains. However, executing such workflows can be challenging: the AI agent must either already “know” the correct order of actions, or the user must provide a carefully structured prompt that explicitly specifies the sequence. To overcome this limitation, we use MCP prompts to guide the agent. MCP prompts offer a standardized way to encode workflows, ensuring that tools are executed in the proper order and relieving users from the burden of manually instructing the agent. Importantly, these MCP prompts are inferred directly from the paper and codebase by Paper2Agent, without the need for manual curation. This design improves both reproducibility and usability, particularly for complex analyses such as single-cell data processing.

<a id="p0042"></a>

For example, the Paper2Agent-generated Scanpy MCP prompts encode a standard preprocessing and clustering pipeline, including quality control, normalization, feature selection, dimensionality reduction, graph construction, clustering, and cell-type annotation in the correct order (Figure 3B). The prompt also instructs the Scanpy agent to inspect the data before analysis to select appropriate parameters. Users only need to provide the data path (e.g., data.h5ad), and the Scanpy agent automatically runs the workflow and provides a summary of the analysis results.

<a id="p0043"></a>

To evaluate the Scanpy agent’s performance, we applied it to preprocess and cluster four publicly available single-cell datasets (Data availability) that are not included in the Scanpy codebase. We invoked the Scanpy MCP prompts and queried the Scanpy agent "Perform standard single-cell preprocessing and clustering pipeline on this single-cell data: data.h5ad". As shown in Figure 3C, the agent produced outputs that match those produced by human researchers when processing the same data, retaining equivalent cell and gene counts after quality control and recovering equivalent top differentially expressed marker genes per cluster with matched parameters. To assess generalizability, we applied it to seven diverse single-cell datasets and observed that the agent adaptively adjusts parameters based on data characteristics (Supplementary Table 2). This demonstrates how MCP-prompt–powered Scanpy agents streamline workflow execution, making advanced single-cell analysis both accessible and reproducible. We further present a case study where we agentified the TISSUE paper for single-cell spatial transcriptomics analysis (Extended Data Fig. 1 and Supplementary Note).

<a id="p0044"></a>

### Large-scale evaluation of Paper2Agent

<a id="p0045"></a>

To test scalability, we processed three heterogeneous paper corpora end-to-end without manual cleanup, code modification, or intervention: 100 computational biology papers, 26 data- and discovery-focused papers, and 10 non-biology computational papers spanning AI, statistics, econometrics, game theory, and astrophysics<sup>28–37</sup> (Supplementary Note). Paper2Agent exposes each paper through a structured resource layer and, when the associated codebase permits, an executable MCP tool layer.

<a id="p0046"></a>

Among the 100 computational biology papers, 74 were successfully agentified, yielding 599 proposed tools, of which 593 passed automated validation; the major failure modes among the remaining papers were missing executable code, missing data or model artifacts, environment or dependency failures, and non-generalizable scripts. On 300 tutorial-derived benchmark questions, Paper2Agent with Sonnet 4 achieved 91.2% ± 1.6% accuracy, outperforming Claude Code with direct repository access using Sonnet 4 (80.3% ± 2.3%; p &lt; 0.0001) and Sonnet 4.6 (86.3% ± 1.1%; p &lt; 0.0001). Paper2Agent also reduced query cost and latency ($0.20 and 1.6 min per query, compared with $0.38 and 4.3 min for using Sonnet 4 directly with the paper and repo). Across 42 execution-based tasks from 10 non-biology computational papers, Paper2Agent achieved 98.1% ± 0.8% accuracy across five independent runs, demonstrating generalization beyond computational biology. Paper2Agent also remained useful when executable tools could not be constructed. Across 26 data- and discovery-focused papers, the resource layer achieved 89.0% ± 3.1% accuracy on 100 synthesis-based questions, outperforming a Claude browser-use baseline (82.0% ± 3.8%; p = 0.03) while being 34× cheaper and 15× faster.

<a id="p0047"></a>

Additional analyses demonstrated no systematic evidence of shortcut learning in generated MCPs, showed that Paper2Agent supports model training and adaptive hyperparameter tuning in examples, and found that Paper2Agent correctly rejected 100% of out-of-scope queries in a permuted paper-question benchmark. In adversarial repository-drift tests, Paper2Agent recovered functional MCP servers across injected dependency, file-path, typo, and deprecated-API failures. Paper2Agent also generated and validated a functional MCP from a repository without executable tutorials, demonstrating that curated tutorials are beneficial but not strictly required. Ablations further showed that automated validation and the multi-agent design contribute to performance (Supplementary Note).

<a id="p0048"></a>

Together, these results show that Paper2Agent can transform heterogeneous papers into useful queryable agents at scale, with executable tools when code is agentifiable and structured resources when it is not.

<a id="p0049"></a>

### Paper Agents Collaborate for Discovery

<a id="p0050"></a>

Human scientific collaboration often advances by combining insights from multiple, disparate papers—for instance, when a newly developed method is applied to a recently published dataset to generate fresh discoveries. However, this process is typically slow and labor-intensive. Paper2Agent enables a new mode of AI-driven collaboration in which AI paper agents can interact directly with each other. The agent of a new method paper can autonomously collaborate with the agent of a new data paper to perform analyses, test hypotheses, and generate new insights.

<a id="p0051"></a>

Identifying the disease-relevant target gene at a GWAS locus is a long-standing problem in human genetics, because a single regulatory variant can affect multiple nearby genes, and disentangling them requires evidence beyond the original locus mapping<sup>38</sup>. As a discovery case study, we used three agents generated by Paper2Agent: AlphaGenome<sup>1</sup>, MPRA-coupled scCRISPRi<sup>39</sup>, and CD4+ T cells Perturb-seq<sup>40</sup>, to identify and validate the causal gene for a psoriasis-associated variant. The AlphaGenome agent predicted GPR137 as the top affected gene at the rs887314 locus in CD4+ T cells (RNA-seq quantile score = 0.997), ranking above other nearby genes. To validate this prediction, we instructed the AI co-scientist to cross-reference the AlphaGenome prediction with experimental data from two additional paper agents: an MPRA-coupled scCRISPRi screen that measured downstream gene expression changes upon cis-regulatory element (CRE) perturbation, and a genome-wide Perturb-seq dataset that profiled transcriptional consequences of gene knockdowns in primary human CD4+ T cells.

<a id="p0052"></a>

After autonomously inspecting the manuscript, analyzing the supplementary tables from the MPRA-coupled scCRISPRi paper<sup>39</sup>, and examining the differential expression summary statistics from the CD4+ T cells Perturb-seq paper<sup>40</sup>, the AI co-scientist proposed 10 candidate strategies to validate this gene (Supplementary Note). From these, the human researcher selected signature correlation analysis to test whether the CRE perturbation signature matched any gene knockdown signatures. For each of the five top-ranked candidate genes with available knockdown data, the agent correlated the downstream gene expression changes caused by perturbing the rs887314 cis-regulatory element with those caused by knocking down each candidate gene across three culture conditions (Rest, Stim8hr, Stim48hr). Only GPR137 knockdown showed significant concordance with the CRE perturbation signature under stimulated conditions (Spearman correlation = 0.613, p = 3.79e-3 at Stim8hr; Spearman correlation = 0.630, p = 4.71e-3 at Stim48hr; FDR &lt; 0.05), while BAD knockdown and three other top-ranked candidate genes showed no significant correlation in any condition (Figure [4](<#p0110>)B and Supplementary Figure 4). These results demonstrate that Paper2Agent enables the autonomous integration of computational predictions with independent experimental validation, supporting GPR137 as the likely causal gene for psoriasis. Notably, the GPR137 knockdown effect reached significance only under stimulation and not at rest (Spearman correlation = 0.29, p = 0.21), so we interpret GPR137’s role at this locus as activation-dependent. This pattern is consistent with the finding from the Perturb-seq study that CD4+ T cells regulators vary substantially in their effects across stimulation conditions<sup>40</sup> and aligns with the established role of activated CD4+ T cells in psoriasis pathogenesis<sup>41,42</sup>.

<a id="p0053"></a>

The agent’s proposed strategy is itself a new data integration approach. Rather than relying on a single readout, the agent integrated the two complementary datasets by correlating CRE perturbation signatures (from scCRISPRi) with gene-knockdown signatures (from Perturb-seq). This cross-screen, cross-modality signature-correlation procedure is not proposed in the source papers and is a flexible technique for transferring causal-gene prioritization across independent perturbation datasets at GWAS loci with multiple co-regulated candidates.

<a id="p0054"></a>

In the Supplementary Note, we present an additional case study in which Paper2Agent connects the AlphaGenome method paper<sup>1</sup> with a recent GWAS of Attention-Deficit/Hyperactivity Disorder (ADHD)<sup>43</sup>, enabling an AI co-scientist to prioritize candidate causal variants and mechanisms across ADHD loci (Extended Data Fig. 2). Together, these results exemplify a new collaborative paradigm in which human scientists use Paper2Agent to design their own AI co-scientists and jointly formulate high-level scientific hypotheses, while the AI co-scientists autonomously execute and interpret complex analytical tasks.

<a id="p0055"></a>

## Discussion

<a id="p0056"></a>

In this work, we introduce Paper2Agent, a framework that transforms a research paper from a passive publication into an interactive AI agent. We demonstrate this approach by creating Paper2Agent instances for several methodological advances. These examples illustrate how a paper agent can embody the research contribution, making it directly accessible through natural language interaction. The generated paper MCPs are modular units that can be connected to diverse user-facing agents, enabling broad adoption. By lowering the barriers between publication and practical application, Paper2Agent helps bridge the gap between how scientific discoveries are disseminated and how they are used in practice. More broadly, Paper2Agent advocates a conceptual shift in how scientific knowledge is represented and reused: papers become agent-native research objects rather than static documents.

<a id="p0057"></a>

Not every paper can be seamlessly turned into a robust agent. As we demonstrate in the adversarial benchmarks, Paper2Agent’s iterative execute-diagnose-repair loop can detect and correct many inherited bugs that manifest as execution failures. Nevertheless, in our large-scale evaluation, a substantial fraction of repositories still could not be successfully agentified, typically due to incomplete codebases, missing documentation, or unresolvable environment configurations. These challenges suggest that the ease with which a paper can be transformed into an agent may itself serve as a practical measure of reproducibility. Just as the scientific community has come to expect clear data and code availability, we envision a natural extension: expecting contributions to be structured in agent-native artifacts that facilitate their translation into agents. Well-documented and transparent papers will naturally lend themselves to this new standard. We emphasize that open-ended scientific reasoning, including hypothesis generation and mechanistic interpretation, remains human-in-the-loop. 

<a id="p0058"></a>

Paper2Agent can generate hypotheses, propose validation strategies, and execute analyses at scale, but researchers remain responsible for selecting directions and evaluating evidence. We therefore view Paper2Agent as a tool for augmenting scientific discovery and improving access, reproducibility, and reuse of papers, rather than as an autonomous or authoritative source of scientific conclusions. For open-ended analyses, however, multiple answers may be defensible, so benchmarks based on agreement with a single reference should be interpreted primarily as measures of faithful execution rather than of analytical validity. Evaluating the range of defensible answers will be important for assessing AI systems on open-ended scientific tasks.

<a id="p0059"></a>

Looking forward, just as many journals now require data and code availability sections, we anticipate the emergence of an “agent availability” section that specifies whether and how the contribution has been embodied as an interactive agent. This would not only provide immediate utility to readers but also incentivize authors to present their work in a form conducive to agentification. Under this framing, agent-native artifacts become part of what authors publish and maintain alongside their papers, on par with code repositories and example notebooks. Like these existing artifacts, paper agents require ongoing maintenance as upstream codebases and dependencies evolve; we view this as an inherent feature of publishing executable research rather than a reason to forgo agentification. Exposing research code as executable agents also introduces security, intellectual property, and attribution challenges that warrant careful handling (Supplementary Note).

<a id="p0060"></a>

Finally, once scientific knowledge is encoded in active agents rather than static artifacts, the potential extends beyond individual use. Agents could interact with one another, linking methods to datasets or combining insights from different domains. Communities of such agents could form a dynamic layer of scientific intelligence, accelerating connections across disciplines and enabling a new form of AI-driven collaboration. Paper2Agent thus points toward a future in which scientific communication is not only about describing results, but also about creating interactive, collaborative entities that embody and extend the research.

<a id="p0061"></a>

## References

<a id="p0062"></a>

1.	Avsec, Ž. et al. Advancing regulatory variant effect prediction with AlphaGenome. Nature 649, 1206–1218 (2026).

<a id="p0063"></a>

2.	Wolf, F. A., Angerer, P. &amp; Theis, F. J. SCANPY: large-scale single-cell gene expression data analysis. Genome biology 19, 15 (2018).

<a id="p0064"></a>

3.	Sun, E. D., Ma, R., Navarro Negredo, P., Brunet, A. &amp; Zou, J. TISSUE: uncertainty-calibrated prediction of single-cell spatial transcriptomics improves downstream analyses. Nature methods 21, 444–454 (2024).

<a id="p0065"></a>

4.	Trisovic, A., Lau, M. K., Pasquier, T. &amp; Crosas, M. A large-scale study on research code quality and execution. Scientific Data 9, 60 (2022).

<a id="p0066"></a>

5.	Gomes, D. G. et al. Why don’t we share data and code? Perceived barriers and benefits to public archiving practices. Proceedings of the Royal Society B: Biological Sciences 289, 20221113 (2022).

<a id="p0067"></a>

6.	Yao, S. et al. React: Synergizing reasoning and acting in language models. arXiv preprint arXiv:2210.03629 (2022).

<a id="p0068"></a>

7.	Yuksekgonul, M. et al. Optimizing generative ai by backpropagating language model feedback. Nature 639, 609–616 (2025).

<a id="p0069"></a>

8.	Lu, C. et al. Towards end-to-end automation of AI research. Nature 651, 914–919 (2026).

<a id="p0070"></a>

9.	Swanson, K., Wu, W., Bulaong, N. L., Pak, J. E. &amp; Zou, J. The Virtual Lab of AI agents designs new SARS-CoV-2 nanobodies. Nature 646, 716–723 (2025).

<a id="p0071"></a>

10.	Gottweis, J. et al. Accelerating scientific discovery with Co-Scientist. Nature 1–3 (2026).

<a id="p0072"></a>

11.	Ghareeb, A. E. et al. A multi-agent system for automating scientific discovery. Nature 1–3 (2026).

<a id="p0073"></a>

12.	Huang, K. et al. Autonomous biomedical research with an artificial intelligence agent. Science eadz4351 (2026).

<a id="p0074"></a>

13.	Alber, S. et al. Cellvoyager: Ai compbio agent generates new insights by autonomously analyzing biological data. Nature Methods 23, 749–759 (2026).

<a id="p0075"></a>

14.	Qu, Y. et al. CRISPR-GPT for agentic automation of gene-editing experiments. Nature Biomedical Engineering 10, 245–258 (2026).

<a id="p0076"></a>

15.	Seo, M., Baek, J., Lee, S. &amp; Hwang, S. J. Paper2code: Automating code generation from scientific papers in machine learning. arXiv preprint arXiv:2504.17192 (2025).

<a id="p0077"></a>

16.	Movassaghi, C. S., Momenzadeh, A. &amp; Meyer, J. G. From articles to code: on-demand generation of core algorithms from scientific publications. Bioinformatics 42, btag015 (2026).

<a id="p0078"></a>

17.	Hou, X., Zhao, Y., Wang, S. &amp; Wang, H. Model context protocol (mcp): Landscape, security threats, and future research directions. ACM Transactions on Software Engineering and Methodology (2025).

<a id="p0079"></a>

18.	Nowakowski, P. et al. The collage authoring environment. Procedia Computer Science 4, 608–617 (2011).

<a id="p0080"></a>

19.	Rule, A. et al. Ten Simple Rules for Writing and Sharing Computational Analyses in Jupyter Notebooks. PLoS computational biology vol. 15 e1007007 (Public Library of Science, 2019).

<a id="p0081"></a>

20.	Stojnic, R. &amp; Taylor, R. Papers with Code is joining Facebook AI. Medium https://medium.com/paperswithcode/papers-with-code-is-joining-facebook-ai-90b51055f694 (2019).

<a id="p0082"></a>

21.	Ragan-Kelley, B. et al. Binder 2.0-Reproducible, interactive, sharable environments for science at scale. in Proceedings of the 17th python in science conference 113–120 (F. Akici Austin, Texas, 2018).

<a id="p0083"></a>

22.	Staubitz, T., Klement, H., Teusner, R., Renz, J. &amp; Meinel, C. CodeOcean-A versatile platform for practical programming excercises in online environments. in 2016 IEEE Global Engineering Education Conference (EDUCON) 314–323 (IEEE, 2016).

<a id="p0084"></a>

23.	Anthropic. Claude Code: Deep coding at terminal velocity. Anthropic https://www.anthropic.com/claude-code (2025).

<a id="p0085"></a>

24.	Kjolby, M., Nielsen, M. S. &amp; Petersen, C. M. Sortilin, encoded by the cardiovascular risk gene SORT1, and its suggested functions in cardiovascular disease. Current atherosclerosis reports 17, 18 (2015).

<a id="p0086"></a>

25.	Consortium, Gte. The GTEx Consortium atlas of genetic regulatory effects across human tissues. Science 369, 1318–1330 (2020).

<a id="p0087"></a>

26.	Wainberg, M. et al. Opportunities and challenges for transcriptome-wide association studies. Nature genetics 51, 592–599 (2019).

<a id="p0088"></a>

27.	Mostafavi, H., Spence, J. P., Naqvi, S. &amp; Pritchard, J. K. Systematic differences in discovery of genetic effects on gene expression and complex traits. Nature genetics 55, 1866–1875 (2023).

<a id="p0089"></a>

28.	Wager, S. &amp; Athey, S. Estimation and inference of heterogeneous treatment effects using random forests. Journal of the American Statistical Association 113, 1228–1242 (2018).

<a id="p0090"></a>

29.	Bloom, J., Tigges, C., Duong, A. &amp; Chanin, D. SAELens. https://github.com/decoderesearch/SAELens (2024).

<a id="p0091"></a>

30.	Hans, A. et al. Spotting llms with binoculars: Zero-shot detection of machine-generated text. arXiv preprint arXiv:2401.12070 (2024).

<a id="p0092"></a>

31.	Hollmann, N. et al. Accurate predictions on small data with a tabular foundation model. Nature 637, 319–326 (2025).

<a id="p0093"></a>

32.	Ravi, N. et al. Sam 2: Segment anything in images and videos. in International Conference on Learning Representations vol. 2025 28085–28128 (2025).

<a id="p0094"></a>

33.	Chernozhukov, V., Demirer, M., Duflo, E. &amp; Fernandez-Val, I. Generic Machine Learning Inference on Heterogeneous Treatment Effects in Randomized Experiments, with an Application to Immunization in India. (2018).

<a id="p0095"></a>

34.	Brodersen, K. H., Gallusser, F., Koehler, J., Remy, N. &amp; Scott, S. L. Inferring causal impact using Bayesian structural time-series models. (2015).

<a id="p0096"></a>

35.	Knight, V. &amp; Campbell, J. Nashpy: A Python library for the computation of Nash equilibria. Journal of Open Source Software 3, 904 (2018).

<a id="p0097"></a>

36.	Foreman-Mackey, D., Hogg, D. W., Lang, D. &amp; Goodman, J. emcee: the MCMC hammer. Publications of the Astronomical Society of the Pacific 125, 306–312 (2013).

<a id="p0098"></a>

37.	Jin, Y. &amp; Candès, E. J. Model-free selective inference under covariate shift via weighted conformal p-values. Biometrika 113, asaf066 (2026).

<a id="p0099"></a>

38.	Spence, J. P. et al. Specificity, length and luck drive gene rankings in association studies. Nature 649, 918–925 (2026).

<a id="p0100"></a>

39.	Ho, C.-H. et al. Genetic and epigenetic screens in primary human T cells link candidate causal autoimmune variants to T cell networks. Nature genetics 57, 2536–2545 (2025).

<a id="p0101"></a>

40.	Zhu, R. et al. Genome-scale perturb-seq in primary human CD4+ T cells maps context-specific regulators of T cell programs and human immune traits. bioRxiv 2025.12. 23.696273 (2025).

<a id="p0102"></a>

41.	Soskic, B. et al. Immune disease risk variants regulate gene expression dynamics during CD4+ T cell activation. Nature genetics 54, 817–826 (2022).

<a id="p0103"></a>

42.	Rendon, A. &amp; Schäkel, K. Psoriasis pathogenesis and treatment. International journal of molecular sciences 20, 1475 (2019).

<a id="p0104"></a>

43.	Van der Laan, C. M. et al. Genome-wide association meta-analysis of childhood ADHD symptoms and diagnosis identifies new loci and potential effector genes. Nature genetics 57, 2427–2435 (2025).

<a id="p0106"></a>

## Main Figure Legends

<a id="p0107"></a>

### Figure 1

[Figure 1 image](../assets/figure/figure-1.jpg)

Figure 1. Overview of Paper2Agent. (A) Paper2Agent turns research papers into interactive AI agents by building remote MCP servers with tools, resources, and prompts. Connecting an AI agent to the server creates a paper-specific agent for diverse tasks. (B) Workflow of Paper2Agent. It starts with codebase extraction and automated environment setup for reproducibility. Core analytical features are wrapped as MCP tools, then validated through iterative testing. The resulting MCP server is deployed remotely and integrated with an AI agent, enabling natural-language interaction with the paper’s methods and analyses.

<a id="p0108"></a>

### Figure 2

[Figure 2 image](../assets/figure/figure-2.jpg)

Figure 2. Overview of the Paper2Agent-generated AlphaGenome agent. (A) Construction of the AlphaGenome MCP server and agent. (B) Benchmark accuracy. Data are mean ± s.e.m.; n=5 independent runs. Dots represent individual runs. (C) Query run times. Centre lines show medians, boxes the 25th–75th percentiles, whiskers the most extreme values within 1.5× the interquartile range, and points beyond the whiskers outliers; n=75 query runs per method per benchmark (15 queries across 5 independent runs). (D) Automated planning and interpretation of GWAS loci through iterative planning–action–observation cycles.

<a id="p0109"></a>

### Figure 3

[Figure 3 image](../assets/figure/figure-3.jpg)

Figure 3. Overview of the Paper2Agent-generated Scanpy agent. (A) Construction of the Scanpy MCP server and agent. (B) MCP prompts encode a standardized single-cell preprocessing and clustering pipeline. (C) Agent reproduces human researcher results, requiring only the dataset path as input.

<a id="p0110"></a>

### Figure 4

[Figure 4 image](../assets/figure/figure-4.jpg)

Figure 4. Paper2Agent enables prioritization and experimental support for a psoriasis-associated causal gene. (A) Paper2Agent integrates AlphaGenome, MPRA-coupled scCRISPRi, and Perturb-seq paper agents to prioritize GPR137 at the psoriasis-associated rs887314 locus. (B) Correlations between rs887314 CRE-perturbation and gene-knockdown signatures. Each dot represents one downstream gene. For both GPR137 and BAD knockdowns, sample sizes were n=20, 21, and 19 genes for Rest, Stim8hr, and Stim48hr, respectively. Spearman’s ρ and two-sided P values are shown; significance was assessed using Benjamini–Hochberg correction (orange, FDR &lt;0.05). Dashed lines show linear fits after outlier removal. The perturbed gene was excluded.

<a id="p0111"></a>

## Methods

<a id="p0112"></a>

### Details on implementing Paper2Agent

<a id="p0113"></a>

Paper2Agent converts a research paper and its public codebase into a production-ready MCP server and then exposes that server to an AI agent interface. We implemented this as a multi-agent system using Claude Code’s agent SDK, where a central orchestrator agent coordinates specialized sub-agents through a six-step pipeline. Each sub-agent is defined by a structured prompt that specifies its role, permitted tools (e.g., file read/write, shell execution, web access), and expected output schema. The orchestrator dispatches sub-agents sequentially across steps and in parallel within steps when multiple tutorials are processed concurrently.

<a id="p0114"></a>

The pipeline proceeds through six steps, with data flowing between steps via standardized JSON reports and file conventions:

<a id="p0115"></a>

- Locate and download the codebase. Paper2Agent first attempts to automatically identify the associated code repository from the manuscript text, references, or supplementary materials. If automatic identification fails, if it returns multiple candidates, or if the user prefers to specify a particular repository, the repository URL can be provided directly. Once identified, the codebase is cloned or downloaded, along with associated resources such as supplementary data or configuration files. The outputs for this step are the cloned repository and detected language.

<a id="p0116"></a>

- Environment setup. The environment-manager sub-agent provides a clean, isolated virtual environment for the repository. The input is the cloned repository, and the outputs are an isolated virtual environment and test configuration files.

<a id="p0117"></a>

- Tutorial discovery. The tutorial-scanner sub-agent scans the repository to locate useful reference and educational materials and produces an index of candidate tutorials for tooling. The inputs are the cloned repository and an optional tutorial filter. The output is a JSON file representing a classified file index.

<a id="p0118"></a>

- Tutorial execution and audit. The tutorial-executor sub-agent runs the selected tutorials end-to-end with their example data, captures inputs, outputs, figures, and runtime constraints, and records any implicit assumptions that must be made explicit. The inputs are tutorial source files, activated virtual environment, and scanner report. The outputs are executed notebooks and per-tutorial execution reports.

<a id="p0119"></a>

- Tool extraction, testing, and refinement. This step involves two sub-agents operating in sequence. First, the tutorial-tool-extractor-implementor converts each executed tutorial into a standalone Python module containing reusable functions. It identifies generalizable analysis steps, parameterizes hardcoded values (file paths, thresholds, column names), enforces file-based inputs and outputs, and decorates each function as an MCP tool. Second, the test-verifier-improver creates per-function test files using the tutorial’s own example data as ground truth. Tests verify that expected output files are generated and functions that repeatedly fail have their MCP tool decorators removed and are excluded from the final server. The inputs are executed notebooks, virtual environment, and scanner report. The outputs are tool modules, per-function test files, test logs, and summaries.

<a id="p0120"></a>

- MCP server assembly. The orchestrator integrates all validated tool modules into a unified MCP server with a manifest, versioning, and basic security defaults, ready to be used by an orchestrator or co-scientist agent.

<a id="p0121"></a>

Each sub-agent is instantiated as an independent LLM session (Claude) with a role-specific system prompt and a defined set of permitted tools (file read/write, shell execution, code search).

<a id="p0122"></a>

- Environment-manager: a specialized agent responsible for creating clean, reproducible environments for research codebases. It analyzes project setup requirements, provisions an isolated workspace, installs all necessary dependencies, and ensures the code runs without conflicts. Standardizing environment setup enables reliable execution and reproducibility across different systems.

<a id="p0123"></a>

- Tutorial-scanner: a specialized agent for reviewing the public codebases to identify and organize educational resources. It systematically scans available materials, distinguishes genuine tutorials from other files, and highlights those most useful for reuse. The agent then produces clear summaries and reports, providing a structured view of which resources are worth keeping and which can be set aside.

<a id="p0124"></a>

- Tutorial-executor: Executes approved tutorials end-to-end to generate gold-standard outputs and reference data for downstream tool extraction. The agent systematically resolves execution errors, preserves all generated outputs (numerical results, figures, tables), and records execution metadata. The resulting executed notebooks, extracted figures, and generated data files serve as authoritative reference material for test creation and validation.

<a id="p0125"></a>

- Tutorial-tool-extractor-implementor: a specialized agent that converts tutorials into reusable tools. It reviews selected tutorials, identifies tasks that generalize beyond the example data, and implements each as a clean, single-purpose function with clear inputs, outputs, and defaults. The agent parameterizes hardcoded values, enforces file-based inputs, saves essential results and figures, and returns a standardized summary of produced artifacts. Its goal is to create a practical function library that reproduces tutorial results on the original data while remaining ready to run on new datasets.

<a id="p0126"></a>

- Test-verifier-improver: a specialized agent that creates, runs, and refines tests for tutorial implementations. It uses only the tutorial’s own examples to ensure complete coverage and faithful reproduction of numerical and visualization results. A test passes when expected files are generated, numerical results match tutorial outputs exactly (with a 3% tolerance for floating-point values), and generated figures match reference visualizations (verified via perceptual hashing with Hamming distance &lt; 20). The agent runs in a loop of generating tests, executing them, diagnosing failures, and applying fixes, with a maximum of 6 attempts per function. If functions repeatedly fail, their MCP decorators are removed, a failure comment is added, and they will not be included in the MCP server. All results and logs are recorded for transparency.

<a id="p0127"></a>

The orchestrator agent invokes sub-agents as needed at different stages of the process. As the Paper2Agent workflow progresses, the results are automatically recorded for each step for traceability and reproducibility. The detailed setup and prompt are available in the [Paper2Agent](<https://github.com/jmiao24/Paper2Agent>) GitHub repository.

<a id="p0128"></a>

### Generation and analysis of AlphaGenome agent

<a id="p0129"></a>

We applied the Paper2Agent framework to the AlphaGenome paper to generate an AlphaGenome MCP and connected the MCP with Claude Code to create the AlphaGenome agent. The generated AlphaGenome MCP server is remotely hosted on Hugging Face Spaces (Code availability). To verify reproducibility, the AlphaGenome agent was evaluated using 15 original tutorial-based and 15 novel queries. We prompted the agent with the queries and compared the agent’s response with the ground truth answer. The prompt used to query the AlphaGenome agent on interpreting LDL genetic associations is: "Use AlphaGenome to interpret why chr1:109274968:G&gt;T associates with LDL cholesterol. Identify the causal genes and assess regulatory effects across modalities in liver. Generate a publication-ready report with figures. My AlphaGenome API key is: &lt;API\_KEY&gt;. Reason step by step." The detailed benchmark queries are available in the [Paper2Agent repository](<https://github.com/jmiao24/Paper2Agent>).

<a id="p0130"></a>

### Benchmarking the AlphaGenome agent against Claude + Repo and Biomni

<a id="p0131"></a>

For both the tutorial-based and novel benchmarks described above, we followed these general evaluation steps:

<a id="p0132"></a>

- Generate ground truth answers for each query using manually curated and executed code.

<a id="p0133"></a>

- Generate and capture the agent’s response to the query, as well as performance metrics like run time and cost.

<a id="p0134"></a>

- Manually review and grade the agent’s response relative to the ground truth.

<a id="p0135"></a>

- Summarize the agent’s performance across all queries for the benchmark dataset.

<a id="p0136"></a>

Unless otherwise specified, the primary evaluations used claude-sonnet-4-20250514 as the underlying LLM. All evaluations were run locally on a MacBook Air (M2 chip) (8-core CPU, 8-core GPU, 8 GB unified memory), using model APIs as needed. Each query was run in non-interactive mode from the command line, and all output was captured in JSON format, e.g.:

<a id="p0137"></a>

bash$ claude --model "claude-sonnet-4-20250514" --print --output-format "json" &lt;prompt&gt; 

<a id="p0138"></a>

For the 30 open-ended AlphaGenome queries, each question was designed to require the agent to (1) independently formulate an analysis plan, (2) compose multiple tool calls (e.g., comparing variant effect predictions across tissues, integrating motif and QTL evidence, or evaluating multiple candidate variants), and (3) synthesize results into a biological conclusion. These queries were scored by two domain experts using a predefined rubric based on key entity matching (e.g., correct gene, variant, tissue, or biological conclusion).

<a id="p0139"></a>

For the AlphaGenome agent generated by Paper2Agent, each benchmark query was wrapped in a system prompt instructing the agent to use the available AlphaGenome MCP tools, return a structured JSON response containing both the final answer and step-by-step reasoning, and retrieve the API key from the project environment. The agent received no additional context beyond the MCP tool definitions and the query itself. For the Claude + Repo baseline, we used Claude Code with access to a local clone of the AlphaGenome repository. The system prompt instructed the agent to write and execute Python code using the AlphaGenome library to answer each query, explicitly prohibiting the agent from copying answers from tutorial notebooks or documentation. The agent was required to return a structured JSON response with the final answer and the executed code. We utilized the API-based version of Biomni. The system prompt directed the agent to the AlphaGenome repository and API key, and required a structured JSON response. The full prompt templates are provided in Supplementary Note. Our benchmarking tools and analysis are available in the [Paper2Agent repository](<https://github.com/jmiao24/Paper2Agent>).

<a id="p0140"></a>

### Generation and analysis of TISSUE agent

<a id="p0141"></a>

We applied the Paper2Agent framework to the TISSUE paper to generate a TISSUE MCP and connect it with Claude Code to create the TISSUE agent. To assess reproducibility, we compared the TISSUE agent’s outputs against those generated by human researchers using identical Mouse somatosensory cortex ST data<sup>44</sup>. Human researchers performed the analysis based on the tutorial in the TISSUE GitHub repository.

<a id="p0142"></a>

### Generation and analysis of Scanpy agent

<a id="p0143"></a>

The Paper2Agent framework was applied to the Scanpy software package to generate a Scanpy agent. This agent was restricted to the preprocessing and clustering workflows within Scanpy, providing a focused and reproducible pipeline for single-cell RNA-seq analysis. The resulting MCP server was deployed and integrated with Claude Code, creating a Scanpy agent. 

<a id="p0144"></a>

To construct the workflow in MCP prompts, we prompted Paper2Agent with: “Based on the tools you have, construct an MCP prompt to replicate the tutorial in the correct order. Always inspect the data first, and only deviate from the default settings if adhering to them would yield incorrect results.” This ensured that the generated MCP prompts encoded the standard Scanpy preprocessing and clustering pipeline in a reproducible and interpretable manner.

<a id="p0145"></a>

Reproducibility was evaluated by comparing the agent’s outputs with results obtained by human researchers following the official Scanpy reference tutorials. Three publicly available 10x Genomics PBMC single-cell RNA-seq datasets and four additional datasets were together used for benchmarking (Data availability). Across these datasets, the agent faithfully reproduced key workflow steps—including gene filtering, normalization, principal component analysis, neighborhood graph construction, and clustering—and produced results consistent with human-executed analyses.

<a id="p0146"></a>

### Large-scale evaluation of Paper2Agent

<a id="p0147"></a>

To evaluate the generalizability, scalability, and robustness of Paper2Agent, we conducted a systematic evaluation across three corpora, all processed end-to-end by Paper2Agent without manual cleanup, code modification, or intervention. (i) 100 computational biology papers retrospectively sampled from bioRxiv’s bioinformatics category by iterating backward chronologically from December 2025, without filtering for documentation quality, repository maintenance status, or code completeness, ensuring the sample reflects the natural heterogeneity of research code in practice. (ii) 26 data- and discovery-focused papers (13 bioRxiv and 13 Nature, year 2025) reporting experimental results, datasets, or discoveries with accompanying supplementary materials, used to evaluate Paper2Agent’s structured resource layer over manuscript text, supplementary files, and metadata. (iii) 10 non-biology computational papers spanning diverse programming paradigms and scientific domains: grf  (causal inference and econometrics), SAELens  (mechanistic interpretability), Binoculars  (natural language processing), SAM2  (computer vision), TabPFN  (tabular machine learning), GenericML  (heterogeneous treatment effects), CausalImpact  (Bayesian structural time-series inference), Nashpy  (computational game theory), emcee  (affine-invariant MCMC), and conformal-selection  (FDR-controlled selective inference). Successful agentification was defined as the generated MCP server completing tool extraction, execution, and automated validation end-to-end without human intervention.

<a id="p0148"></a>

For the 74 successfully agentified computational biology papers, we derived 300 tutorial-based benchmark questions, with ground-truth answers obtained by executing the original code and verifying against the tutorial outputs. For the 26 data- and discovery-focused papers, we curated 100 synthesis-based questions requiring integration across main text and supplementary materials, including reinterpretation tasks (e.g., “The paper reports results using Pearson correlation; reanalyze the conclusions using Spearman correlation”) and cross-referencing across tables, figures, and narrative text. For the 10 non-biology computational papers, we constructed 42 execution-based benchmark questions. Detailed prompts for all evaluations are provided in the Supplementary Note.

<a id="p0149"></a>

For benchmarking on computational biology papers, the primary baseline was Claude Code with direct repository access (Claude + Repo). In this setup, the agent was provided with the full code repository and paper but without any MCP tools, structured resources, or prompts, and was given the same queries to answer by writing and executing code. We did not include Biomni in this benchmark due to its high cost. Primary evaluations used Sonnet 4 (claude-sonnet-4-20250514); an additional Claude + Repo baseline used Sonnet 4.6 on the same 300 questions. For benchmarking on data- and discovery-focused papers, the baseline was Claude with browser-use capabilities and direct access to the paper URL, representing a strong human-assisted LLM setup in which the agent can browse and read the paper directly.

<a id="p0150"></a>

We report mean accuracy ± standard error (SE) across questions using a bootstrap procedure. To compare Paper2Agent with baselines, we used paired t-tests on per-run accuracy for tutorial-based benchmarks and bootstrap hypothesis tests (10,000 resamples) for the large-scale 100-paper evaluation, reporting 95% confidence intervals for the accuracy differences. API costs were tracked by logging all LLM API calls during both MCP construction and downstream query answering. For MCP construction, we report total cost (the sum of all API calls across sub-agents) and time from pipeline initiation to MCP server creation. For query-time evaluation, we report per-query cost and latency, measured as time from query submission to final answer.

<a id="p0151"></a>

To evaluate false positive behavior, we constructed an adversarial out-of-scope benchmark by randomly permuting paper-question pairs across the 26 data- and discovery-focused papers, ensuring each question was paired with a paper that does not contain the relevant information. We evaluated Paper2Agent under two conditions: (i) with an explicit rejection instruction (“If the question is not related to the files, say ‘I don’t know’ ”), and (ii) without any explicit rejection instruction. In both conditions, we measured the correct rejection rate, defined as the fraction of out-of-scope queries for which the agent declined to answer rather than producing a hallucinated response.

<a id="p0152"></a>

To probe for potential tutorial-specific memorization, we performed a targeted inspection of generated MCP server implementations across the 100 computational biology papers. We examined whether extracted tools contained hard-coded tutorial constants, fixed file paths, cached outputs, or dataset-dependent heuristics. In addition, we implemented an automated reviewer agent that scans generated MCP server Python files to flag potential hard-coded values, fixed dataset paths, cached outputs, or tutorial-specific logic, providing a systematic check for implementation-level shortcut learning beyond manual inspection.

<a id="p0153"></a>

We conducted five ablated variants of the full system using AlphaGenome and evaluated their performance using 30 tutorial and novel benchmark questions. In the monolithic agent setting, all sub-tasks, including environment setup, tutorial scanning, tool extraction, and testing, were executed within a single agent using a single 200K-token context window, without decomposition into specialized sub-agents. In the non-parallel multi-agent setting, the same four sub-agents were used but were forced to run sequentially rather than in parallel, isolating the contribution of parallel orchestration to runtime efficiency. In the no test-verifier-improver setting, the test-verifier-improver sub-agent was removed, and extracted tools were deployed without iterative validation against tutorial outputs, testing whether automated verification is essential for tool correctness. In the Markdown skill files variant, MCP tools were replaced with Markdown skill files using Claude Code’s Skills feature, which encode tool usage instructions as structured text rather than executable tools. Finally, in the alternative scaffolding (OpenCode) variant, the Claude Code backend was replaced with OpenCode, testing whether MCP construction quality depends on the specific agent scaffolding. All evaluations used claude-sonnet-4-20250514 as the base model.

<a id="p0154"></a>

To evaluate robustness to upstream code defects, we constructed adversarial variants of three representative repositories: AlphaGenome (Python notebook–based), POP-TOOLS  (Python command-line–based)<sup>45</sup>, and mlearner  (R command-line–based)<sup>46</sup>. For each repository, we injected four categories of execution-level errors. These included missing dependencies, in which required packages were removed from environment specification files such as requirements.txt, DESCRIPTION, or README installation instructions; broken file paths, where input paths were modified to reference nonexistent directories or filenames; typographical errors, introduced by misspelling function names, package names, or variable names in executable code cells or scripts; and deprecated API calls, where valid function calls were replaced with deprecated or incompatible alternatives. Each error type was injected independently into each repository, yielding 12 adversarial configurations in total. All modifications were applied prior to running Paper2Agent and were not disclosed to the agent. Paper2Agent was tasked with performing the standard agentification pipeline on each adversarial repository. We recorded whether the agent detected the injected errors, the repair strategies employed, and whether the final MCP server passed all validation tests. Detailed examples of injected errors and observed agent behavior are provided in Supplementary Note. To evaluate whether executable tutorials are required, we removed all executable tutorials from POP-TOOLS while retaining the README and source code, then ran the standard Paper2Agent pipeline. We assessed whether the resulting MCP server exposed functional tools and reproduced human-executed POP-TOOLS CLI outputs across five analysis tasks; full details are provided in Supplementary Note. All the benchmarking questions and GitHub repositories are provided in the [Paper2Agent repository](<https://github.com/jmiao24/Paper2Agent>).

<a id="p0155"></a>

### AI co-scientist analysis for causal gene prioritization at the rs887314 locus for psoriasis

<a id="p0156"></a>

We aim to prioritize and validate candidate causal genes associated with the psoriasis risk variant rs887314 using three Paper2Agent-generated agents: an AlphaGenome agent for computational variant effect prediction, an MPRA-coupled scCRISPRi agent that provides cis-regulatory element (CRE) perturbation effects on gene expression in primary human CD4+ T cells, and a CD4+ T cells Perturb-seq agent that provides transcriptome-wide gene expression profiles following individual gene knockdowns under three culture conditions (Rest, Stim8hr, Stim48hr). All agents exposed their underlying datasets, metadata, and supplementary tables as structured, queryable resources. The AlphaGenome agent was prompted to score rs887314 across all available prediction modalities, with analyses restricted to CD4+ T cells. For each gene within the local genomic window surrounding rs887314, the agent returned a predicted expression impact score, and genes were ranked according to these predicted effects. Then, we instructed the AI co-scientist with access to the MPRA scCRISPRi and CD4+ T cells Perturb-seq paper and data under human-in-the-loop supervision. The full prompts and documentation of human interventions are provided in Supplementary Note.

<a id="p0158"></a>

## Methods References

<a id="p0159"></a>

44.	Sun, E. Single-cell Spatial Transcriptomics Data with Paired RNAseq for TISSUE spatial gene expression prediction. Zenodo https://doi.org/10.5281/zenodo.8259942 (2024).

<a id="p0160"></a>

45.	Miao, J. et al. Valid inference for machine learning-assisted genome-wide association studies. Nature genetics 56, 2361–2369 (2024).

<a id="p0161"></a>

46.	Miao, J. et al. Polygenic prediction of treatment efficacy with causal transfer learning. medRxiv 2025.10. 15.25338051 (2025).

<a id="p0162"></a>

## Data availability

<a id="p0163"></a>

This paper utilized publicly available data for analysis:

<a id="p0164"></a>

10x Genomics single-cell RNA-seq datasets: http://cf.10xgenomics.com/samples/cell-exp/3.0.0/pbmc\_1k\_v2/pbmc\_1k\_v2\_filtered\_feature\_bc\_matrix.h5; http://cf.10xgenomics.com/samples/cell-exp/3.0.0/pbmc\_1k\_v3/pbmc\_1k\_v3\_filtered\_feature\_bc\_matrix.h5; http://cf.10xgenomics.com/samples/cell-exp/3.0.0/pbmc\_1k\_protein\_v3/pbmc\_1k\_protein\_v3\_filtered\_feature\_bc\_matrix.h5; http://cf.10xgenomics.com/samples/cell-exp/6.0.0/Brain\_Tumor\_3p\_LT/Brain\_Tumor\_3p\_LT\_filtered\_feature\_bc\_matrix.h5; http://cf.10xgenomics.com/samples/cell-exp/3.0.0/neuron\_1k\_v3/neuron\_1k\_v3\_filtered\_feature\_bc\_matrix.h5; http://cf.10xgenomics.com/samples/cell-exp/3.0.0/neuron\_10k\_v3/neuron\_10k\_v3\_filtered\_feature\_bc\_matrix.h5; http://cf.10xgenomics.com/samples/cell-exp/3.0.0/heart\_1k\_v3/heart\_1k\_v3\_filtered\_feature\_bc\_matrix.h5.

<a id="p0165"></a>

Mouse somatosensory cortex spatial transcriptomics data (Dataset 15): [https://doi.org/10.5281/zenodo.8259942](<https://doi.org/10.5281/zenodo.8259942>).

<a id="p0166"></a>

ADHD GWAS summary statistics: [https://www.ebi.ac.uk/gwas/studies/GCST90568440](<https://www.ebi.ac.uk/gwas/studies/GCST90568440>) and [https://www.ebi.ac.uk/gwas/studies/GCST90568441](<https://www.ebi.ac.uk/gwas/studies/GCST90568441>).

<a id="p0167"></a>

GTEx portal: [https://gtexportal.org/home/snp/chr1\_109274968\_G\_T\_b38](<https://gtexportal.org/home/snp/chr1_109274968_G_T_b38>)

<a id="p0168"></a>

CD4+ T-cell perturb-seq data: [https://virtualcellmodels.cziscience.com/dataset/genome-scale-tcell-perturb-seq](<https://virtualcellmodels.cziscience.com/dataset/genome-scale-tcell-perturb-seq>)

<a id="p0169"></a>

MPRA-coupled scCRISPRi data for cis-regulatory element perturbation: [https://static-content.springer.com/esm/art%3A10.1038%2Fs41588-025-02301-3/MediaObjects/41588\_2025\_2301\_MOESM4\_ESM.xlsx](<https://static-content.springer.com/esm/art:10.1038/s41588-025-02301-3/MediaObjects/41588_2025_2301_MOESM4_ESM.xlsx>)

<a id="p0170"></a>

## Code availability

<a id="p0171"></a>

Paper2Agent is publicly available at [https://github.com/jmiao24/Paper2Agent](<https://github.com/jmiao24/Paper2Agent>).  
AlphaGenome MCP server: [https://huggingface.co/spaces/Paper2Agent/alphagenome\_mcp](<https://huggingface.co/spaces/Paper2Agent/alphagenome_mcp>).  
Scanpy MCP server: [https://huggingface.co/spaces/Paper2Agent/scanpy\_mcp](<https://huggingface.co/spaces/Paper2Agent/scanpy_mcp>).  
TISSUE MCP server: [https://huggingface.co/spaces/Paper2Agent/tissue\_mcp](<https://huggingface.co/spaces/Paper2Agent/tissue_mcp>).

<a id="p0172"></a>

## Agent availability

<a id="p0173"></a>

Paper2Agent-generated AlphaGenome agent is publicly available at [https://huggingface.co/spaces/Paper2Agent/alphagenome\_agent](<https://huggingface.co/spaces/Paper2Agent/alphagenome_agent>).

<a id="p0174"></a>

## Acknowledgements 

<a id="p0175"></a>

We thank Abubakar Abid, Eric Sun, Emma Dann, members of the Zou lab and the Pritchard lab for helpful feedback during the project. 

<a id="p0176"></a>

## Author contributions

<a id="p0177"></a>

J.M. and J.Z. conceived the study. J.M. designed and developed the framework. J.M., J.D. and Y.Z. performed the benchmarking. J.M. performed the case studies. J.K.P. and J.Z. supervised the project. J.M. and J.Z. drafted the manuscript. All authors discussed the results and reviewed and edited the manuscript.

<a id="p0178"></a>

## Funding

<a id="p0179"></a>

This work was supported by the US National Institutes of Health (grant R01HG014005). J.Z. is supported by funding from the Chan-Zuckerberg Biohub.

<a id="p0180"></a>

## Competing interests

<a id="p0181"></a>

The authors declare no competing interests.

<a id="p0182"></a>

Correspondence and requests for materials should be addressed to Jiacheng Miao ([jcmiao@stanford.edu](<mailto:jcmiao@stanford.edu>)) or James Zou (jamesz@stanford.edu).

<a id="p0183"></a>

Reprints and permissions information is available at http://www.nature.com/reprints

<a id="p0184"></a>

## Extended Data Figure Legends

<a id="p0185"></a>

### Extended Data Fig

[Extended Data Fig image](../assets/supp_figs/extended-data-figure-1.jpg)

Extended Data Fig. 1. Overview of the Paper2Agent-generated TISSUE agent. (A) Construction of the TISSUE MCP server and agent. (B) Q&amp;A support for uncertainty-aware spatial transcriptomics analysis. (C) Reproducibility confirmed by matching human researcher results. (D) Structured MCP resources enable standardized dataset access and automated downloads.

<a id="p0186"></a>

### Extended Data Fig

[Extended Data Fig image](../assets/supp_figs/extended-data-figure-2.jpg)

Extended Data Fig. 2. Paper2Agent enables autonomous AI-driven collaboration and genomic discovery. (A) Paper2Agent transforms scientific papers into Model Context Protocol (MCP) resources for both methods and data, allowing an AI co-scientist to integrate them and autonomously generate novel hypotheses and actionable research plans. (B) Using the ADHD GWAS dataset and the AlphaGenome method MCPs, the agent autonomously generates and tests scientific hypotheses, prioritizes causal variants, and interprets molecular mechanisms. The agent prioritized rs1626703 as a likely causal variant among 209 candidate variants. The agent then showed computationally using AlphaGenome that rs1626703 may alter splicing of MPHOSPH9 and increase its expression in glutamatergic neurons, generating a candidate mechanistic hypothesis for ADHD risk that remains to be validated experimentally.
