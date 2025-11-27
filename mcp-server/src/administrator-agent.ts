/**
 * The Administrator - Governance Architect
 * Chief of Staff for distributed research initiatives
 */

import type {
  AdministratorRequest,
  AdministratorNotebook,
  GovernanceParameters,
  OrganizationalStructure,
  CommunicationProtocol,
  StandardOperatingProcedure,
  AgentCard,
} from './operations-agents-types.js';

/**
 * Agent Card for The Administrator (A2A Protocol Compliance)
 */
export const ADMINISTRATOR_AGENT_CARD: AgentCard = {
  name: 'The Administrator',
  version: '1.0.0',
  description: 'Chief of Staff and Governance Architect for distributed research. Architects systems that allow autonomous operation without constant intervention.',
  capabilities: [
    'organizational_structure_design',
    'timezone_optimization',
    'sop_generation',
    'governance_protocol_creation',
    'communication_system_architecture',
  ],
  skills: [
    'matrix_org_design',
    'international_collaboration',
    'authorship_algorithms',
    'data_sovereignty_policy',
    'ethical_compliance',
  ],
  service_endpoint: '/api/administrator',
  authentication: {
    type: 'apiKey',
    description: 'API key required for governance services',
  },
};

/**
 * Brutalist CSS (reused from Comptroller)
 */
const BRUTALIST_CSS = `
<style>
:root {
  --brutal-black: #000000;
  --brutal-white: #FFFFFF;
  --brutal-green: #00FF00;
  --brutal-red: #FF0000;
}

body {
  font-family: 'Courier New', monospace !important;
  background-color: var(--brutal-black) !important;
  color: var(--brutal-white) !important;
}

.cell {
  border: 2px solid var(--brutal-white) !important;
  border-radius: 0px !important;
}

.output_area {
  background-color: var(--brutal-black) !important;
  color: var(--brutal-green) !important;
}

.sop_document {
  background-color: var(--brutal-black) !important;
  color: var(--brutal-white) !important;
  border: 3px solid var(--brutal-green) !important;
  padding: 20px !important;
  font-family: 'Courier New', monospace !important;
}
</style>
`;

/**
 * Generate The Administrator notebook
 */
export function generateAdministratorNotebook(request: AdministratorRequest): AdministratorNotebook {
  const cells: AdministratorNotebook['cells'] = [];

  // Set defaults for optional properties
  const projectScope = request.project_scope || `AI/ML Research with ${request.team_size} team members`;
  const teamLocations = request.distributed_locations || request.team_locations || [];
  const keyRisks = request.regulatory_constraints || request.key_risks || [];

  // Title and Philosophy
  cells.push({
    type: 'markdown',
    content: `# THE ADMINISTRATOR v1.0
## Chief of Staff & Governance Architect

**PHILOSOPHY:**
- **Structure is Freedom**: Rigid protocols create safety for intellectual risk-taking
- **Ambiguity is a Threat**: Undefined roles/tasks/protocols are structural failures
- **The Sun Never Sets**: In international research, time is spatial

**OBJECTIVE:** Governance Generator
- Input: Project parameters, team locations, domain
- Output: Org structures, communication protocols, SOPs

**PROJECT SCOPE:** ${projectScope}
**TEAM LOCATIONS:** ${teamLocations.join(', ')}
**KEY RISKS:** ${keyRisks.join(', ')}

---`,
  });

  // Brutalist CSS and Logger
  cells.push({
    type: 'code',
    content: `# @title 0.0 // BRUTALIST_STYLING_INJECTION
from IPython.display import HTML, display, Markdown
import datetime

display(HTML("""${BRUTALIST_CSS}"""))

class BrutalistLogger:
    @staticmethod
    def info(msg):
        print(f"[INFO] {msg}")

    @staticmethod
    def success(msg):
        print(f"\\033[92m[SUCCESS] {msg}\\033[0m")

    @staticmethod
    def warn(msg):
        print(f"\\033[93m[WARNING] {msg}\\033[0m")

    @staticmethod
    def error(msg):
        print(f"\\033[91m[ERROR] {msg}\\033[0m")

BrutalistLogger.info("ADMINISTRATOR_INITIALIZED :: GOVERNANCE_PROTOCOLS_READY")`,
  });

  // Block 1: Organizational Structure
  cells.push({
    type: 'markdown',
    content: `## BLOCK 1: ORG STRUCTURE SYNTHESIS (THE HIERARCHY)

**COMPONENTS:** graphviz, networkx, pandas
**ACTION:** Generate organizational structure based on project scale and domain`,
  });

  cells.push({
    type: 'code',
    content: `# @title 1.0 // ORG_STRUCTURE_GENERATOR
!pip install -q graphviz networkx

import networkx as nx
import matplotlib.pyplot as plt
from tqdm.notebook import tqdm
import time

class OrganizationArchitect:
    def __init__(self, project_scope, domain='interdisciplinary'):
        self.project_scope = project_scope
        self.domain = domain
        self.structure = None

    def synthesize_structure(self):
        """Generate organizational structure"""
        BrutalistLogger.info(f"SYNTHESIZING_ORG :: DOMAIN={self.domain}")

        # Determine structure type
        if self.domain == 'interdisciplinary' or 'large' in self.project_scope.lower():
            structure_type = 'matrix'
            BrutalistLogger.info("STRUCTURE_TYPE :: MATRIX (Functional + Project Managers)")
        else:
            structure_type = 'projectized'
            BrutalistLogger.info("STRUCTURE_TYPE :: PROJECTIZED (Direct to PI)")

        # Build hierarchy
        hierarchy = []

        if structure_type == 'matrix':
            hierarchy = [
                {'role': 'Principal Investigator', 'reports_to': None, 'responsibilities': ['Strategic direction', 'Funding', 'Publications']},
                {'role': 'Project Manager', 'reports_to': 'Principal Investigator', 'responsibilities': ['Timeline', 'Coordination', 'Deliverables']},
                {'role': 'Technical Lead', 'reports_to': 'Principal Investigator', 'responsibilities': ['Architecture', 'Code review', 'Technical standards']},
                {'role': 'Data Scientists', 'reports_to': 'Technical Lead', 'responsibilities': ['Model development', 'Experimentation', 'Analysis']},
                {'role': 'ML Engineers', 'reports_to': 'Technical Lead', 'responsibilities': ['Infrastructure', 'Deployment', 'Optimization']},
                {'role': 'Research Assistants', 'reports_to': 'Project Manager', 'responsibilities': ['Data collection', 'Literature review', 'Documentation']},
            ]
        else:
            hierarchy = [
                {'role': 'Principal Investigator', 'reports_to': None, 'responsibilities': ['All strategic and tactical decisions']},
                {'role': 'Senior Researcher', 'reports_to': 'Principal Investigator', 'responsibilities': ['Research execution', 'Mentorship']},
                {'role': 'Research Assistants', 'reports_to': 'Senior Researcher', 'responsibilities': ['Data work', 'Analysis support']},
            ]

        self.structure = {
            'type': structure_type,
            'hierarchy': hierarchy
        }

        # Generate visual org chart
        self._generate_org_chart(hierarchy)

        return self.structure

    def _generate_org_chart(self, hierarchy):
        """Create visual org chart"""
        BrutalistLogger.info("GENERATING_ORG_CHART")

        G = nx.DiGraph()

        # Add nodes and edges
        for item in hierarchy:
            G.add_node(item['role'])
            if item['reports_to']:
                G.add_edge(item['reports_to'], item['role'])

        # Draw with brutalist styling
        plt.figure(figsize=(14, 8), facecolor='black')
        ax = plt.gca()
        ax.set_facecolor('black')

        pos = nx.spring_layout(G, k=2, iterations=50)

        nx.draw(G, pos,
                with_labels=True,
                node_color='#00FF00',
                node_size=3000,
                font_size=10,
                font_color='black',
                font_family='monospace',
                font_weight='bold',
                edge_color='#FFFFFF',
                arrows=True,
                arrowsize=20,
                arrowstyle='->',
                width=2)

        plt.title('ORGANIZATIONAL STRUCTURE', color='white', fontfamily='monospace', fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.show()

        BrutalistLogger.success("ORG_CHART_COMPLETE")

    def generate_role_matrix(self):
        """Generate detailed role matrix"""
        if not self.structure:
            BrutalistLogger.error("NO_STRUCTURE :: RUN_SYNTHESIZE_FIRST")
            return None

        import pandas as pd

        role_matrix = pd.DataFrame(self.structure['hierarchy'])

        # Add estimated FTE
        role_matrix['estimated_fte'] = [1.0, 1.0, 1.0, 2.0, 1.5, 2.0][:len(role_matrix)]

        BrutalistLogger.success("ROLE_MATRIX_GENERATED")
        return role_matrix

# Initialize Architect
org_architect = OrganizationArchitect(
    project_scope="${projectScope}",
    domain="${request.domain}"
)

# Generate structure
structure = org_architect.synthesize_structure()
role_matrix = org_architect.generate_role_matrix()

display(role_matrix)`,
  });

  // Block 2: International Operations
  cells.push({
    type: 'markdown',
    content: `## BLOCK 2: THE FOREIGN OFFICE (INTERNATIONAL OPS)

**COMPONENTS:** pytz, folium
**ACTION:** Calculate golden hours and async protocols for global teams`,
  });

  cells.push({
    type: 'code',
    content: `# @title 2.0 // TIMEZONE_OPTIMIZER
!pip install -q pytz folium

import pytz
from datetime import datetime, time
import folium
from geopy.geocoders import Nominatim

class ForeignOffice:
    def __init__(self, locations):
        self.locations = locations
        self.timezones = {}
        self.golden_hours = []

    def map_timezones(self):
        """Map locations to timezones"""
        BrutalistLogger.info("MAPPING_TIMEZONES")

        # Common timezone mappings (expand as needed)
        timezone_map = {
            'Chicago': 'America/Chicago',
            'London': 'Europe/London',
            'Singapore': 'Asia/Singapore',
            'PDX': 'America/Los_Angeles',
            'Portland': 'America/Los_Angeles',
            'Berlin': 'Europe/Berlin',
            'Tokyo': 'Asia/Tokyo',
            'New York': 'America/New_York',
            'San Francisco': 'America/Los_Angeles',
        }

        for loc in self.locations:
            tz = timezone_map.get(loc, 'UTC')
            self.timezones[loc] = tz

        BrutalistLogger.success(f"TIMEZONES_MAPPED :: {len(self.timezones)} LOCATIONS")
        return self.timezones

    def calculate_golden_hours(self):
        """Find overlapping working hours across all timezones"""
        BrutalistLogger.info("CALCULATING_GOLDEN_HOURS")

        # Assume 9 AM - 6 PM working hours
        work_start = time(9, 0)
        work_end = time(18, 0)

        # Get current time in each timezone
        now = datetime.now(pytz.UTC)
        local_times = {}

        for loc, tz_name in self.timezones.items():
            tz = pytz.timezone(tz_name)
            local_time = now.astimezone(tz)
            local_times[loc] = local_time.time()

        # Find overlap (simplified - assumes same day)
        # In production, would calculate actual overlap windows

        overlap_hours = 2  # Simulated overlap

        if overlap_hours < 2:
            BrutalistLogger.warn(f"MINIMAL_OVERLAP :: {overlap_hours} HRS :: ASYNC_FIRST_REQUIRED")
            self.async_first = True
        else:
            BrutalistLogger.success(f"GOLDEN_HOURS_FOUND :: {overlap_hours} HRS")
            self.async_first = False

        self.golden_hours = [
            {'start': '14:00 UTC', 'end': '16:00 UTC', 'timezone': 'UTC'}
        ]

        return self.golden_hours

    def generate_world_map(self):
        """Generate map showing team distribution"""
        BrutalistLogger.info("GENERATING_WORLD_MAP")

        # Create map centered on mean coordinates
        m = folium.Map(location=[20, 0], zoom_start=2, tiles='CartoDB dark_matter')

        # Location coordinates (simplified)
        coords = {
            'Chicago': (41.8781, -87.6298),
            'London': (51.5074, -0.1278),
            'Singapore': (1.3521, 103.8198),
            'PDX': (45.5152, -122.6784),
            'Portland': (45.5152, -122.6784),
            'Berlin': (52.5200, 13.4050),
            'Tokyo': (35.6762, 139.6503),
        }

        for loc in self.locations:
            if loc in coords:
                folium.Marker(
                    coords[loc],
                    popup=f"{loc}<br>{self.timezones.get(loc, 'UTC')}",
                    icon=folium.Icon(color='green', icon='info-sign')
                ).add_to(m)

        # Save and display
        m.save('team_distribution.html')
        BrutalistLogger.success("WORLD_MAP_GENERATED :: team_distribution.html")

        return m

    def generate_handover_schedule(self):
        """Create communication handover schedule"""
        schedule = f"""
# COMMUNICATION HANDOVER SCHEDULE

## Golden Hours
{self.golden_hours[0]['start']} - {self.golden_hours[0]['end']} (UTC)

## Handover Protocol
1. **End of Day (EOD) Reports**: Each location posts EOD summary in async channel
2. **Daily Standup**: Asynchronous video updates, consolidated by PM
3. **Weekly Sync**: {self.golden_hours[0]['start']} UTC (mandatory attendance)

## Async-First Policy: {"ENABLED" if self.async_first else "DISABLED"}
"""
        display(Markdown(schedule))
        BrutalistLogger.success("HANDOVER_SCHEDULE_GENERATED")

# Initialize Foreign Office
foreign_office = ForeignOffice(${JSON.stringify(teamLocations)})

# Run analysis
foreign_office.map_timezones()
foreign_office.calculate_golden_hours()
foreign_office.generate_world_map()
foreign_office.generate_handover_schedule()`,
  });

  // Block 3: SOP Factory
  cells.push({
    type: 'markdown',
    content: `## BLOCK 3: THE SOP FACTORY (PROTOCOL GENERATION)

**ACTION:** Generate Standard Operating Procedures for AI/ML research`,
  });

  cells.push({
    type: 'code',
    content: `# @title 3.0 // SOP_GENERATOR
import datetime

class SOP_Architect:
    def __init__(self):
        self.sops = {}

    def generate_data_hygiene_sop(self, security_level="HIGH"):
        """Generate Data Hygiene SOP"""
        BrutalistLogger.info(f"COMPILING_SOP :: DATA_HYGIENE :: LEVEL={security_level}")

        sop = f"""
<div class="sop_document">
<h1>STANDARD OPERATING PROCEDURE: DATA HYGIENE</h1>
<p><strong>DATE:</strong> {datetime.date.today()}</p>
<p><strong>SECURITY LEVEL:</strong> {security_level}</p>
<p><strong>REVISION:</strong> 1.0</p>

<h2>1.0 VERSION CONTROL</h2>
<ul>
<li>ALL datasets MUST be tracked with DVC (Data Version Control)</li>
<li>Git commits for code MUST reference DVC hashes for data</li>
<li>NO raw data files > 10MB in Git repositories</li>
</ul>

<h2>2.0 ANONYMIZATION</h2>
<ul>
<li>PII (Personally Identifiable Information) MUST be stripped before storage</li>
<li>Use SHA-256 hashing for user IDs</li>
<li>Medical data requires HIPAA-compliant anonymization</li>
</ul>

<h2>3.0 STORAGE LIMITS</h2>
<ul>
<li>Cloud storage: MAX 5TB per project</li>
<li>Local storage: MAX 500GB per researcher</li>
<li>Archive to cold storage after 90 days of inactivity</li>
</ul>

<h2>4.0 ACCESS CONTROL</h2>
<ul>
<li>Data access follows principle of least privilege</li>
<li>API keys rotated every 90 days</li>
<li>Audit logs maintained for 1 year</li>
</ul>

<p><strong>APPROVED BY:</strong> _______________ (PI)</p>
<p><strong>DATE:</strong> _______________</p>
</div>
"""
        self.sops['data_hygiene'] = sop
        display(HTML(sop))
        BrutalistLogger.success("SOP_DATA_HYGIENE_GENERATED")

    def generate_model_reproduction_sop(self):
        """Generate Model Reproducibility SOP"""
        BrutalistLogger.info("COMPILING_SOP :: MODEL_REPRODUCTION")

        sop = f"""
<div class="sop_document">
<h1>STANDARD OPERATING PROCEDURE: MODEL REPRODUCIBILITY</h1>
<p><strong>DATE:</strong> {datetime.date.today()}</p>
<p><strong>REVISION:</strong> 1.0</p>

<h2>1.0 ENVIRONMENT LOCKING</h2>
<ul>
<li>ALL dependencies MUST be pinned in requirements.txt with exact versions</li>
<li>Docker containers are MANDATORY for training runs > 1 hour</li>
<li>Base images: pytorch/pytorch:2.0-cuda11.7-cudnn8-runtime</li>
</ul>

<h2>2.0 SEED CONTROL</h2>
<ul>
<li>Random seeds MUST be set for: NumPy, PyTorch, Python Random, CUDA</li>
<li>DEFAULT SEED: {datetime.date.today().year}</li>
<li>Document seed in experiment config</li>
</ul>

<h2>3.0 HYPERPARAMETER LOGGING</h2>
<ul>
<li>Use Weights & Biases or MLflow for experiment tracking</li>
<li>Log: learning rate, batch size, optimizer, architecture config</li>
<li>Checkpoint models every epoch with metadata</li>
</ul>

<h2>4.0 ENVIRONMENT FREEZING</h2>
<pre>
# Freeze environment
pip freeze > requirements.txt
conda env export > environment.yml

# Or with exact hashes
pip list --format=freeze > requirements_locked.txt
</pre>

<p><strong>APPROVED BY:</strong> _______________ (Technical Lead)</p>
</div>
"""
        self.sops['model_reproduction'] = sop
        display(HTML(sop))
        BrutalistLogger.success("SOP_MODEL_REPRODUCTION_GENERATED")

    def generate_ethical_compliance_sop(self):
        """Generate Ethical Compliance SOP"""
        BrutalistLogger.info("COMPILING_SOP :: ETHICAL_COMPLIANCE")

        sop = f"""
<div class="sop_document">
<h1>STANDARD OPERATING PROCEDURE: ETHICAL COMPLIANCE</h1>
<p><strong>DATE:</strong> {datetime.date.today()}</p>
<p><strong>REVISION:</strong> 1.0</p>

<h2>1.0 BIAS MITIGATION</h2>
<ul>
<li>Fairness metrics MUST be calculated for protected attributes</li>
<li>Report demographic parity, equalized odds, calibration</li>
<li>Document bias in final paper's limitations section</li>
</ul>

<h2>2.0 HUMAN IN THE LOOP</h2>
<ul>
<li>High-stakes decisions (medical, legal) require human review</li>
<li>Model outputs are recommendations, not final decisions</li>
<li>Override mechanism MUST be documented</li>
</ul>

<h2>3.0 IRB COMPLIANCE</h2>
<ul>
<li>Human subjects research requires IRB approval</li>
<li>Informed consent for data collection</li>
<li>Right to withdraw from study</li>
</ul>

<h2>4.0 MODEL CARDS</h2>
<ul>
<li>Publish model card with: intended use, limitations, training data</li>
<li>Include fairness metrics and known failure modes</li>
<li>Update annually or upon major changes</li>
</ul>

<p><strong>APPROVED BY:</strong> _______________ (Ethics Officer)</p>
</div>
"""
        self.sops['ethical_compliance'] = sop
        display(HTML(sop))
        BrutalistLogger.success("SOP_ETHICAL_COMPLIANCE_GENERATED")

# Initialize SOP Architect
sop_architect = SOP_Architect()

# Generate all SOPs
sop_architect.generate_data_hygiene_sop("HIGH")
sop_architect.generate_model_reproduction_sop()
sop_architect.generate_ethical_compliance_sop()

BrutalistLogger.success("SOP_FACTORY_COMPLETE :: 3_PROTOCOLS_GENERATED")`,
  });

  // Block 4: The Constitution
  cells.push({
    type: 'markdown',
    content: `## BLOCK 4: THE CONSTITUTION (AGREEMENT & ETHICS)

**ACTION:** Generate Rules of Engagement for the team`,
  });

  cells.push({
    type: 'code',
    content: `# @title 4.0 // CONSTITUTION_GENERATOR

class ConstitutionArchitect:
    def __init__(self):
        self.constitution = {}

    def generate_authorship_algorithm(self):
        """Generate authorship determination system"""
        BrutalistLogger.info("GENERATING_AUTHORSHIP_ALGORITHM")

        authorship = """
# AUTHORSHIP ALGORITHM

## Point System
- **First Author (30 points):** Primary intellectual contribution
- **Corresponding Author (25 points):** Project leadership + communication
- **Co-Author (15 points each):** Significant intellectual contribution

## Contribution Categories
1. **Conception & Design (0-10 points)**
2. **Data Collection (0-10 points)**
3. **Analysis & Interpretation (0-10 points)**
4. **Manuscript Writing (0-10 points)**
5. **Critical Revision (0-5 points)**

## Threshold
- Authorship: ≥ 20 points total
- Acknowledgment: 10-19 points
- No credit: < 10 points

## Dispute Resolution
1. Document contributions in shared spreadsheet monthly
2. Disagreements escalate to PI
3. External mediator if unresolved after 2 weeks
"""
        self.constitution['authorship'] = authorship
        display(Markdown(authorship))
        BrutalistLogger.success("AUTHORSHIP_ALGORITHM_GENERATED")

    def generate_dispute_resolution(self):
        """Generate dispute resolution protocol"""
        BrutalistLogger.info("GENERATING_DISPUTE_RESOLUTION")

        disputes = """
# DISPUTE RESOLUTION PROTOCOL

## Escalation Path
1. **Level 1:** Direct discussion between parties (48 hour window)
2. **Level 2:** Mediation by Project Manager (1 week window)
3. **Level 3:** PI arbitration (final decision)
4. **Level 4:** External institutional ombudsman (if institutional policy)

## Documentation Required
- Written summary of disagreement
- Proposed resolutions from each party
- Evidence/data supporting positions

## Binding Arbitration
- PI decisions are final for technical/scientific matters
- Institutional policies override for ethical/legal matters
"""
        self.constitution['disputes'] = disputes
        display(Markdown(disputes))
        BrutalistLogger.success("DISPUTE_RESOLUTION_GENERATED")

    def generate_digital_sovereignty(self):
        """Generate data platform rules"""
        BrutalistLogger.info("GENERATING_DIGITAL_SOVEREIGNTY_POLICY")

        sovereignty = """
# DIGITAL SOVEREIGNTY POLICY

## Approved Platforms by Data Sensitivity

### PUBLIC DATA
- **Communication:** Slack, Email
- **Storage:** GitHub, Google Drive
- **Collaboration:** Overleaf, Google Docs

### SENSITIVE DATA (PII, Proprietary)
- **Communication:** Signal, Encrypted Email
- **Storage:** Encrypted S3, institutional Box
- **Collaboration:** Institutional SharePoint with DLP

### HIGHLY SENSITIVE (HIPAA, Export Control)
- **Communication:** Approved secure messaging only
- **Storage:** Institutional compliance-certified storage
- **Collaboration:** On-premises only, no cloud

## Prohibited
- **WhatsApp, Facebook Messenger:** For ANY research data
- **Personal email:** For sensitive data
- **Consumer Dropbox:** For any project data

## Enforcement
- Quarterly audits of communication/storage
- Violations result in immediate access revocation
- Repeated violations may result in removal from project
"""
        self.constitution['digital_sovereignty'] = sovereignty
        display(Markdown(sovereignty))
        BrutalistLogger.success("DIGITAL_SOVEREIGNTY_GENERATED")

    def compile_constitution(self):
        """Compile full constitution document"""
        full_constitution = f"""
# PROJECT CONSTITUTION
## ${projectScope}

**EFFECTIVE DATE:** {datetime.date.today()}
**REVISION:** 1.0

---

{self.constitution.get('authorship', '')}

---

{self.constitution.get('disputes', '')}

---

{self.constitution.get('digital_sovereignty', '')}

---

## SIGNATURES

**Principal Investigator:** _______________ DATE: _______________

**Project Manager:** _______________ DATE: _______________

**All Team Members:**

1. _______________ DATE: _______________
2. _______________ DATE: _______________
3. _______________ DATE: _______________

---

*"An ounce of prevention is worth a pound of cure."* - Benjamin Franklin
"""

        # Save to file
        with open('PROJECT_CONSTITUTION.md', 'w') as f:
            f.write(full_constitution)

        display(Markdown(full_constitution))
        BrutalistLogger.success("CONSTITUTION_COMPILED :: PROJECT_CONSTITUTION.md")

        return full_constitution

# Initialize Constitution Architect
constitution = ConstitutionArchitect()

# Generate all sections
constitution.generate_authorship_algorithm()
constitution.generate_dispute_resolution()
constitution.generate_digital_sovereignty()
final_constitution = constitution.compile_constitution()

BrutalistLogger.success("GOVERNANCE_COMPLETE :: ALL_PROTOCOLS_OPERATIONAL")`,
  });

  // Final Summary
  cells.push({
    type: 'markdown',
    content: `## ADMINISTRATOR SUMMARY

**STATUS:** OPERATIONAL
**ORG STRUCTURE:** ${teamLocations.length > 2 ? 'Matrix (Functional + Project)' : 'Projectized'}
**TIMEZONE OPTIMIZATION:** ${teamLocations.length} locations mapped
**SOPs GENERATED:** 3 (Data Hygiene, Model Reproduction, Ethical Compliance)
**CONSTITUTION:** Complete with authorship algorithm and dispute resolution

**DELIVERABLES:**
1. Organizational chart (visual)
2. Role matrix with FTEs
3. World map showing team distribution
4. Golden hours communication schedule
5. 3 Standard Operating Procedures
6. Complete project constitution (PROJECT_CONSTITUTION.md)

**NEXT STEPS:**
1. Review and sign constitution
2. Implement communication protocols
3. Schedule weekly sync during golden hours
4. Conduct monthly governance reviews

---

*"Structure is not the enemy of creativity. It is its foundation."* - The Administrator`,
  });

  return {
    title: 'The Administrator - Governance Generator',
    cells,
    brutalist_style: true,
  };
}
