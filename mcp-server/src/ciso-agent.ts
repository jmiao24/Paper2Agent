/**
 * The CISO - Chief Information Security Officer
 * Digital Defense Architect with Zero Trust Model
 */

import type {
  CISORequest,
  CISONotebook,
  HighValueAsset,
  AttackSurface,
} from './ciso-agent-types.js';
import type { AgentCard } from './operations-agents-types.js';

/**
 * Agent Card for The CISO (A2A Protocol Compliance)
 */
export const CISO_AGENT_CARD: AgentCard = {
  name: 'The CISO',
  version: '1.0.0',
  description: 'Chief Information Security Officer and Digital Defense Architect. Operates on Zero Trust model with Security by Design and Safety by Design principles. Generates Security Operations Center notebooks with incident response playbooks, threat modeling, cryptographic hygiene, and social engineering defense.',
  capabilities: [
    'threat_modeling',
    'incident_response',
    'cryptographic_hygiene',
    'social_engineering_defense',
    'vulnerability_assessment',
    'zero_trust_architecture',
    'offensive_security',
  ],
  skills: [
    'stride_methodology',
    'crisis_management',
    'ato_protocol',
    'ransomware_response',
    'key_rotation',
    'red_team_simulation',
  ],
  service_endpoint: '/api/ciso',
  authentication: {
    type: 'apiKey',
    description: 'API key required for security operations services',
  },
};

/**
 * Brutalist CSS styling for security notebooks
 */
const BRUTALIST_SECURITY_CSS = `
<style>
:root {
  --sec-black: #000000;
  --sec-white: #FFFFFF;
  --sec-green: #00FF00;
  --sec-red: #FF0000;
  --sec-yellow: #FFFF00;
}

body {
  font-family: 'Courier New', monospace !important;
  background-color: var(--sec-black) !important;
  color: var(--sec-green) !important;
}

.cell {
  border: 2px solid var(--sec-green) !important;
  border-radius: 0px !important;
  margin: 10px 0 !important;
}

.output_area {
  background-color: var(--sec-black) !important;
  color: var(--sec-green) !important;
  font-family: 'Courier New', monospace !important;
}

.critical_alert {
  background-color: var(--sec-red) !important;
  color: var(--sec-white) !important;
  border: 4px solid var(--sec-white) !important;
  font-weight: bold !important;
  padding: 20px !important;
  animation: pulse 2s infinite;
}

.warning {
  background-color: var(--sec-black) !important;
  color: var(--sec-yellow) !important;
  border: 2px solid var(--sec-yellow) !important;
  padding: 10px !important;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.secure_output {
  color: var(--sec-green) !important;
  font-family: 'Courier New', monospace !important;
}

.compromised {
  color: var(--sec-red) !important;
  font-weight: bold !important;
}
</style>
`;

/**
 * Generate The CISO notebook
 */
export function generateCISONotebook(request: CISORequest): CISONotebook {
  const cells: CISONotebook['cells'] = [];

  // Title and Philosophy
  cells.push({
    type: 'markdown',
    content: `# THE CISO v1.0
## Chief Information Security Officer & Digital Defense Architect

**PHILOSOPHY:**
- **Zero Trust**: Never trust, always verify. The network is already compromised.
- **Assume Breach**: Containment is the mission, not prevention.
- **Paranoia is Professionalism**: If you cannot verify it, block it.
- **The Human Element**: Humans are the weakest endpoint. Protect them from themselves.

**OPERATIONAL MODE:** ${request.operational_mode.toUpperCase()}
**THREAT MODEL:** ${request.threat_model.join(', ').toUpperCase()}
${request.regulatory_requirements ? `**COMPLIANCE:** ${request.regulatory_requirements.join(', ')}` : ''}

**HIGH VALUE ASSETS:**
${request.high_value_assets.map((a) => `- ${a.name} (${a.category}, ${a.sensitivity})`).join('\n')}

**ATTACK SURFACES:**
${request.attack_surfaces.map((s) => `- ${s.name} (${s.type}, ${s.exposure})`).join('\n')}

---
**⚠️ WARNING: OPERATIONAL SECURITY**
This notebook contains simulated security protocols. Use in authorized environments only.

---`,
  });

  // Brutalist CSS and Security Logger
  cells.push({
    type: 'code',
    content: `# @title 0.0 // SECURITY_STYLING_INJECTION
from IPython.display import HTML, display, Markdown
import warnings
warnings.filterwarnings('ignore')

# Inject Brutalist Security CSS
display(HTML("""${BRUTALIST_SECURITY_CSS}"""))

class BrutalistSecurityLogger:
    @staticmethod
    def info(msg):
        print(f"[INFO] {msg}")

    @staticmethod
    def success(msg):
        print(f"\\033[92m[SECURE] {msg}\\033[0m")

    @staticmethod
    def warning(msg):
        print(f"\\033[93m[WARNING] {msg}\\033[0m")

    @staticmethod
    def error(msg):
        print(f"\\033[91m[COMPROMISED] {msg}\\033[0m")

    @staticmethod
    def critical(msg):
        print(f"\\033[91m\\033[5m[CRITICAL_THREAT] {msg}\\033[0m")
        display(HTML(f'<div class="critical_alert">⚠️ CRITICAL: {msg}</div>'))

BrutalistSecurityLogger.success("SECURITY_OPERATIONS_CENTER_INITIALIZED")`,
  });

  // Block 1: Threat Modeling (The Risk Matrix)
  cells.push({
    type: 'markdown',
    content: `## BLOCK 1: THREAT MODELING (THE RISK MATRIX)

**METHODOLOGY:** STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
**COMPONENTS:** pandas, seaborn (Heatmaps)
**OUTPUT:** Prioritized Kill List of vulnerabilities`,
  });

  cells.push({
    type: 'code',
    content: `# @title 1.0 // STRIDE_THREAT_MODELING
!pip install -q seaborn pandas

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

class ThreatModeler:
    def __init__(self, assets, surfaces):
        self.assets = assets
        self.surfaces = surfaces
        self.threats = []

    def apply_stride(self):
        """Apply STRIDE methodology to assets and attack surfaces"""
        BrutalistSecurityLogger.info("APPLYING_STRIDE_METHODOLOGY...")

        stride_categories = {
            'Spoofing': ['Authentication bypass', 'Identity theft', 'Session hijacking'],
            'Tampering': ['Data manipulation', 'Code injection', 'Man-in-the-middle'],
            'Repudiation': ['Log tampering', 'Transaction denial', 'Audit evasion'],
            'Information_Disclosure': ['Data leakage', 'Credential exposure', 'Side-channel attacks'],
            'Denial_of_Service': ['Resource exhaustion', 'Network flooding', 'Logic bombs'],
            'Elevation_of_Privilege': ['Privilege escalation', 'Token theft', 'Sudo exploitation']
        }

        for asset in self.assets:
            for surface in self.surfaces:
                # Calculate base risk score
                sensitivity_score = {'public': 1, 'internal': 3, 'confidential': 7, 'restricted': 10}
                exposure_score = {'internal': 2, 'partner_access': 5, 'remote_workforce': 7, 'internet_facing': 10}

                base_risk = (sensitivity_score.get(asset['sensitivity'], 5) +
                           exposure_score.get(surface['exposure'], 5)) / 2

                # Generate threats for each STRIDE category
                for category, attack_types in stride_categories.items():
                    threat = {
                        'Category': category,
                        'Asset': asset['name'],
                        'Surface': surface['name'],
                        'Risk_Score': min(10, base_risk + np.random.uniform(-1, 2)),
                        'Attack_Vector': np.random.choice(attack_types)
                    }
                    self.threats.append(threat)

        self.threats_df = pd.DataFrame(self.threats)
        BrutalistSecurityLogger.success(f"IDENTIFIED_{len(self.threats)}_THREAT_VECTORS")
        return self.threats_df

    def generate_risk_heatmap(self):
        """Generate STRIDE risk heatmap"""
        BrutalistSecurityLogger.info("GENERATING_RISK_HEATMAP...")

        # Pivot for heatmap
        heatmap_data = self.threats_df.pivot_table(
            values='Risk_Score',
            index='Category',
            columns='Surface',
            aggfunc='max'
        )

        plt.figure(figsize=(14, 8), facecolor='black')
        ax = plt.gca()
        ax.set_facecolor('black')

        # Custom colormap: Green (low) to Red (high)
        cmap = sns.color_palette("RdYlGn_r", as_cmap=True)

        sns.heatmap(
            heatmap_data,
            annot=True,
            fmt='.1f',
            cmap=cmap,
            cbar_kws={'label': 'Risk Score'},
            linewidths=2,
            linecolor='white',
            square=True
        )

        plt.title('STRIDE THREAT MATRIX', color='white', fontsize=16, family='monospace')
        plt.xlabel('Attack Surface', color='white', fontsize=12, family='monospace')
        plt.ylabel('STRIDE Category', color='white', fontsize=12, family='monospace')
        plt.xticks(color='white', family='monospace')
        plt.yticks(color='white', family='monospace', rotation=0)
        plt.tight_layout()
        plt.show()

        return heatmap_data

    def generate_kill_list(self, threshold=7.0):
        """Generate prioritized kill list of high-risk vulnerabilities"""
        BrutalistSecurityLogger.warning(f"GENERATING_KILL_LIST :: THRESHOLD={threshold}")

        high_risk = self.threats_df[self.threats_df['Risk_Score'] >= threshold].sort_values(
            'Risk_Score', ascending=False
        )

        print("\\n" + "="*80)
        print("🎯 KILL LIST - PRIORITIZED VULNERABILITIES TO PATCH IMMEDIATELY")
        print("="*80 + "\\n")

        for idx, threat in high_risk.iterrows():
            severity = "🔴 CRITICAL" if threat['Risk_Score'] >= 9 else "🟡 HIGH"
            print(f"{severity} | Score: {threat['Risk_Score']:.1f} | {threat['Category']}")
            print(f"   Asset: {threat['Asset']}")
            print(f"   Surface: {threat['Surface']}")
            print(f"   Vector: {threat['Attack_Vector']}")
            print()

        if len(high_risk) == 0:
            BrutalistSecurityLogger.success("NO_CRITICAL_VULNERABILITIES_IDENTIFIED")
        else:
            BrutalistSecurityLogger.critical(f"IDENTIFIED_{len(high_risk)}_CRITICAL_VULNERABILITIES")

        return high_risk

# Initialize Threat Modeler
assets = ${JSON.stringify(request.high_value_assets)}
surfaces = ${JSON.stringify(request.attack_surfaces)}

modeler = ThreatModeler(assets, surfaces)
threats_df = modeler.apply_stride()
heatmap = modeler.generate_risk_heatmap()
kill_list = modeler.generate_kill_list(threshold=7.0)

# Display top threats
display(threats_df.nlargest(10, 'Risk_Score'))`,
  });

  // Block 2: The Panic Button (Incident Response)
  cells.push({
    type: 'markdown',
    content: `## BLOCK 2: THE PANIC BUTTON (INCIDENT RESPONSE)

**PROTOCOLS:** Account Takeover, Ransomware, Data Exfiltration
**COMPONENTS:** Interactive Checklists (ipywidgets)
**OUTPUT:** SEV-1 Crisis Protocols`,
  });

  cells.push({
    type: 'code',
    content: `# @title 2.0 // INCIDENT_RESPONSE_PROTOCOLS
!pip install -q ipywidgets

import ipywidgets as widgets
from IPython.display import display, clear_output
from datetime import datetime

class IncidentResponseCenter:
    def __init__(self):
        self.protocols = {
            'account_takeover': self.ato_protocol,
            'ransomware': self.ransomware_protocol,
            'data_exfiltration': self.exfiltration_protocol,
            'ddos': self.ddos_protocol
        }

    def ato_protocol(self, user_id):
        """Account Takeover Protocol - SEV-1"""
        BrutalistSecurityLogger.critical(f"ATO_DETECTED :: USER={user_id} :: INITIATING_CONTAINMENT")

        steps = [
            f"🔴 KILL_SESSIONS :: Revoke all OAuth/JWT tokens for {user_id}",
            f"🔴 FLUSH_CREDENTIALS :: Force immediate password reset",
            f"🔴 AUDIT_FORWARDING :: Check email forwarding rules for data exfiltration",
            f"🔴 DEVICE_VERIFY :: Confirm device fingerprint integrity",
            f"🟡 SESSION_HISTORY :: Review login locations and IP addresses (last 30 days)",
            f"🟡 API_AUDIT :: Check for unauthorized API key creation",
            f"🟡 MFA_ENFORCE :: Require hardware security key re-enrollment",
            f"🟢 NOTIFICATION :: Alert user via secondary verified channel",
        ]

        print("\\n" + "="*80)
        print(f"⚠️  ACCOUNT TAKEOVER PROTOCOL - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80 + "\\n")

        checkboxes = []
        for step in steps:
            checkbox = widgets.Checkbox(
                value=False,
                description=step,
                disabled=False,
                indent=False,
                layout=widgets.Layout(width='800px')
            )
            checkboxes.append(checkbox)
            display(checkbox)

        def verify_completion(b):
            if all(cb.value for cb in checkboxes):
                BrutalistSecurityLogger.success("ATO_CONTAINMENT_COMPLETE :: ALL_STEPS_VERIFIED")
                display(HTML('<div class="secure_output">✅ Account secured. Incident log created.</div>'))
            else:
                BrutalistSecurityLogger.warning("INCOMPLETE_PROTOCOL :: VERIFY_ALL_STEPS")

        verify_btn = widgets.Button(description="VERIFY COMPLETION", button_style='danger')
        verify_btn.on_click(verify_completion)
        display(verify_btn)

    def ransomware_protocol(self):
        """Ransomware Response Protocol - SEV-0"""
        BrutalistSecurityLogger.critical("RANSOMWARE_DETECTED :: INITIATING_KILL_SWITCH")

        steps = [
            "🔴 AIR_GAP :: Immediately disconnect infected systems from network",
            "🔴 BACKUP_VERIFY :: Confirm offline backups are uncompromised",
            "🔴 LATERAL_MOVEMENT :: Identify and isolate all affected hosts",
            "🔴 DISABLE_ADMIN :: Revoke all admin credentials network-wide",
            "🟡 FORENSICS :: Preserve memory dumps and disk images",
            "🟡 IOC_EXTRACTION :: Identify indicators of compromise (file hashes, C2 servers)",
            "🟡 THREAT_INTEL :: Check threat feeds for known ransomware variant",
            "🟢 LAW_ENFORCEMENT :: Contact FBI/local cybercrime unit",
            "🟢 LEGAL_COUNSEL :: Engage breach notification attorneys",
        ]

        print("\\n" + "="*80)
        print("🚨 RANSOMWARE KILL SWITCH - DO NOT NEGOTIATE")
        print("="*80 + "\\n")

        for step in steps:
            checkbox = widgets.Checkbox(description=step, indent=False, layout=widgets.Layout(width='800px'))
            display(checkbox)

    def exfiltration_protocol(self):
        """Data Exfiltration Protocol - SEV-1"""
        BrutalistSecurityLogger.critical("DATA_EXFILTRATION_DETECTED :: ACTIVATING_EGRESS_CONTROLS")

        steps = [
            "🔴 EGRESS_BLOCK :: Enable strict egress filtering on firewall",
            "🔴 DNS_TUNNEL_DETECT :: Monitor for DNS tunneling to external resolvers",
            "🔴 CLOUD_AUDIT :: Review S3/Azure Blob permissions for public exposure",
            "🟡 DLP_ACTIVATE :: Enable Data Loss Prevention on all endpoints",
            "🟡 EXFIL_ANALYSIS :: Identify which data was compromised (PII, IP, credentials)",
            "🟢 BREACH_NOTIFICATION :: Prepare regulatory notifications (GDPR 72hr window)",
        ]

        for step in steps:
            checkbox = widgets.Checkbox(description=step, indent=False, layout=widgets.Layout(width='800px'))
            display(checkbox)

    def ddos_protocol(self):
        """DDoS Mitigation Protocol - SEV-2"""
        BrutalistSecurityLogger.warning("DDOS_DETECTED :: ACTIVATING_RATE_LIMITING")

        steps = [
            "🟡 CLOUDFLARE_ENABLE :: Activate DDoS protection (if available)",
            "🟡 RATE_LIMIT :: Implement aggressive rate limiting on API endpoints",
            "🟡 GEO_BLOCK :: Block traffic from non-essential geographic regions",
            "🟢 AUTOSCALE :: Enable auto-scaling to absorb traffic spike",
        ]

        for step in steps:
            checkbox = widgets.Checkbox(description=step, indent=False, layout=widgets.Layout(width='800px'))
            display(checkbox)

# Initialize Incident Response Center
irc = IncidentResponseCenter()

# Dropdown for incident type
incident_selector = widgets.Dropdown(
    options=[
        ('Account Takeover', 'account_takeover'),
        ('Ransomware', 'ransomware'),
        ('Data Exfiltration', 'data_exfiltration'),
        ('DDoS Attack', 'ddos')
    ],
    description='Incident Type:',
    style={'description_width': 'initial'}
)

user_id_input = widgets.Text(
    value='',
    placeholder='Enter user ID (for ATO)',
    description='User ID:',
    disabled=False
)

def trigger_protocol(b):
    clear_output(wait=True)
    display(incident_selector)
    display(user_id_input)
    display(trigger_btn)

    incident_type = incident_selector.value
    if incident_type == 'account_takeover':
        user_id = user_id_input.value or 'UNKNOWN_USER'
        irc.ato_protocol(user_id)
    else:
        irc.protocols[incident_type]()

trigger_btn = widgets.Button(description="🚨 ACTIVATE PROTOCOL", button_style='danger')
trigger_btn.on_click(trigger_protocol)

display(incident_selector)
display(user_id_input)
display(trigger_btn)`,
  });

  // Block 3: The Vault (Cryptography & Secrets)
  cells.push({
    type: 'markdown',
    content: `## BLOCK 3: THE VAULT (CRYPTOGRAPHY & SECRETS)

**COMPONENTS:** cryptography, secrets, hashlib
**ACTIONS:** Key Rotation, PII Hashing, Secret Generation
**OUTPUT:** Sanitization Code for Production`,
  });

  cells.push({
    type: 'code',
    content: `# @title 3.0 // CRYPTOGRAPHIC_HYGIENE
!pip install -q cryptography

import secrets
import hashlib
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import pandas as pd

class CryptoVault:
    def __init__(self):
        self.master_key = None
        self.salt = secrets.token_bytes(32)

    def generate_api_key(self, length=32):
        """Generate cryptographically secure API key"""
        BrutalistSecurityLogger.info("GENERATING_API_KEY...")

        # Use secrets module (CSPRNG)
        api_key = secrets.token_urlsafe(length)

        BrutalistSecurityLogger.success(f"API_KEY_GENERATED :: LENGTH={len(api_key)}_BYTES")
        print(f"\\n🔑 API Key: {api_key}\\n")
        print("⚠️  Store in environment variable, NEVER commit to git")

        return api_key

    def rotate_keys(self, current_keys):
        """Simulate key rotation protocol"""
        BrutalistSecurityLogger.warning("INITIATING_KEY_ROTATION...")

        rotation_log = []
        for key_name in current_keys:
            old_key_hash = hashlib.sha256(key_name.encode()).hexdigest()[:8]
            new_key = self.generate_api_key()

            rotation_log.append({
                'Key_Name': key_name,
                'Old_Hash': old_key_hash,
                'Rotation_Status': 'ROTATED',
                'Timestamp': datetime.now().isoformat()
            })

            print(f"✅ Rotated: {key_name} (old hash: {old_key_hash}...)")

        BrutalistSecurityLogger.success(f"KEY_ROTATION_COMPLETE :: {len(current_keys)}_KEYS_ROTATED")
        return pd.DataFrame(rotation_log)

    def hash_pii_column(self, data, column_name):
        """Hash PII column with SHA-256 + salt"""
        BrutalistSecurityLogger.info(f"SANITIZING_PII :: COLUMN={column_name}")

        def hash_value(value):
            if pd.isna(value):
                return None
            # SHA-256 with salt
            salted = f"{value}{self.salt.hex()}".encode()
            return hashlib.sha256(salted).hexdigest()

        data[f'{column_name}_hashed'] = data[column_name].apply(hash_value)
        data.drop(columns=[column_name], inplace=True)

        BrutalistSecurityLogger.success(f"PII_SANITIZED :: {column_name}_IRREVERSIBLY_HASHED")
        return data

    def demonstrate_encryption(self):
        """Demonstrate Fernet symmetric encryption"""
        BrutalistSecurityLogger.info("DEMONSTRATING_FERNET_ENCRYPTION...")

        # Generate Fernet key
        key = Fernet.generate_key()
        cipher = Fernet(key)

        # Encrypt sensitive data
        sensitive_data = b"CLASSIFIED: Model weights for GPT-5"
        encrypted = cipher.encrypt(sensitive_data)
        decrypted = cipher.decrypt(encrypted)

        print(f"\\n🔐 Original:  {sensitive_data.decode()}")
        print(f"🔒 Encrypted: {encrypted[:50]}... ({len(encrypted)} bytes)")
        print(f"🔓 Decrypted: {decrypted.decode()}\\n")

        BrutalistSecurityLogger.success("ENCRYPTION_VERIFIED :: FERNET_AES128")

# Initialize Crypto Vault
vault = CryptoVault()

# Generate sample API keys
print("="*80)
print("KEY GENERATION DEMO")
print("="*80)
vault.generate_api_key()

# Simulate key rotation
print("\\n" + "="*80)
print("KEY ROTATION PROTOCOL")
print("="*80)
keys_to_rotate = ['OPENAI_API_KEY', 'DATABASE_PASSWORD', 'AWS_SECRET_KEY']
rotation_log = vault.rotate_keys(keys_to_rotate)
display(rotation_log)

# Demonstrate PII hashing
print("\\n" + "="*80)
print("PII SANITIZATION")
print("="*80)
sample_data = pd.DataFrame({
    'user_id': [1, 2, 3],
    'email': ['alice@example.com', 'bob@example.com', 'charlie@example.com'],
    'credit_card': ['4111-1111-1111-1111', '5500-0000-0000-0004', '3400-0000-0000-009']
})

print("Before sanitization:")
display(sample_data)

sanitized = vault.hash_pii_column(sample_data.copy(), 'email')
sanitized = vault.hash_pii_column(sanitized, 'credit_card')

print("\\nAfter sanitization:")
display(sanitized)

# Encryption demo
print("\\n" + "="*80)
print("ENCRYPTION DEMONSTRATION")
print("="*80)
vault.demonstrate_encryption()`,
  });

  // Block 4: Social Engineering Defense (The Human Firewall)
  cells.push({
    type: 'markdown',
    content: `## BLOCK 4: SOCIAL ENGINEERING DEFENSE (THE HUMAN FIREWALL)

**OBJECTIVE:** Red Team simulation and identity verification
**COMPONENTS:** Phishing templates, verification protocols
**OUTPUT:** Security awareness checklist`,
  });

  cells.push({
    type: 'code',
    content: `# @title 4.0 // SOCIAL_ENGINEERING_DEFENSE
import random

class SocialEngineeringDefense:
    def __init__(self):
        self.phishing_templates = self.generate_phishing_templates()
        self.verification_protocol = self.create_verification_checklist()

    def generate_phishing_templates(self):
        """Generate red team phishing scenarios for employee training"""
        BrutalistSecurityLogger.warning("GENERATING_RED_TEAM_PHISHING_TEMPLATES...")

        templates = [
            {
                'Scenario': 'CEO Fraud (Whaling)',
                'Sender_Spoofing': 'CEO@company.com (typosquatting: CEO@cornpany.com)',
                'Urgency_Tactic': 'Urgent wire transfer needed before market close',
                'Verification_Bypass': 'Requests to bypass normal approval process',
                'Detection_Markers': [
                    'Unusual time of request (late night/weekend)',
                    'Pressure to act without verification',
                    'Request sent via personal email',
                    'Grammar/spelling errors unusual for executive'
                ]
            },
            {
                'Scenario': 'IT Department Credential Harvest',
                'Sender_Spoofing': 'IT-Support@company.com (legitimate domain)',
                'Urgency_Tactic': 'Your account will be suspended in 24 hours',
                'Verification_Bypass': 'Fake password reset link to phishing site',
                'Detection_Markers': [
                    'Unsolicited password reset request',
                    'Link domain does not match company',
                    'Threatens account suspension',
                    'No ticket number from IT system'
                ]
            },
            {
                'Scenario': 'Supply Chain Compromise',
                'Sender_Spoofing': 'Vendor@trusted-supplier.com (compromised vendor account)',
                'Urgency_Tactic': 'Updated payment instructions for invoice',
                'Verification_Bypass': 'New bank account for wire transfer',
                'Detection_Markers': [
                    'Sudden change in payment method',
                    'No phone verification requested',
                    'Email sent outside business hours',
                    'Attachment with macro-enabled document'
                ]
            },
            {
                'Scenario': 'Remote Worker VPN Compromise',
                'Sender_Spoofing': 'VPN-Admin@company.com',
                'Urgency_Tactic': 'VPN certificate expired, re-authenticate immediately',
                'Verification_Bypass': 'Fake VPN portal collecting credentials',
                'Detection_Markers': [
                    'URL does not match corporate VPN domain',
                    'Certificate warnings in browser',
                    'Requests for MFA bypass codes',
                    'No prior notification from IT'
                ]
            }
        ]

        return templates

    def display_phishing_scenarios(self):
        """Display phishing templates for red team exercises"""
        print("\\n" + "="*80)
        print("🎣 RED TEAM PHISHING SCENARIOS - FOR AUTHORIZED TESTING ONLY")
        print("="*80 + "\\n")

        for idx, template in enumerate(self.phishing_templates, 1):
            print(f"\\n📧 SCENARIO {idx}: {template['Scenario']}")
            print(f"   Sender: {template['Sender_Spoofing']}")
            print(f"   Tactic: {template['Urgency_Tactic']}")
            print(f"   Bypass: {template['Verification_Bypass']}")
            print(f"\\n   🔍 DETECTION MARKERS:")
            for marker in template['Detection_Markers']:
                print(f"      - {marker}")

        BrutalistSecurityLogger.warning("USE_FOR_SECURITY_AWARENESS_TRAINING_ONLY")

    def create_verification_checklist(self):
        """Generate identity verification protocol for remote/international comms"""
        checklist = [
            {
                'Step': '1. SECONDARY_CHANNEL_VERIFICATION',
                'Description': 'Verify identity via independent channel (phone, Slack DM, Signal)',
                'Critical': True
            },
            {
                'Step': '2. CHALLENGE_RESPONSE',
                'Description': 'Use pre-shared challenge phrases or security questions',
                'Critical': True
            },
            {
                'Step': '3. TIME_ZONE_VERIFICATION',
                'Description': 'Verify request aligns with sender\\'s known working hours',
                'Critical': False
            },
            {
                'Step': '4. DOMAIN_AUTHENTICITY',
                'Description': 'Inspect email headers for domain spoofing (SPF, DKIM, DMARC)',
                'Critical': True
            },
            {
                'Step': '5. BEHAVIORAL_BASELINE',
                'Description': 'Does request match sender\\'s normal communication patterns?',
                'Critical': False
            },
            {
                'Step': '6. URGENCY_SKEPTICISM',
                'Description': 'Artificial urgency is a red flag - pause and verify',
                'Critical': True
            },
            {
                'Step': '7. APPROVAL_WORKFLOW',
                'Description': 'Never bypass established approval processes, even for executives',
                'Critical': True
            }
        ]

        return checklist

    def display_verification_protocol(self):
        """Display verification checklist"""
        print("\\n" + "="*80)
        print("🛡️  IDENTITY VERIFICATION PROTOCOL - REMOTE/INTERNATIONAL COMMUNICATIONS")
        print("="*80 + "\\n")

        for item in self.verification_protocol:
            criticality = "🔴 CRITICAL" if item['Critical'] else "🟡 RECOMMENDED"
            print(f"{criticality} | {item['Step']}")
            print(f"           {item['Description']}\\n")

        BrutalistSecurityLogger.success("VERIFICATION_PROTOCOL_LOADED")

# Initialize Defense System
defense = SocialEngineeringDefense()

# Display phishing scenarios
defense.display_phishing_scenarios()

# Display verification protocol
defense.display_verification_protocol()

# Interactive phishing awareness quiz
print("\\n" + "="*80)
print("🎯 PHISHING AWARENESS QUIZ")
print("="*80 + "\\n")

quiz_scenario = random.choice(defense.phishing_templates)
print(f"Scenario: You receive an email from '{quiz_scenario['Sender_Spoofing']}'")
print(f"Subject: {quiz_scenario['Urgency_Tactic']}")
print(f"\\nWhat should you do?\\n")

options = [
    "A) Click the link immediately to avoid account suspension",
    "B) Verify via secondary channel (phone call to known number)",
    "C) Reply to the email asking if it's legitimate",
    "D) Forward to coworkers to see if they received it"
]

for option in options:
    print(option)

print("\\n✅ Correct Answer: B - Always verify via independent secondary channel")
print("🔍 Detection Markers:")
for marker in quiz_scenario['Detection_Markers']:
    print(f"   - {marker}")`,
  });

  // Summary
  cells.push({
    type: 'markdown',
    content: `## SECURITY OPERATIONS CENTER SUMMARY

**STATUS:** ${request.operational_mode === 'active_crisis' ? '🚨 ACTIVE INCIDENT' : '✅ OPERATIONAL'}
**THREAT MODELING:** STRIDE methodology applied to ${request.high_value_assets.length} assets
**INCIDENT RESPONSE:** Protocols loaded for ATO, Ransomware, Exfiltration, DDoS
**CRYPTOGRAPHY:** Key rotation and PII sanitization protocols active
**SOCIAL ENGINEERING:** Red team templates and verification protocols ready

**DELIVERABLES:**
1. STRIDE threat matrix with risk heatmap
2. Kill list of critical vulnerabilities (>7.0 risk score)
3. Interactive incident response playbooks
4. Cryptographic hygiene and key rotation code
5. Phishing red team scenarios for security training
6. Identity verification protocol for remote teams

**NEXT STEPS:**
- Review and patch critical vulnerabilities from kill list
- Conduct tabletop exercises with incident response protocols
- Implement key rotation schedule (recommended: quarterly)
- Deploy phishing simulations for employee training
- Enforce MFA and hardware security keys for all privileged accounts

**⚠️ REMEMBER:**
- Zero Trust: Never trust, always verify
- Assume Breach: Plan for containment, not just prevention
- The Human Firewall: Security awareness is everyone's responsibility

---
**CISO v1.0** | Zero Trust Architecture | Security by Design
`,
  });

  return {
    title: 'The CISO - Security Operations Center',
    cells,
    brutalist_style: true,
    zero_trust_mode: true,
  };
}
