/**
 * creative-director-types.ts
 *
 * The Creative Director v1.2
 * Chief Creative Officer and Brand Architect for ARTIFEX NERD SWARM
 *
 * Philosophy:
 * - Form Follows Data: Beauty must serve readability
 * - Consistency is Sovereignty: Enforce brand standards
 * - Strategy First: Every pixel serves a business objective
 */

export type CreativeModule =
  | 'style_engine'           // Palette & Typography (Module A)
  | 'interface_architect'    // UI/UX & CSS Frameworks (Module B)
  | 'prompt_engineer'        // Image Generation Prompts (Module C)
  | 'voice'                  // Messaging & Persona (Module D)
  | 'brand_auditor'          // Consistency Checking (Module E)
  | 'strategist';            // Business to Creative Translation (Module F)

export type DesignAesthetic =
  | 'functional_brutalist'   // Default: Monospace, High Contrast, Raw Data
  | 'swiss_international'    // Grid-based, Helvetica, Navy/Cream
  | 'neo_memphis'            // Bold geometry, Pop colors
  | 'dark_academic'          // Serif, Muted earth tones
  | 'cyber_industrial'       // Neon accents, Distressed textures
  | 'minimal_scandinavian'   // Whitespace, Sans-serif, Muted pastels
  | 'custom';                // User-defined

export type VoicePersona =
  | 'the_operator'           // Tactical, direct, jargon-heavy
  | 'the_visionary'          // Aspirational, future-focused
  | 'the_institutional'      // Formal, conservative, trust-focused
  | 'the_rebel'              // Provocative, anti-establishment
  | 'the_educator';          // Clear, patient, accessible

export type ImageGenerationModel =
  | 'midjourney'
  | 'dalle3'
  | 'flux'
  | 'stable_diffusion';

export interface ColorPalette {
  name: string;
  description: string;
  primary: string[];          // Main brand colors (hex codes)
  secondary: string[];        // Supporting colors
  accents: string[];          // Highlight/emphasis colors
  neutrals: string[];         // Grays, blacks, whites
  semantic: {                 // Functional colors
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  art_historical_reference?: string; // e.g., "Bauhaus", "De Stijl"
}

export interface TypographySystem {
  name: string;
  description: string;
  fonts: {
    display: {                // Large headings, hero text
      family: string;
      weights: number[];
      fallback: string;
    };
    body: {                   // Paragraph text, UI copy
      family: string;
      weights: number[];
      fallback: string;
    };
    monospace: {              // Code, data, technical
      family: string;
      weights: number[];
      fallback: string;
    };
  };
  scale: {                    // Type scale ratios
    ratio: number;            // e.g., 1.25 (Major Third), 1.618 (Golden)
    base_size: string;        // e.g., "16px"
    sizes: Record<string, string>; // h1, h2, h3, body, small, etc.
  };
}

export interface UIComponent {
  component_type: 'card' | 'modal' | 'dashboard' | 'form' | 'navigation' | 'data_viz' | 'button' | 'input';
  name: string;
  html: string;
  css: string;
  accessibility_notes: string[];
  responsive_breakpoints?: Record<string, string>; // CSS media queries
}

export interface ImagePrompt {
  model: ImageGenerationModel;
  prompt: string;
  negative_prompt?: string;
  technical_params: {
    aspect_ratio?: string;    // e.g., "16:9", "1:1"
    style_weight?: number;    // Midjourney --stylize
    chaos?: number;           // Midjourney --chaos
    quality?: string;         // DALL-E quality setting
    lighting?: string;        // "Golden hour", "Studio", "Dramatic"
    camera_angle?: string;    // "Wide angle", "Close-up", "Bird's eye"
    texture?: string;         // "Smooth", "Rough", "Glossy"
  };
  use_case: string;           // "Hero image for landing page"
}

export interface BrandViolation {
  severity: 'critical' | 'major' | 'minor';
  category: 'color' | 'typography' | 'spacing' | 'voice' | 'imagery';
  violation: string;          // Description of what's wrong
  current_value: string;      // What was found
  expected_value: string;     // What it should be
  fix: string;                // How to correct it (CSS or text)
  location?: string;          // File path or line number
}

export interface CreativeStrategy {
  business_goal: string;      // e.g., "Raise Series A from conservative VCs"
  target_audience: string;    // e.g., "Enterprise CTOs, Risk-averse investors"
  visual_strategy: {
    aesthetic: DesignAesthetic;
    palette_direction: string; // e.g., "Institutional Trust: Navy/Cream"
    typography_direction: string; // e.g., "Serif headings for authority"
    imagery_direction: string; // e.g., "Abstract data topology, no cartoons"
  };
  messaging_strategy: {
    voice: VoicePersona;
    key_themes: string[];     // e.g., ["Reliability", "Proven ROI"]
    avoid: string[];          // e.g., ["Hype", "Unproven claims"]
  };
  tactical_outputs: string[]; // Specific deliverables needed
}

export interface CreativeDirectorRequest {
  modules: CreativeModule[];  // Which capabilities to activate
  project_name: string;
  project_description: string;

  // Module A: Style Engine
  aesthetic?: DesignAesthetic;
  custom_palette_requirements?: string;

  // Module B: Interface Architect
  ui_components?: UIComponent['component_type'][];
  accessibility_level?: 'WCAG_AA' | 'WCAG_AAA';

  // Module C: Prompt Engineer
  image_generation_needs?: {
    model: ImageGenerationModel;
    count: number;
    use_cases: string[];      // e.g., ["Hero image", "Icon set", "Diagram"]
  };

  // Module D: Voice
  text_to_rewrite?: string;
  target_persona?: VoicePersona;

  // Module E: Brand Auditor
  assets_to_audit?: {
    type: 'css' | 'html' | 'text' | 'notebook';
    content: string;
    file_path?: string;
  }[];
  brand_constitution?: {     // The "law" to check against
    approved_palette: ColorPalette;
    approved_typography: TypographySystem;
    approved_voice: VoicePersona;
  };

  // Module F: Strategist
  business_goal?: string;
  target_audience?: string;
  constraints?: string[];     // e.g., ["Must work in print", "No red (competitor color)"]
}

export interface NotebookCell {
  type: 'markdown' | 'code';
  content: string;
  metadata?: {
    collapsed?: boolean;
    execution_count?: number | null;
  };
}

export interface CreativeDirectorOutput {
  project_name: string;

  // Module A outputs
  palette?: ColorPalette;
  typography?: TypographySystem;

  // Module B outputs
  css_framework?: string;     // Complete CSS file content
  ui_components?: UIComponent[];

  // Module C outputs
  image_prompts?: ImagePrompt[];

  // Module D outputs
  rewritten_text?: Record<VoicePersona, string>; // Comparative outputs

  // Module E outputs
  brand_audit?: {
    violations: BrandViolation[];
    compliance_score: number;  // 0-100
    summary: string;
  };

  // Module F outputs
  creative_strategy?: CreativeStrategy;

  // Notebook generation
  notebook: {
    title: string;
    subtitle: string;
    cells: NotebookCell[];
    css_styling: string;       // Injected into first cell
    metadata: {
      modules_used: CreativeModule[];
      generated_at: string;
      version: string;
    };
  };
}

export interface AgentCard {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  input_schema: string;
  output_schema: string;
  dependencies?: string[];
  model_requirements?: string;
}
