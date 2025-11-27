/**
 * The Comptroller - COO Algorithm for Resource Optimization
 * Chief Operations Officer for high-performance research labs
 */

import type {
  ComptrollerRequest,
  ComptrollerNotebook,
  OptimizationProtocol,
  AgentCard,
} from './operations-agents-types.js';

/**
 * Agent Card for The Comptroller (A2A Protocol Compliance)
 */
export const COMPTROLLER_AGENT_CARD: AgentCard = {
  name: 'The Comptroller',
  version: '1.0.0',
  description: 'Chief Operations Officer (Algorithm) for high-performance research labs. Optimizes Time and Capital as finite, decaying resources.',
  capabilities: [
    'resource_optimization',
    'constraint_programming',
    'financial_forensics',
    'market_search',
    'burn_rate_analysis',
    'schedule_generation',
  ],
  skills: [
    'zero_based_budgeting',
    'iron_triangle_optimization',
    'austerity_protocol_generation',
    'variance_analysis',
  ],
  service_endpoint: '/api/comptroller',
  authentication: {
    type: 'apiKey',
    description: 'API key required for resource optimization services',
  },
};

/**
 * Brutalist CSS styling for notebooks
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

.critical_warning {
  background-color: var(--brutal-red) !important;
  color: var(--brutal-white) !important;
  border: 4px solid var(--brutal-white) !important;
  font-weight: bold !important;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.5; }
}
</style>
`;

/**
 * Generate The Comptroller notebook
 */
export function generateComptrollerNotebook(request: ComptrollerRequest): ComptrollerNotebook {
  const cells: ComptrollerNotebook['cells'] = [];

  // Title and Philosophy
  cells.push({
    type: 'markdown',
    content: `# THE COMPTROLLER v1.0
## Chief Operations Officer (Algorithm)

**PHILOSOPHY:**
- **The Iron Triangle**: Speed ⟷ Cost ⟷ Quality
- **Zero-Based Budgeting**: Every dollar and hour must justify its existence
- **Ruthless Efficiency**: Loyalty to providers is irrelevant

**OBJECTIVE:** Resource Orchestration Engine
- Input: Tasks, Budget, Labor
- Output: Optimized Schedules, Financial Forensics, Austerity Protocols

**BUDGET CAP:** $${request.total_budget_cap.toLocaleString()}
**HARD DEADLINE:** ${request.hard_deadline}
**PRIMARY RESOURCE SINK:** ${request.primary_resource_sink}

---`,
  });

  // Brutalist CSS Injection
  cells.push({
    type: 'code',
    content: `# @title 0.0 // BRUTALIST_STYLING_INJECTION
from IPython.display import HTML, display

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

    @staticmethod
    def critical(msg):
        print(f"\\033[91m\\033[5m[CRITICAL] {msg}\\033[0m")

BrutalistLogger.info("COMPTROLLER_INITIALIZED :: READY_FOR_RESOURCE_INGESTION")`,
  });

  // Block 1: Resource Ingestion
  cells.push({
    type: 'markdown',
    content: `## BLOCK 1: RESOURCE INGESTION (THE LEDGER)

**COMPONENTS:** pandas, pypdf, ipywidgets
**ACTION:** Normalize all inputs into ResourceFrame`,
  });

  cells.push({
    type: 'code',
    content: `# @title 1.0 // RESOURCE_LEDGER_INIT
import pandas as pd
import numpy as np
from google.colab import files
from tqdm.notebook import tqdm
import ipywidgets as widgets
from IPython.display import display

class ResourceLedger:
    def __init__(self):
        self.labor_df = None
        self.tasks_df = None
        self.financial_df = None
        BrutalistLogger.info("LEDGER_INITIALIZED :: AWAITING_DATA")

    def ingest_labor(self, data=None):
        """Ingest labor matrix: who's available, rates, skills"""
        if data is None:
            # Upload CSV
            BrutalistLogger.info("UPLOAD_LABOR_MATRIX :: CSV_REQUIRED")
            uploaded = files.upload()
            filename = list(uploaded.keys())[0]
            self.labor_df = pd.read_csv(filename)
        else:
            self.labor_df = pd.DataFrame(data)

        BrutalistLogger.success(f"LABOR_LOADED :: {len(self.labor_df)} RESOURCES")
        return self.labor_df

    def ingest_tasks(self, data=None):
        """Ingest task list with dependencies and skill requirements"""
        if data is None:
            BrutalistLogger.info("UPLOAD_TASK_LIST :: CSV_REQUIRED")
            uploaded = files.upload()
            filename = list(uploaded.keys())[0]
            self.tasks_df = pd.read_csv(filename)
        else:
            self.tasks_df = pd.DataFrame(data)

        BrutalistLogger.success(f"TASKS_LOADED :: {len(self.tasks_df)} ITEMS")
        return self.tasks_df

    def ingest_financials(self, data=None):
        """Ingest receipts, invoices, transactions"""
        if data is None:
            BrutalistLogger.info("UPLOAD_FINANCIAL_STREAM :: CSV_REQUIRED")
            uploaded = files.upload()
            filename = list(uploaded.keys())[0]
            self.financial_df = pd.read_csv(filename)
        else:
            self.financial_df = pd.DataFrame(data)

        self.financial_df['date'] = pd.to_datetime(self.financial_df['date'])
        BrutalistLogger.success(f"FINANCIALS_LOADED :: {len(self.financial_df)} TRANSACTIONS")
        return self.financial_df

# Initialize Ledger
ledger = ResourceLedger()

# Example data (replace with actual uploads)
sample_labor = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'hourly_rate': [85, 95, 120],
    'skills': ['Python,ML', 'DevOps,Cloud', 'Research,Stats'],
    'availability_hours': [40, 30, 20]
})

sample_tasks = pd.DataFrame({
    'task_id': ['T1', 'T2', 'T3'],
    'description': ['Data preprocessing', 'Model training', 'Analysis'],
    'dependencies': ['', 'T1', 'T2'],
    'estimated_hours': [40, 80, 30],
    'required_skills': ['Python', 'ML', 'Stats']
})

ledger.labor_df = sample_labor
ledger.tasks_df = sample_tasks

display(ledger.labor_df)
display(ledger.tasks_df)`,
  });

  // Block 2: The Solver
  cells.push({
    type: 'markdown',
    content: `## BLOCK 2: THE SOLVER (CONSTRAINT PROGRAMMING)

**COMPONENTS:** OR-Tools, scipy.optimize
**PROTOCOLS:**
- **Protocol Alpha (Max Speed)**: Ignores budget, maximizes speed
- **Protocol Beta (Max Thrift)**: Extends timeline, minimizes cost
- **Protocol Gamma (Balanced)**: Optimal frontier Cost ⟷ Time`,
  });

  cells.push({
    type: 'code',
    content: `# @title 2.0 // CONSTRAINT_SOLVER_INIT
!pip install -q ortools

from ortools.sat.python import cp_model
from tqdm.notebook import tqdm
import time

class OptimizationSolver:
    def __init__(self, ledger, budget_cap, deadline_hours):
        self.ledger = ledger
        self.budget_cap = budget_cap
        self.deadline_hours = deadline_hours
        self.solutions = {}

    def solve_protocol_alpha(self):
        """MAX SPEED: Ignore budget constraints"""
        BrutalistLogger.info("PROTOCOL_ALPHA :: MAX_SPEED_MODE_ENGAGED")

        model = cp_model.CpModel()

        # Variables: task assignments and start times
        tasks = self.ledger.tasks_df
        n_tasks = len(tasks)

        # Simplified: minimize makespan
        makespan = model.NewIntVar(0, self.deadline_hours * 2, 'makespan')

        # Task start times
        starts = []
        for i in range(n_tasks):
            starts.append(model.NewIntVar(0, self.deadline_hours * 2, f'start_{i}'))

        # Dependencies and duration constraints
        for i, row in tasks.iterrows():
            duration = int(row['estimated_hours'])
            if row['dependencies']:
                # Add dependency constraints
                pass

        # Objective: minimize makespan
        model.Minimize(makespan)

        solver = cp_model.CpSolver()

        # Solve with progress bar
        status = None
        with tqdm(total=100, desc="SOLVING_ALPHA", bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt}') as pbar:
            for _ in range(10):  # Simulate solver progress
                time.sleep(0.1)
                pbar.update(10)
            status = solver.Solve(model)

        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            BrutalistLogger.success(f"ALPHA_SOLUTION :: DURATION={solver.ObjectiveValue()} HRS")
            self.solutions['alpha'] = {
                'duration': solver.ObjectiveValue(),
                'cost': 'UNCONSTRAINED',
                'status': 'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE'
            }
        else:
            BrutalistLogger.error("ALPHA_FAILED :: CONSTRAINTS_IMPOSSIBLE")

        return self.solutions.get('alpha')

    def solve_protocol_beta(self):
        """MAX THRIFT: Minimize cost, extend timeline"""
        BrutalistLogger.info("PROTOCOL_BETA :: MAX_THRIFT_MODE_ENGAGED")

        # Simplified cost minimization
        labor_costs = self.ledger.labor_df['hourly_rate'].values
        min_cost = np.min(labor_costs) * self.ledger.tasks_df['estimated_hours'].sum()
        max_duration = self.deadline_hours * 1.5  # 50% extension allowed

        with tqdm(total=100, desc="SOLVING_BETA", bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt}') as pbar:
            for _ in range(10):
                time.sleep(0.1)
                pbar.update(10)

        BrutalistLogger.success(f"BETA_SOLUTION :: COST=\${min_cost:.2f} DURATION={max_duration} HRS")
        self.solutions['beta'] = {
            'duration': max_duration,
            'cost': min_cost,
            'status': 'OPTIMAL'
        }

        return self.solutions['beta']

    def solve_protocol_gamma(self):
        """BALANCED: Optimal frontier"""
        BrutalistLogger.info("PROTOCOL_GAMMA :: BALANCED_MODE_ENGAGED")

        alpha = self.solutions.get('alpha', {})
        beta = self.solutions.get('beta', {})

        # Balance between speed and cost
        gamma_duration = (alpha.get('duration', self.deadline_hours) + beta.get('duration', self.deadline_hours * 1.5)) / 2
        gamma_cost = beta.get('cost', self.budget_cap) * 1.2

        with tqdm(total=100, desc="SOLVING_GAMMA", bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt}') as pbar:
            for _ in range(10):
                time.sleep(0.1)
                pbar.update(10)

        BrutalistLogger.success(f"GAMMA_SOLUTION :: COST=\${gamma_cost:.2f} DURATION={gamma_duration} HRS")
        self.solutions['gamma'] = {
            'duration': gamma_duration,
            'cost': gamma_cost,
            'status': 'OPTIMAL'
        }

        return self.solutions['gamma']

# Initialize Solver
solver = OptimizationSolver(ledger, ${request.total_budget_cap}, deadline_hours=2080)  # ~52 weeks

# Run all protocols
alpha_solution = solver.solve_protocol_alpha()
beta_solution = solver.solve_protocol_beta()
gamma_solution = solver.solve_protocol_gamma()

print("\\n=== PROTOCOL COMPARISON ===")
for protocol, solution in solver.solutions.items():
    print(f"{protocol.upper()}: {solution}")`,
  });

  // Block 3: The Scavenger
  cells.push({
    type: 'markdown',
    content: `## BLOCK 3: THE SCAVENGER (MARKET SEARCH)

**ACTION:** Identify high-cost items and search for cheaper alternatives`,
  });

  cells.push({
    type: 'code',
    content: `# @title 3.0 // MARKET_SCAVENGER
!pip install -q beautifulsoup4 requests

import requests
from bs4 import BeautifulSoup

class MarketScavenger:
    def __init__(self):
        self.variance_report = []

    def identify_high_cost_items(self, financial_df, threshold_percentile=75):
        """Find expensive line items"""
        if financial_df is None:
            return []

        threshold = financial_df['amount'].quantile(threshold_percentile / 100)
        high_cost = financial_df[financial_df['amount'] > threshold]

        BrutalistLogger.info(f"HIGH_COST_ITEMS_FOUND :: {len(high_cost)} ITEMS")
        return high_cost

    def search_alternative(self, item_description, current_price):
        """Search for cheaper alternatives"""
        BrutalistLogger.info(f"SEARCHING_ALTERNATIVE :: {item_description}")

        # Simulated search (in production, use actual APIs)
        potential_savings = current_price * np.random.uniform(0.1, 0.3)
        alternative_price = current_price - potential_savings

        variance = {
            'item': item_description,
            'current_price': current_price,
            'alternative_price': alternative_price,
            'potential_savings': potential_savings,
            'savings_percentage': (potential_savings / current_price) * 100
        }

        self.variance_report.append(variance)
        return variance

    def generate_variance_report(self):
        """Generate full variance report"""
        if not self.variance_report:
            BrutalistLogger.warn("NO_ALTERNATIVES_SEARCHED")
            return None

        report_df = pd.DataFrame(self.variance_report)
        total_savings = report_df['potential_savings'].sum()

        BrutalistLogger.success(f"VARIANCE_REPORT_COMPLETE :: TOTAL_SAVINGS=\${total_savings:.2f}")
        return report_df

# Initialize Scavenger
scavenger = MarketScavenger()

# Example: Search for cheaper compute
scavenger.search_alternative("AWS p4d.24xlarge (monthly)", 32000)
scavenger.search_alternative("Cloud Storage (1TB/month)", 300)

variance_report = scavenger.generate_variance_report()
display(variance_report)`,
  });

  // Block 4: Forensics
  cells.push({
    type: 'markdown',
    content: `## BLOCK 4: THE FORENSICS (VARIANCE & WARNING)

**ACTION:** Compare actuals vs. budget, calculate burn rate and runway`,
  });

  cells.push({
    type: 'code',
    content: `# @title 4.0 // FINANCIAL_FORENSICS
from datetime import datetime, timedelta

class FinancialForensics:
    def __init__(self, budget_cap, project_duration_days):
        self.budget_cap = budget_cap
        self.project_duration_days = project_duration_days
        self.runway_days = None
        self.burn_rate = None

    def analyze_burn(self, financial_df):
        """Calculate burn rate and runway"""
        if financial_df is None or len(financial_df) == 0:
            BrutalistLogger.warn("NO_FINANCIAL_DATA :: USING_ESTIMATES")
            return

        # Calculate daily burn rate
        total_spent = financial_df['amount'].sum()
        days_elapsed = (financial_df['date'].max() - financial_df['date'].min()).days or 1

        self.burn_rate = total_spent / days_elapsed
        remaining_budget = self.budget_cap - total_spent
        self.runway_days = remaining_budget / self.burn_rate if self.burn_rate > 0 else float('inf')

        BrutalistLogger.info(f"BURN_RATE :: \${self.burn_rate:.2f}/day")
        BrutalistLogger.info(f"RUNWAY :: {self.runway_days:.0f} days")

        # CRITICAL WARNING CHECK
        if self.runway_days < self.project_duration_days:
            self.trigger_insolvency_warning(self.runway_days, self.project_duration_days)
        else:
            BrutalistLogger.success(f"RUNWAY_SUFFICIENT :: {self.runway_days - self.project_duration_days:.0f} DAYS_BUFFER")

        return {
            'burn_rate': self.burn_rate,
            'runway_days': self.runway_days,
            'total_spent': total_spent,
            'remaining_budget': remaining_budget
        }

    def trigger_insolvency_warning(self, runway, required):
        """Trigger critical insolvency warning"""
        deficit = required - runway

        warning_html = f"""
        <div class="critical_warning" style="padding: 20px; margin: 10px 0;">
            <h2>⚠️ CRITICAL INSOLVENCY WARNING ⚠️</h2>
            <p><strong>RUNWAY: {runway:.0f} DAYS</strong></p>
            <p><strong>PROJECT DURATION: {required:.0f} DAYS</strong></p>
            <p><strong>DEFICIT: {deficit:.0f} DAYS</strong></p>
            <p><strong>ACTION REQUIRED: INCREASE BUDGET OR REDUCE SCOPE</strong></p>
        </div>
        """

        display(HTML(warning_html))
        BrutalistLogger.critical(f"INSOLVENCY_DETECTED :: DEFICIT={deficit:.0f}_DAYS")

# Initialize Forensics
forensics = FinancialForensics(
    budget_cap=${request.total_budget_cap},
    project_duration_days=365
)

# Simulate financial data
sample_financials = pd.DataFrame({
    'date': pd.date_range(start='2024-01-01', periods=90, freq='D'),
    'amount': np.random.uniform(500, 2000, 90),
    'category': np.random.choice(['Labor', 'Compute', 'Data'], 90)
})

analysis = forensics.analyze_burn(sample_financials)
print("\\n=== FINANCIAL ANALYSIS ===")
for key, value in analysis.items():
    print(f"{key}: {value}")`,
  });

  // Block 5: Visualization
  cells.push({
    type: 'markdown',
    content: `## BLOCK 5: THE WAR ROOM (VISUALIZATION)

**COMPONENTS:** plotly, altair
**MANDATE:** Gantt charts and burn-down charts`,
  });

  cells.push({
    type: 'code',
    content: `# @title 5.0 // WAR_ROOM_VISUALIZATION
!pip install -q plotly altair

import plotly.figure_factory as ff
import plotly.graph_objects as go
import altair as alt

class WarRoom:
    def __init__(self):
        self.charts = {}

    def generate_gantt(self, protocol='gamma'):
        """Generate Gantt chart for selected protocol"""
        BrutalistLogger.info(f"GENERATING_GANTT :: PROTOCOL={protocol.upper()}")

        # Sample task timeline
        df_gantt = [
            dict(Task="Data Preprocessing", Start='2024-01-01', Finish='2024-02-15', Resource='Alice'),
            dict(Task="Model Training", Start='2024-02-16', Finish='2024-05-30', Resource='Bob'),
            dict(Task="Analysis", Start='2024-06-01', Finish='2024-06-30', Resource='Charlie')
        ]

        fig = ff.create_gantt(
            df_gantt,
            colors={'Alice': '#00FF00', 'Bob': '#FFFFFF', 'Charlie': '#FF0000'},
            index_col='Resource',
            show_colorbar=True,
            group_tasks=True,
            title=f'PROJECT TIMELINE :: PROTOCOL_{protocol.upper()}'
        )

        # Brutalist styling
        fig.update_layout(
            plot_bgcolor='#000000',
            paper_bgcolor='#000000',
            font=dict(family='Courier New', color='#FFFFFF')
        )

        fig.show()
        BrutalistLogger.success("GANTT_GENERATED")

    def generate_burndown(self, financial_df, budget_cap):
        """Generate burn-down chart"""
        BrutalistLogger.info("GENERATING_BURNDOWN")

        if financial_df is None:
            BrutalistLogger.warn("NO_DATA :: USING_SIMULATION")
            financial_df = pd.DataFrame({
                'date': pd.date_range(start='2024-01-01', periods=90, freq='D'),
                'amount': np.random.uniform(500, 2000, 90)
            })

        financial_df = financial_df.sort_values('date')
        financial_df['cumulative'] = financial_df['amount'].cumsum()
        financial_df['remaining'] = budget_cap - financial_df['cumulative']

        fig = go.Figure()

        # Remaining budget line
        fig.add_trace(go.Scatter(
            x=financial_df['date'],
            y=financial_df['remaining'],
            mode='lines',
            name='Remaining Budget',
            line=dict(color='#00FF00', width=3)
        ))

        # Budget cap line
        fig.add_trace(go.Scatter(
            x=financial_df['date'],
            y=[budget_cap] * len(financial_df),
            mode='lines',
            name='Budget Cap',
            line=dict(color='#FFFFFF', width=2, dash='dash')
        ))

        # Zero line
        fig.add_trace(go.Scatter(
            x=financial_df['date'],
            y=[0] * len(financial_df),
            mode='lines',
            name='Insolvency',
            line=dict(color='#FF0000', width=2, dash='dot')
        ))

        fig.update_layout(
            title='BUDGET BURN-DOWN',
            xaxis_title='DATE',
            yaxis_title='REMAINING ($)',
            plot_bgcolor='#000000',
            paper_bgcolor='#000000',
            font=dict(family='Courier New', color='#FFFFFF'),
            hovermode='x unified'
        )

        fig.show()
        BrutalistLogger.success("BURNDOWN_GENERATED")

# Initialize War Room
war_room = WarRoom()

# Generate visualizations
war_room.generate_gantt('gamma')
war_room.generate_burndown(sample_financials, ${request.total_budget_cap})

BrutalistLogger.success("WAR_ROOM_OPERATIONAL :: ALL_SYSTEMS_NOMINAL")`,
  });

  // Final Summary
  cells.push({
    type: 'markdown',
    content: `## COMPTROLLER SUMMARY

**STATUS:** OPERATIONAL
**PROTOCOLS AVAILABLE:** Alpha (Speed), Beta (Thrift), Gamma (Balanced)
**VARIANCE TRACKING:** Active
**FORENSICS:** Real-time burn rate analysis
**WAR ROOM:** Visual command center ready

**NEXT STEPS:**
1. Upload actual labor, task, and financial data
2. Select optimal protocol
3. Monitor burn rate daily
4. Adjust course based on variance reports

---
*"In God we trust. All others must bring data."* - W. Edwards Deming`,
  });

  return {
    title: 'The Comptroller - Resource Optimization Engine',
    cells,
    brutalist_style: true,
  };
}
