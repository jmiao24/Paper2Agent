# Paper2Agent navigation

Choose a topic below, search the named heading in its file, and read the relevant passage. Titles are taken from the documents; line numbers are intentionally omitted. This index is a locator, not evidence for the paper's claims.

## Main manuscript — [paper.md](paper.md)

| Topic | Exact heading or headings | What to look for |
| --- | --- | --- |
| Summary and motivation | `Abstract`; `Introduction` | Main contribution, problem and background |
| Framework | `Overview of Paper2Agent` | Pipeline and agent responsibilities |
| AlphaGenome results | `AlphaGenome Agent for Genomics` | Genomics queries and reported performance |
| Scanpy results | `Scanpy Agent for Single-Cell Analysis` | Single-cell workflow and adaptation |
| Evaluation across papers | `Large-scale evaluation of Paper2Agent` | Appears under both Results and Methods; choose findings or experimental setup |
| Discovery case studies | `Paper Agents Collaborate for Discovery` | ADHD and psoriasis applications |
| Interpretation and limits | `Discussion` | Implications, limitations and future directions |
| Implementation | `Details on implementing Paper2Agent` | Construction procedure and validation |
| AlphaGenome methods | `Generation and analysis of AlphaGenome agent`; `Benchmarking the AlphaGenome agent against Claude + Repo and Biomni` | Setup, baselines and evaluation |
| TISSUE and Scanpy methods | `Generation and analysis of TISSUE agent`; `Generation and analysis of Scanpy agent` | Tool generation and analysis setup |
| Psoriasis methods | `AI co-scientist analysis for causal gene prioritization at the rs887314 locus for psoriasis` | Case-study analysis design |
| Figure captions | `Main Figure Legends`; `Extended Data Figure Legends` | Main Figures 1–4 and Extended Data Figures 1–2, with JPEG links |
| Access to materials | `Data availability`; `Code availability`; `Agent availability` | Dataset, repository and agent access links |
| Citations and disclosures | `References`; `Methods References`; `Acknowledgements`; `Author contributions`; `Funding`; `Competing interests` | Bibliography, credits and disclosures |

## Supplementary information — [supplement.md](supplement.md)

| Topic | Exact heading | What to look for |
| --- | --- | --- |
| Related work | `1 Extended related work` | Scientific agents and executable papers |
| System comparison | `2 Comparison of Paper2Agent with related systems` | Comparison table |
| Construction details | `3 Details for Paper2Agent` | Algorithm and long quoted prompts; use narrower entry points below |
| AlphaGenome benchmarks | `4 Benchmarking the AlphaGenome agent against Claude + Repo and Biomni` | Agent setup, prompts, results and rubrics; narrow below |
| Scanpy adaptation | `5 Scanpy Agent’s Adaptive Parameter Selection` | Organism, mitochondrial prefix and marker selection; supplement Table 2 |
| Spatial transcriptomics | `6 TISSUE Agent for Spatial Transcriptomics` | TISSUE tools and dataset resources |
| Broad evaluation | `7 Additional details for large-scale evaluation of Paper2Agent` | Domains, tasks and evaluation setup |
| Adversarial evaluation | `8 Adversarial Execution Evaluation` | Injection setup and observed agent behavior |
| ADHD discovery | `9.1 ADHD genomics discovery` | Variant prioritization and hypothesis generation |
| Psoriasis discovery | `9.2 AI co-scientist analysis for causal gene prioritization at the rs887314 locus for psoriasis` | Long case study with quoted responses; search within it for the needed gene or strategy |
| Maintenance | `10 Maintenance agent for agent availability` | Dependency changes and ongoing validation |
| Agentification scope | `11 Scope of agentification` | Papers versus collections of related work |
| Security and attribution | `12 Security, intellectual property, and attribution considerations` | Execution, licensing and credit |
| Citations | `References` | Supplement bibliography |
| Figure captions | `Supplementary figures` | Supplementary Figures 1–4 and JPEG links |
| Full supplementary tables | `Supplementary tables` | Supplementary Tables 1–2 and CSV links |

For construction prompts, search `Step 0 Prompt`, `Step 1 Prompt`, `Step 2 Prompt` or `Step 3 Prompt` for language/GPU detection, environment/discovery, tutorial execution or MCP integration respectively. `Algorithm 1:` locates the short pipeline pseudocode. Read the selected prompt in batches if needed.

For benchmarks, narrower headings are `AlphaGenome agent details`, `Claude + Repo agent details`, `Biomni agent details`, `AlphaGenome benchmark results` and `Evaluation rubrics for open-ended queries`. The tutorial rubric is quoted text located by `Grading Rubric for Tutorial AlphaGenome Benchmark`.

## Tables and images

- [Supplementary Table 1 CSV](../assets/supp_table/supplementary-table-1.csv): 39 ADHD locus records; search by rsID or gene. Worksheet `all_loci_modality_scores_with_i`.
- [Supplementary Table 2 CSV](../assets/supp_table/supplementary-table-2.csv): seven Scanpy dataset records and agent choices. Worksheet `scanpy_agent_behaviour`. The shorter **Table 2 inside supplement Section 5** is a separate presentation.
- CSVs preserve Excel row positions: data occupy rows 2–40 and 2–8 respectively; exclude blank rows and final captions from analysis.
- Main images are in `assets/figure/`; extended-data and supplementary images are in `assets/supp_figs/`, relative to the skill root. Use the specific caption's link to open an image.
