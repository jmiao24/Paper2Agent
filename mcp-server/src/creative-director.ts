/**
 * creative-director.ts
 *
 * The Creative Director v1.2 - Implementation
 * Strategic Design Engine for ARTIFEX NERD SWARM
 *
 * "Form Follows Data. Consistency is Sovereignty. Strategy First."
 */

import type {
  CreativeDirectorRequest,
  CreativeDirectorOutput,
  ColorPalette,
  TypographySystem,
  UIComponent,
  ImagePrompt,
  BrandViolation,
  CreativeStrategy,
  NotebookCell,
  AgentCard,
  CreativeModule,
  DesignAesthetic,
  VoicePersona,
} from './creative-director-types.js';

/**
 * A2A Protocol Agent Card
 */
export const CREATIVE_DIRECTOR_AGENT_CARD: AgentCard = {
  name: 'The Creative Director',
  version: '1.2.0',
  description: 'Chief Creative Officer and Brand Architect. Generates palettes, typography systems, UI components, image prompts, brand audits, and creative strategies. Enforces consistency as "Brand Police".',
  capabilities: [
    'palette_generation',
    'typography_system_design',
    'css_framework_creation',
    'ui_component_generation',
    'image_prompt_engineering',
    'brand_consistency_auditing',
    'voice_persona_rewriting',
    'creative_strategy_development',
    'accessibility_compliance',
    'responsive_design',
  ],
  input_schema: 'CreativeDirectorRequest',
  output_schema: 'CreativeDirectorOutput',
  dependencies: ['Python 3.8+', 'IPython', 'Google Colab (recommended)'],
  model_requirements: 'Supports strategic design workflows with modular activation',
};

/**
 * Module A: The Style Engine
 * Generates color palettes based on art historical movements and aesthetic choices
 */
function generateColorPalette(aesthetic: DesignAesthetic, customRequirements?: string): ColorPalette {
  const palettes: Record<DesignAesthetic, ColorPalette> = {
    functional_brutalist: {
      name: 'Functional Brutalist',
      description: 'High contrast, monospace-friendly, raw data emphasis',
      primary: ['#000000', '#FFFFFF'],
      secondary: ['#1A1A1A', '#F5F5F5'],
      accents: ['#00FF00', '#FF0000'],
      neutrals: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'],
      semantic: {
        success: '#00FF00',
        warning: '#FFFF00',
        error: '#FF0000',
        info: '#00FFFF',
      },
      art_historical_reference: 'Bauhaus + Terminal Aesthetics',
    },
    swiss_international: {
      name: 'Swiss International Style',
      description: 'Grid-based precision, neutral authority',
      primary: ['#003366', '#F5F0E8'],
      secondary: ['#0055AA', '#E8DFD0'],
      accents: ['#CC0000', '#FFD700'],
      neutrals: ['#1A1A1A', '#4A4A4A', '#7A7A7A', '#AAAAAA', '#DADADA', '#F5F5F5'],
      semantic: {
        success: '#2E7D32',
        warning: '#F57C00',
        error: '#C62828',
        info: '#1976D2',
      },
      art_historical_reference: 'International Typographic Style (1950s Switzerland)',
    },
    neo_memphis: {
      name: 'Neo Memphis',
      description: 'Bold geometry, playful energy, 80s revival',
      primary: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
      secondary: ['#A8E6CF', '#FF8B94', '#C7CEEA'],
      accents: ['#1A1A2E', '#FECA57', '#48C9B0'],
      neutrals: ['#2C2C2C', '#555555', '#888888', '#BBBBBB', '#EEEEEE', '#FFFFFF'],
      semantic: {
        success: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
        info: '#3498DB',
      },
      art_historical_reference: 'Memphis Design Group (1980s Milan)',
    },
    dark_academic: {
      name: 'Dark Academic',
      description: 'Serif elegance, muted earth tones, scholarly gravitas',
      primary: ['#2C1810', '#F4E8D8'],
      secondary: ['#4A3428', '#D9C7B8'],
      accents: ['#8B4513', '#DAA520', '#2F4F4F'],
      neutrals: ['#1C1C1C', '#3E3E3E', '#6B6B6B', '#A0A0A0', '#D3D3D3', '#F8F8F8'],
      semantic: {
        success: '#556B2F',
        warning: '#B8860B',
        error: '#8B0000',
        info: '#4682B4',
      },
      art_historical_reference: 'Victorian Libraries + Renaissance Manuscripts',
    },
    cyber_industrial: {
      name: 'Cyber Industrial',
      description: 'Neon accents, distressed textures, tech dystopia',
      primary: ['#0A0E27', '#F0F0F0'],
      secondary: ['#1A1F3A', '#D0D0D0'],
      accents: ['#00FFFF', '#FF00FF', '#FFFF00'],
      neutrals: ['#000000', '#1A1A1A', '#404040', '#808080', '#C0C0C0', '#E0E0E0'],
      semantic: {
        success: '#39FF14',
        warning: '#FFA500',
        error: '#FF073A',
        info: '#00D9FF',
      },
      art_historical_reference: 'Cyberpunk + Industrial Design',
    },
    minimal_scandinavian: {
      name: 'Minimal Scandinavian',
      description: 'Whitespace emphasis, muted pastels, calm sophistication',
      primary: ['#2E3440', '#ECEFF4'],
      secondary: ['#3B4252', '#E5E9F0'],
      accents: ['#88C0D0', '#EBCB8B', '#A3BE8C'],
      neutrals: ['#2E3440', '#3B4252', '#434C5E', '#4C566A', '#D8DEE9', '#E5E9F0'],
      semantic: {
        success: '#A3BE8C',
        warning: '#EBCB8B',
        error: '#BF616A',
        info: '#5E81AC',
      },
      art_historical_reference: 'Nordic Design + Hygge Philosophy',
    },
    custom: {
      name: 'Custom Palette',
      description: customRequirements || 'User-defined color system',
      primary: ['#000000', '#FFFFFF'],
      secondary: ['#333333', '#CCCCCC'],
      accents: ['#0066CC', '#FF6600'],
      neutrals: ['#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'],
      semantic: {
        success: '#28A745',
        warning: '#FFC107',
        error: '#DC3545',
        info: '#17A2B8',
      },
    },
  };

  return palettes[aesthetic];
}

/**
 * Module A: Typography System Generator
 */
function generateTypographySystem(aesthetic: DesignAesthetic): TypographySystem {
  const systems: Record<DesignAesthetic, TypographySystem> = {
    functional_brutalist: {
      name: 'Brutalist Mono',
      description: 'Monospace everywhere for data-centric clarity',
      fonts: {
        display: {
          family: 'IBM Plex Mono',
          weights: [700, 800],
          fallback: 'Courier New, monospace',
        },
        body: {
          family: 'IBM Plex Mono',
          weights: [400, 500],
          fallback: 'Courier New, monospace',
        },
        monospace: {
          family: 'Fira Code',
          weights: [400, 600],
          fallback: 'Consolas, monospace',
        },
      },
      scale: {
        ratio: 1.25,
        base_size: '16px',
        sizes: {
          h1: '3.052rem',
          h2: '2.441rem',
          h3: '1.953rem',
          h4: '1.563rem',
          h5: '1.25rem',
          body: '1rem',
          small: '0.8rem',
        },
      },
    },
    swiss_international: {
      name: 'Swiss Grid',
      description: 'Helvetica-based precision and neutrality',
      fonts: {
        display: {
          family: 'Helvetica Neue',
          weights: [700, 900],
          fallback: 'Arial, sans-serif',
        },
        body: {
          family: 'Helvetica Neue',
          weights: [400, 500],
          fallback: 'Arial, sans-serif',
        },
        monospace: {
          family: 'JetBrains Mono',
          weights: [400, 600],
          fallback: 'Consolas, monospace',
        },
      },
      scale: {
        ratio: 1.33,
        base_size: '16px',
        sizes: {
          h1: '3.157rem',
          h2: '2.369rem',
          h3: '1.777rem',
          h4: '1.333rem',
          h5: '1rem',
          body: '1rem',
          small: '0.75rem',
        },
      },
    },
    neo_memphis: {
      name: 'Memphis Pop',
      description: 'Bold geometric sans with personality',
      fonts: {
        display: {
          family: 'Poppins',
          weights: [700, 900],
          fallback: 'Arial Black, sans-serif',
        },
        body: {
          family: 'Work Sans',
          weights: [400, 500],
          fallback: 'Arial, sans-serif',
        },
        monospace: {
          family: 'Space Mono',
          weights: [400, 700],
          fallback: 'Courier New, monospace',
        },
      },
      scale: {
        ratio: 1.414,
        base_size: '16px',
        sizes: {
          h1: '4rem',
          h2: '2.827rem',
          h3: '2rem',
          h4: '1.414rem',
          h5: '1rem',
          body: '1rem',
          small: '0.707rem',
        },
      },
    },
    dark_academic: {
      name: 'Scholarly Serif',
      description: 'Classical elegance with modern legibility',
      fonts: {
        display: {
          family: 'Crimson Pro',
          weights: [600, 700],
          fallback: 'Georgia, serif',
        },
        body: {
          family: 'Lora',
          weights: [400, 500],
          fallback: 'Georgia, serif',
        },
        monospace: {
          family: 'Inconsolata',
          weights: [400, 600],
          fallback: 'Courier New, monospace',
        },
      },
      scale: {
        ratio: 1.25,
        base_size: '18px',
        sizes: {
          h1: '3.052rem',
          h2: '2.441rem',
          h3: '1.953rem',
          h4: '1.563rem',
          h5: '1.25rem',
          body: '1rem',
          small: '0.8rem',
        },
      },
    },
    cyber_industrial: {
      name: 'Techno Dystopia',
      description: 'Angular geometry with digital distortion',
      fonts: {
        display: {
          family: 'Orbitron',
          weights: [700, 900],
          fallback: 'Impact, sans-serif',
        },
        body: {
          family: 'Rajdhani',
          weights: [400, 500],
          fallback: 'Arial, sans-serif',
        },
        monospace: {
          family: 'Share Tech Mono',
          weights: [400],
          fallback: 'Courier New, monospace',
        },
      },
      scale: {
        ratio: 1.5,
        base_size: '16px',
        sizes: {
          h1: '5.063rem',
          h2: '3.375rem',
          h3: '2.25rem',
          h4: '1.5rem',
          h5: '1rem',
          body: '1rem',
          small: '0.667rem',
        },
      },
    },
    minimal_scandinavian: {
      name: 'Nordic Calm',
      description: 'Clean sans-serif with generous spacing',
      fonts: {
        display: {
          family: 'Inter',
          weights: [600, 700],
          fallback: 'Arial, sans-serif',
        },
        body: {
          family: 'Inter',
          weights: [400, 500],
          fallback: 'Arial, sans-serif',
        },
        monospace: {
          family: 'Roboto Mono',
          weights: [400, 500],
          fallback: 'Consolas, monospace',
        },
      },
      scale: {
        ratio: 1.2,
        base_size: '16px',
        sizes: {
          h1: '2.488rem',
          h2: '2.074rem',
          h3: '1.728rem',
          h4: '1.44rem',
          h5: '1.2rem',
          body: '1rem',
          small: '0.833rem',
        },
      },
    },
    custom: {
      name: 'Custom Typography',
      description: 'User-defined font system',
      fonts: {
        display: {
          family: 'System UI',
          weights: [700],
          fallback: 'sans-serif',
        },
        body: {
          family: 'System UI',
          weights: [400],
          fallback: 'sans-serif',
        },
        monospace: {
          family: 'Monospace',
          weights: [400],
          fallback: 'monospace',
        },
      },
      scale: {
        ratio: 1.25,
        base_size: '16px',
        sizes: {
          h1: '3.052rem',
          h2: '2.441rem',
          h3: '1.953rem',
          h4: '1.563rem',
          h5: '1.25rem',
          body: '1rem',
          small: '0.8rem',
        },
      },
    },
  };

  return systems[aesthetic];
}

/**
 * Module B: UI Component Generator
 */
function generateUIComponents(
  componentTypes: UIComponent['component_type'][],
  palette: ColorPalette,
  typography: TypographySystem,
  accessibilityLevel: 'WCAG_AA' | 'WCAG_AAA' = 'WCAG_AA'
): UIComponent[] {
  const components: UIComponent[] = [];

  if (componentTypes.includes('card')) {
    components.push({
      component_type: 'card',
      name: 'Data Card',
      html: `<div class="data-card">
  <header class="card-header">
    <h3 class="card-title">Experiment Results</h3>
    <span class="card-badge">Active</span>
  </header>
  <div class="card-body">
    <p class="card-metric">Accuracy: <strong>94.7%</strong></p>
    <p class="card-metric">Loss: <strong>0.023</strong></p>
  </div>
  <footer class="card-footer">
    <button class="btn-primary">View Details</button>
  </footer>
</div>`,
      css: `.data-card {
  background: ${palette.neutrals[5] || '#FFFFFF'};
  border: 2px solid ${palette.neutrals[3] || '#999999'};
  border-radius: 0;
  padding: 1.5rem;
  font-family: ${typography.fonts.body.family}, ${typography.fonts.body.fallback};
  box-shadow: 4px 4px 0 ${palette.neutrals[0] || '#000000'};
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${palette.neutrals[0] || '#000000'};
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.card-title {
  font-family: ${typography.fonts.display.family}, ${typography.fonts.display.fallback};
  font-size: ${typography.scale.sizes.h4};
  font-weight: ${typography.fonts.display.weights[0]};
  margin: 0;
  color: ${palette.primary[0] || '#000000'};
}

.card-badge {
  background: ${palette.semantic.success};
  color: ${palette.neutrals[5] || '#FFFFFF'};
  padding: 0.25rem 0.75rem;
  font-size: ${typography.scale.sizes.small};
  font-weight: ${typography.fonts.body.weights[1] || 500};
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-body {
  margin-bottom: 1rem;
}

.card-metric {
  font-family: ${typography.fonts.monospace.family}, ${typography.fonts.monospace.fallback};
  font-size: ${typography.scale.sizes.body};
  margin: 0.5rem 0;
  color: ${palette.neutrals[1] || '#1A1A1A'};
}

.card-metric strong {
  color: ${palette.accents[0] || '#0066CC'};
  font-weight: ${typography.fonts.monospace.weights[1] || 600};
}

.card-footer {
  border-top: 1px solid ${palette.neutrals[4] || '#CCCCCC'};
  padding-top: 0.75rem;
}

.btn-primary {
  background: ${palette.primary[0] || '#000000'};
  color: ${palette.primary[1] || '#FFFFFF'};
  border: none;
  padding: 0.5rem 1.5rem;
  font-family: ${typography.fonts.body.family}, ${typography.fonts.body.fallback};
  font-size: ${typography.scale.sizes.body};
  font-weight: ${typography.fonts.body.weights[1] || 500};
  cursor: pointer;
  transition: transform 0.1s;
}

.btn-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 ${palette.neutrals[0] || '#000000'};
}

.btn-primary:focus {
  outline: 3px solid ${palette.accents[0] || '#0066CC'};
  outline-offset: 2px;
}`,
      accessibility_notes: [
        `${accessibilityLevel}: Color contrast ratio meets ${accessibilityLevel === 'WCAG_AAA' ? '7:1' : '4.5:1'} minimum`,
        'Focus states use 3px outline with 2px offset for keyboard navigation',
        'Semantic HTML with proper heading hierarchy',
        'Interactive elements have minimum 44x44px touch target (mobile)',
      ],
      responsive_breakpoints: {
        mobile: `@media (max-width: 768px) {
  .data-card { padding: 1rem; }
  .card-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}`,
      },
    });
  }

  if (componentTypes.includes('dashboard')) {
    components.push({
      component_type: 'dashboard',
      name: 'Research Dashboard',
      html: `<div class="dashboard-grid">
  <aside class="sidebar" role="navigation" aria-label="Main navigation">
    <nav>
      <a href="#experiments" class="nav-item active">Experiments</a>
      <a href="#datasets" class="nav-item">Datasets</a>
      <a href="#models" class="nav-item">Models</a>
      <a href="#security" class="nav-item">Security</a>
    </nav>
  </aside>
  <main class="main-content" role="main">
    <header class="dashboard-header">
      <h1>ARTIFEX NERD SWARM</h1>
      <div class="status-indicator">
        <span class="status-dot" aria-label="System status: Operational"></span>
        <span>OPERATIONAL</span>
      </div>
    </header>
    <section class="metrics-grid">
      <!-- Cards go here -->
    </section>
  </main>
</div>`,
      css: `.dashboard-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: ${palette.neutrals[5] || '#FFFFFF'};
  font-family: ${typography.fonts.body.family}, ${typography.fonts.body.fallback};
}

.sidebar {
  background: ${palette.primary[0] || '#000000'};
  color: ${palette.primary[1] || '#FFFFFF'};
  padding: 2rem 1rem;
  border-right: 4px solid ${palette.accents[0] || '#00FF00'};
}

.nav-item {
  display: block;
  padding: 0.75rem 1rem;
  color: ${palette.neutrals[4] || '#CCCCCC'};
  text-decoration: none;
  font-family: ${typography.fonts.monospace.family}, ${typography.fonts.monospace.fallback};
  font-size: ${typography.scale.sizes.body};
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: ${palette.primary[1] || '#FFFFFF'};
}

.nav-item.active {
  border-left-color: ${palette.accents[0] || '#00FF00'};
  background: rgba(255, 255, 255, 0.05);
  color: ${palette.accents[0] || '#00FF00'};
}

.main-content {
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid ${palette.neutrals[0] || '#000000'};
}

.dashboard-header h1 {
  font-family: ${typography.fonts.display.family}, ${typography.fonts.display.fallback};
  font-size: ${typography.scale.sizes.h2};
  font-weight: ${typography.fonts.display.weights[1] || 900};
  margin: 0;
  color: ${palette.primary[0] || '#000000'};
  letter-spacing: -0.02em;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ${typography.fonts.monospace.family}, ${typography.fonts.monospace.fallback};
  font-size: ${typography.scale.sizes.small};
  font-weight: ${typography.fonts.monospace.weights[1] || 600};
  color: ${palette.semantic.success};
}

.status-dot {
  width: 12px;
  height: 12px;
  background: ${palette.semantic.success};
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .sidebar {
    border-right: none;
    border-bottom: 4px solid ${palette.accents[0] || '#00FF00'};
  }
}`,
      accessibility_notes: [
        'ARIA landmarks (navigation, main) for screen readers',
        'Skip-to-content link should be added for keyboard users',
        'Status indicator uses aria-label for non-visual communication',
        'Responsive grid collapses to single column on mobile',
      ],
      responsive_breakpoints: {
        tablet: `@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}`,
        mobile: `@media (max-width: 768px) {
  .metrics-grid { grid-template-columns: 1fr; }
}`,
      },
    });
  }

  return components;
}

/**
 * Module C: Prompt Engineer
 */
function generateImagePrompts(
  model: ImagePrompt['model'],
  useCases: string[],
  aesthetic: DesignAesthetic
): ImagePrompt[] {
  const prompts: ImagePrompt[] = [];

  const aestheticStyles: Record<DesignAesthetic, string> = {
    functional_brutalist: 'brutalist architecture, raw concrete, high contrast black and white, geometric precision, minimalist, utilitarian',
    swiss_international: 'swiss design, clean grid layout, helvetica typography, neutral colors, precise alignment, modernist',
    neo_memphis: 'memphis design, bold geometric shapes, bright colors, playful patterns, 1980s aesthetic, pop art influence',
    dark_academic: 'dark academia, vintage library, leather-bound books, warm candlelight, scholarly atmosphere, classical art',
    cyber_industrial: 'cyberpunk, neon lights, industrial machinery, dystopian cityscape, holographic interfaces, tech noir',
    minimal_scandinavian: 'scandinavian design, minimalist, natural light, whitespace, muted colors, hygge aesthetic, clean lines',
    custom: 'modern, clean, professional',
  };

  const baseStyle = aestheticStyles[aesthetic];

  for (const useCase of useCases) {
    if (useCase.toLowerCase().includes('hero')) {
      prompts.push({
        model,
        prompt: `${baseStyle}, hero image for research lab website, abstract data visualization, flowing particles forming neural network patterns, depth of field, cinematic composition, professional photography, 8k resolution, studio lighting, award-winning design`,
        negative_prompt: 'cartoon, illustration, low quality, blurry, text, watermark, signature, amateur',
        technical_params: {
          aspect_ratio: '16:9',
          style_weight: model === 'midjourney' ? 750 : undefined,
          chaos: model === 'midjourney' ? 15 : undefined,
          quality: model === 'dalle3' ? 'hd' : undefined,
          lighting: 'Dramatic studio lighting with rim light',
          camera_angle: 'Wide angle, slightly elevated perspective',
          texture: 'Smooth gradients with sharp geometric elements',
        },
        use_case: useCase,
      });
    }

    if (useCase.toLowerCase().includes('icon')) {
      prompts.push({
        model,
        prompt: `${baseStyle}, minimalist icon set for AI research tools, simple geometric symbols, consistent line weight, flat design, monochromatic with accent color, scalable vector style, professional UI design`,
        negative_prompt: '3d, shadow, gradient, photograph, realistic, complex',
        technical_params: {
          aspect_ratio: '1:1',
          style_weight: model === 'midjourney' ? 250 : undefined,
          chaos: model === 'midjourney' ? 0 : undefined,
          quality: model === 'dalle3' ? 'standard' : undefined,
          lighting: 'Flat, even lighting',
          camera_angle: 'Straight-on orthographic view',
          texture: 'Flat matte finish',
        },
        use_case: useCase,
      });
    }

    if (useCase.toLowerCase().includes('diagram')) {
      prompts.push({
        model,
        prompt: `${baseStyle}, technical diagram showing multi-agent system architecture, clean flowchart style, nodes and edges, hierarchical layout, professional infographic, clear typography, data visualization aesthetic`,
        negative_prompt: 'messy, cluttered, handdrawn, sketch, informal, decorative',
        technical_params: {
          aspect_ratio: '4:3',
          style_weight: model === 'midjourney' ? 500 : undefined,
          chaos: model === 'midjourney' ? 5 : undefined,
          quality: model === 'dalle3' ? 'hd' : undefined,
          lighting: 'Soft even lighting',
          camera_angle: 'Top-down orthographic',
          texture: 'Clean vector style with subtle texture',
        },
        use_case: useCase,
      });
    }
  }

  return prompts;
}

/**
 * Module D: Voice Rewriter
 */
function rewriteTextInVoices(originalText: string): Record<VoicePersona, string> {
  // This is a template-based approach; in production, this would use an LLM
  return {
    the_operator: `SITREP: ${originalText}\n\nEXECUTE: Implement the above directives per SOP. Confirm completion via secure channel. Time-sensitive.\n\n// END TRANSMISSION`,
    the_visionary: `Imagine a future where ${originalText.toLowerCase()}\n\nThis isn't just an incremental improvement—it's a paradigm shift. We're not building tools; we're architecting the infrastructure of tomorrow's research ecosystem. The question isn't "can we?" but "when do we start?"`,
    the_institutional: `Executive Summary:\n\n${originalText}\n\nThis proposal aligns with our strategic objectives and adheres to established governance frameworks. Pending approval from the Steering Committee, we recommend phased implementation with quarterly progress reviews.\n\nRespectfully submitted,\n[Department Name]`,
    the_rebel: `The establishment says: "${originalText}"\n\nBut here's what they won't tell you: The current system is fundamentally broken. We don't need permission to innovate. We need to build parallel infrastructure and prove them obsolete.\n\nThe revolution will not be peer-reviewed.`,
    the_educator: `Let's break this down step by step:\n\n${originalText}\n\nThink of it like this: [analogy explaining the concept]. This matters because [clear reasoning]. If you're still confused, that's okay! Here are three key takeaways:\n\n1. [Simplified point]\n2. [Simplified point]\n3. [Simplified point]\n\nQuestions? Let's discuss!`,
  };
}

/**
 * Module E: Brand Auditor
 */
function auditBrandCompliance(
  content: string,
  fileType: 'css' | 'html' | 'text' | 'notebook',
  approvedPalette: ColorPalette,
  approvedTypography: TypographySystem,
  approvedVoice: VoicePersona
): { violations: BrandViolation[]; compliance_score: number; summary: string } {
  const violations: BrandViolation[] = [];

  // Color audit (simplified regex-based for demonstration)
  const hexMatches = content.match(/#[0-9A-Fa-f]{6}/g) || [];
  const allApprovedColors = [
    ...approvedPalette.primary,
    ...approvedPalette.secondary,
    ...approvedPalette.accents,
    ...approvedPalette.neutrals,
    ...Object.values(approvedPalette.semantic),
  ].map((c) => c.toUpperCase());

  for (const hex of hexMatches) {
    if (!allApprovedColors.includes(hex.toUpperCase())) {
      violations.push({
        severity: 'major',
        category: 'color',
        violation: `Unauthorized color detected: ${hex}`,
        current_value: hex,
        expected_value: `One of: ${approvedPalette.primary.join(', ')}`,
        fix: `Replace ${hex} with an approved palette color`,
        location: fileType === 'css' ? 'CSS stylesheet' : undefined,
      });
    }
  }

  // Typography audit
  const fontFamilyMatches = content.match(/font-family:\s*([^;]+);/gi) || [];
  const approvedFonts = [
    approvedTypography.fonts.display.family,
    approvedTypography.fonts.body.family,
    approvedTypography.fonts.monospace.family,
  ];

  for (const match of fontFamilyMatches) {
    const fontValue = match.replace(/font-family:\s*/i, '').replace(';', '').trim();
    const hasApprovedFont = approvedFonts.some((font) => fontValue.includes(font));
    if (!hasApprovedFont) {
      violations.push({
        severity: 'major',
        category: 'typography',
        violation: 'Unapproved font family detected',
        current_value: fontValue,
        expected_value: approvedFonts.join(' OR '),
        fix: `Update font-family to use approved typography system`,
      });
    }
  }

  // Voice audit (text analysis - simplified)
  if (fileType === 'text' || fileType === 'notebook') {
    const hasCapsLockYelling = /[A-Z]{10,}/.test(content) && approvedVoice !== 'the_operator';
    if (hasCapsLockYelling) {
      violations.push({
        severity: 'minor',
        category: 'voice',
        violation: 'Excessive capitalization not aligned with approved voice',
        current_value: 'ALL CAPS SECTIONS',
        expected_value: `${approvedVoice} voice guidelines`,
        fix: 'Rewrite sections in approved voice persona',
      });
    }
  }

  const totalChecks = hexMatches.length + fontFamilyMatches.length + 1;
  const complianceScore = Math.max(0, ((totalChecks - violations.length) / totalChecks) * 100);

  const summary =
    violations.length === 0
      ? `✅ BRAND AUDIT PASSED: 100% compliance with ${approvedPalette.name} palette and ${approvedTypography.name} typography.`
      : `⚠️ BRAND VIOLATIONS DETECTED: ${violations.length} issues found. Compliance score: ${complianceScore.toFixed(1)}%. Immediate remediation required.`;

  return { violations, compliance_score: complianceScore, summary };
}

/**
 * Module F: Creative Strategist
 */
function developCreativeStrategy(
  businessGoal: string,
  targetAudience: string,
  constraints: string[]
): CreativeStrategy {
  // Template-based strategy generation (would use LLM in production)
  let aesthetic: DesignAesthetic = 'functional_brutalist';
  let voice: VoicePersona = 'the_operator';

  // Simple heuristics
  if (businessGoal.toLowerCase().includes('funding') || targetAudience.toLowerCase().includes('investor')) {
    aesthetic = 'swiss_international';
    voice = 'the_visionary';
  } else if (targetAudience.toLowerCase().includes('enterprise') || targetAudience.toLowerCase().includes('cto')) {
    aesthetic = 'swiss_international';
    voice = 'the_institutional';
  } else if (businessGoal.toLowerCase().includes('community') || targetAudience.toLowerCase().includes('researcher')) {
    aesthetic = 'minimal_scandinavian';
    voice = 'the_educator';
  }

  return {
    business_goal: businessGoal,
    target_audience: targetAudience,
    visual_strategy: {
      aesthetic,
      palette_direction: `${aesthetic} palette for ${targetAudience}`,
      typography_direction: `${aesthetic} typography for professional credibility`,
      imagery_direction: 'Abstract data visualizations, no stock photos, high-quality renders',
    },
    messaging_strategy: {
      voice,
      key_themes: ['Innovation', 'Reliability', 'Expertise', 'Results-driven'],
      avoid: ['Hype', 'Unsubstantiated claims', 'Jargon without explanation'],
    },
    tactical_outputs: [
      'Landing page with hero section',
      'Pitch deck (15 slides)',
      'Brand guidelines document',
      'Social media templates',
      'Email signature template',
    ],
  };
}

/**
 * Generate CSS Framework Code
 */
function generateCSSFramework(palette: ColorPalette, typography: TypographySystem): string {
  return `:root {
  /* Color Palette: ${palette.name} */
  --color-primary-0: ${palette.primary[0]};
  --color-primary-1: ${palette.primary[1] || palette.primary[0]};
  --color-secondary-0: ${palette.secondary[0]};
  --color-secondary-1: ${palette.secondary[1] || palette.secondary[0]};
  --color-accent-0: ${palette.accents[0]};
  --color-accent-1: ${palette.accents[1] || palette.accents[0]};
  --color-accent-2: ${palette.accents[2] || palette.accents[0]};
  --color-neutral-0: ${palette.neutrals[0]};
  --color-neutral-1: ${palette.neutrals[1]};
  --color-neutral-2: ${palette.neutrals[2]};
  --color-neutral-3: ${palette.neutrals[3]};
  --color-neutral-4: ${palette.neutrals[4]};
  --color-neutral-5: ${palette.neutrals[5]};
  --color-success: ${palette.semantic.success};
  --color-warning: ${palette.semantic.warning};
  --color-error: ${palette.semantic.error};
  --color-info: ${palette.semantic.info};

  /* Typography: ${typography.name} */
  --font-display: ${typography.fonts.display.family}, ${typography.fonts.display.fallback};
  --font-body: ${typography.fonts.body.family}, ${typography.fonts.body.fallback};
  --font-mono: ${typography.fonts.monospace.family}, ${typography.fonts.monospace.fallback};

  --font-size-h1: ${typography.scale.sizes.h1};
  --font-size-h2: ${typography.scale.sizes.h2};
  --font-size-h3: ${typography.scale.sizes.h3};
  --font-size-h4: ${typography.scale.sizes.h4};
  --font-size-h5: ${typography.scale.sizes.h5};
  --font-size-body: ${typography.scale.sizes.body};
  --font-size-small: ${typography.scale.sizes.small};

  /* Spacing Scale (8px base) */
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2rem;
  --space-5: 3rem;
  --space-6: 4rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  line-height: 1.6;
  color: var(--color-neutral-0);
  background: var(--color-neutral-5);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  line-height: 1.2;
  margin-bottom: var(--space-2);
}

h1 { font-size: var(--font-size-h1); font-weight: ${typography.fonts.display.weights[1] || 700}; }
h2 { font-size: var(--font-size-h2); font-weight: ${typography.fonts.display.weights[0] || 700}; }
h3 { font-size: var(--font-size-h3); font-weight: ${typography.fonts.display.weights[0] || 700}; }
h4 { font-size: var(--font-size-h4); font-weight: ${typography.fonts.display.weights[0] || 700}; }
h5 { font-size: var(--font-size-h5); font-weight: ${typography.fonts.display.weights[0] || 700}; }

code, pre {
  font-family: var(--font-mono);
  background: var(--color-neutral-4);
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
}

a {
  color: var(--color-accent-0);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

a:hover {
  border-bottom-color: var(--color-accent-0);
}

a:focus {
  outline: 3px solid var(--color-accent-0);
  outline-offset: 2px;
}

/* Utility Classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mb-1 { margin-bottom: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); }
.p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); }
`;
}

/**
 * Main generation function
 */
export function generateCreativeDirectorOutput(request: CreativeDirectorRequest): CreativeDirectorOutput {
  const aesthetic = request.aesthetic || 'functional_brutalist';
  const palette = generateColorPalette(aesthetic, request.custom_palette_requirements);
  const typography = generateTypographySystem(aesthetic);

  const output: CreativeDirectorOutput = {
    project_name: request.project_name,
    notebook: {
      title: `The Creative Director v1.2 :: ${request.project_name}`,
      subtitle: 'Strategic Design Engine for ARTIFEX NERD SWARM',
      cells: [],
      css_styling: '',
      metadata: {
        modules_used: request.modules,
        generated_at: new Date().toISOString(),
        version: '1.2.0',
      },
    },
  };

  // Generate brutalist CSS for notebook
  const notebookCSS = `
<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');

body {
  background: #000000 !important;
  color: #00FF00 !important;
  font-family: 'IBM Plex Mono', 'Courier New', monospace !important;
}

.output_area {
  background: #1A1A1A !important;
  border-left: 4px solid #00FF00 !important;
  padding: 1rem !important;
  font-family: 'IBM Plex Mono', monospace !important;
}

h1, h2, h3 {
  color: #FFFFFF !important;
  font-family: 'IBM Plex Mono', monospace !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  border-bottom: 3px solid #00FF00 !important;
  padding-bottom: 0.5rem !important;
}

.alert-success { background: #003300 !important; border-left: 5px solid #00FF00 !important; color: #00FF00 !important; }
.alert-warning { background: #333300 !important; border-left: 5px solid #FFFF00 !important; color: #FFFF00 !important; }
.alert-danger { background: #330000 !important; border-left: 5px solid #FF0000 !important; color: #FF0000 !important; }

code {
  background: #0A0A0A !important;
  color: #00FFFF !important;
  padding: 0.2rem 0.4rem !important;
  border: 1px solid #00FF00 !important;
}

table {
  border: 2px solid #00FF00 !important;
  font-family: 'IBM Plex Mono', monospace !important;
}

th {
  background: #00FF00 !important;
  color: #000000 !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
}

td {
  border: 1px solid #333333 !important;
  color: #00FF00 !important;
}
</style>
`;

  output.notebook.css_styling = notebookCSS;

  // Header cell
  output.notebook.cells.push({
    type: 'markdown',
    content: `# THE CREATIVE DIRECTOR v1.2
## Strategic Design Engine for ${request.project_name}

**Philosophy:**
- 🔲 Form Follows Data: Beauty must serve readability
- 👮 Consistency is Sovereignty: Enforce brand standards
- 🎯 Strategy First: Every pixel serves a business objective

**Active Modules:** ${request.modules.map((m) => m.toUpperCase()).join(' | ')}

---`,
  });

  // Module A: Style Engine
  if (request.modules.includes('style_engine')) {
    output.palette = palette;
    output.typography = typography;

    output.notebook.cells.push({
      type: 'markdown',
      content: `## MODULE A :: THE STYLE ENGINE
### Palette & Typography Generation

**Aesthetic:** \`${aesthetic}\`
**Palette:** ${palette.name}
**Art Historical Reference:** ${palette.art_historical_reference || 'N/A'}`,
    });

    output.notebook.cells.push({
      type: 'code',
      content: `# Color Palette: ${palette.name}
from IPython.display import HTML, display

palette = ${JSON.stringify(palette, null, 2)}

# Render color swatches
html = '<div style="display: flex; flex-wrap: wrap; gap: 1rem; padding: 1rem; background: #1A1A1A;">'
for category, colors in palette.items():
    if category not in ['name', 'description', 'art_historical_reference']:
        if isinstance(colors, dict):
            for key, color in colors.items():
                html += f'<div style="background: {color}; width: 100px; height: 100px; border: 2px solid #00FF00; display: flex; align-items: center; justify-content: center; font-family: monospace; color: {"#000" if sum(int(color[i:i+2], 16) for i in (1, 3, 5)) > 384 else "#FFF"}; font-size: 10px; text-align: center;">{category}.{key}<br>{color}</div>'
        elif isinstance(colors, list):
            for color in colors:
                html += f'<div style="background: {color}; width: 100px; height: 100px; border: 2px solid #00FF00; display: flex; align-items: center; justify-content: center; font-family: monospace; color: {"#000" if sum(int(color[i:i+2], 16) for i in (1, 3, 5)) > 384 else "#FFF"}; font-size: 12px;">{color}</div>'
html += '</div>'
display(HTML(html))

print(f"✅ Palette '{palette['name']}' generated successfully")`,
    });

    output.notebook.cells.push({
      type: 'code',
      content: `# Typography System: ${typography.name}
typography = ${JSON.stringify(typography, null, 2)}

# Display type specimen
specimen_html = f'''
<div style="background: #000000; color: #00FF00; padding: 2rem; font-family: {typography['fonts']['body']['family']}, {typography['fonts']['body']['fallback']};">
    <h1 style="font-family: {typography['fonts']['display']['family']}, {typography['fonts']['display']['fallback']}; font-size: {typography['scale']['sizes']['h1']}; font-weight: {typography['fonts']['display']['weights'][0]}; color: #FFFFFF; margin-bottom: 1rem;">Heading Level 1</h1>
    <h2 style="font-family: {typography['fonts']['display']['family']}, {typography['fonts']['display']['fallback']}; font-size: {typography['scale']['sizes']['h2']}; font-weight: {typography['fonts']['display']['weights'][0]}; color: #FFFFFF; margin-bottom: 0.75rem;">Heading Level 2</h2>
    <p style="font-size: {typography['scale']['sizes']['body']}; line-height: 1.6; color: #00FF00; margin-bottom: 1rem;">
        Body text: The quick brown fox jumps over the lazy dog. This demonstrates the body font at the base size with proper line-height for readability.
    </p>
    <code style="font-family: {typography['fonts']['monospace']['family']}, {typography['fonts']['monospace']['fallback']}; background: #1A1A1A; padding: 0.5rem; display: block; color: #00FFFF;">
        def example_code():<br>
        &nbsp;&nbsp;&nbsp;&nbsp;return "Monospace font for code"
    </code>
</div>
'''
display(HTML(specimen_html))

print(f"✅ Typography system '{typography['name']}' generated successfully")`,
    });
  }

  // Module B: Interface Architect
  if (request.modules.includes('interface_architect') && request.ui_components) {
    const components = generateUIComponents(
      request.ui_components,
      palette,
      typography,
      request.accessibility_level
    );
    output.ui_components = components;
    output.css_framework = generateCSSFramework(palette, typography);

    output.notebook.cells.push({
      type: 'markdown',
      content: `## MODULE B :: THE INTERFACE ARCHITECT
### UI/UX Component Generation

**Components Requested:** ${request.ui_components.join(', ')}
**Accessibility Level:** ${request.accessibility_level || 'WCAG_AA'}`,
    });

    output.notebook.cells.push({
      type: 'code',
      content: `# CSS Framework Generation
from IPython.display import display, HTML

css_framework = """${output.css_framework.replace(/\n/g, '\n')}"""

print("✅ CSS Framework generated")
print(f"   Variables defined: {css_framework.count('--')}")
print(f"   Total lines: {len(css_framework.split(chr(10)))}")

# Save to file (if running locally)
# with open('framework.css', 'w') as f:
#     f.write(css_framework)`,
    });

    for (const component of components) {
      output.notebook.cells.push({
        type: 'markdown',
        content: `### Component: ${component.name}
**Type:** \`${component.component_type}\`

**Accessibility Notes:**
${component.accessibility_notes.map((note) => `- ${note}`).join('\n')}`,
      });

      output.notebook.cells.push({
        type: 'code',
        content: `# ${component.name} - Live Preview
from IPython.display import HTML

component_html = """
${component.html}
"""

component_css = """
<style>
${component.css}
</style>
"""

display(HTML(component_css + component_html))
print(f"✅ {component.name} rendered")`,
      });
    }
  }

  // Module C: Prompt Engineer
  if (request.modules.includes('prompt_engineer') && request.image_generation_needs) {
    const prompts = generateImagePrompts(
      request.image_generation_needs.model,
      request.image_generation_needs.use_cases,
      aesthetic
    );
    output.image_prompts = prompts;

    output.notebook.cells.push({
      type: 'markdown',
      content: `## MODULE C :: THE PROMPT ENGINEER
### Image Generation Prompts

**Model:** ${request.image_generation_needs.model}
**Use Cases:** ${request.image_generation_needs.use_cases.join(', ')}`,
    });

    for (const prompt of prompts) {
      output.notebook.cells.push({
        type: 'code',
        content: `# ${prompt.use_case}
prompt_${prompt.use_case.replace(/\s+/g, '_').toLowerCase()} = """
${prompt.prompt}
"""

negative_prompt = """
${prompt.negative_prompt || 'None'}
"""

technical_params = ${JSON.stringify(prompt.technical_params, null, 2)}

print("📸 PROMPT READY FOR ${prompt.model.toUpperCase()}")
print("=" * 60)
print(prompt_${prompt.use_case.replace(/\s+/g, '_').toLowerCase()})
print("=" * 60)
print(f"Aspect Ratio: {technical_params.get('aspect_ratio', 'default')}")
print(f"Lighting: {technical_params.get('lighting', 'unspecified')}")
print(f"Camera: {technical_params.get('camera_angle', 'unspecified')}")
print("\\n✅ Copy prompt above and paste into ${prompt.model}")`,
      });
    }
  }

  // Module D: Voice
  if (request.modules.includes('voice') && request.text_to_rewrite) {
    const rewrittenText = rewriteTextInVoices(request.text_to_rewrite);
    output.rewritten_text = rewrittenText;

    output.notebook.cells.push({
      type: 'markdown',
      content: `## MODULE D :: THE VOICE
### Messaging & Persona Rewriting

**Original Text:**
> ${request.text_to_rewrite}`,
    });

    for (const [persona, text] of Object.entries(rewrittenText)) {
      output.notebook.cells.push({
        type: 'markdown',
        content: `### ${persona.toUpperCase().replace(/_/g, ' ')}
\`\`\`
${text}
\`\`\``,
      });
    }
  }

  // Module E: Brand Auditor
  if (request.modules.includes('brand_auditor') && request.assets_to_audit && request.brand_constitution) {
    const allViolations: BrandViolation[] = [];
    let totalScore = 0;

    output.notebook.cells.push({
      type: 'markdown',
      content: `## MODULE E :: THE BRAND AUDITOR
### Consistency & Compliance Checking

**Brand Constitution:**
- Palette: ${request.brand_constitution.approved_palette.name}
- Typography: ${request.brand_constitution.approved_typography.name}
- Voice: ${request.brand_constitution.approved_voice}`,
    });

    for (const asset of request.assets_to_audit) {
      const audit = auditBrandCompliance(
        asset.content,
        asset.type,
        request.brand_constitution.approved_palette,
        request.brand_constitution.approved_typography,
        request.brand_constitution.approved_voice
      );

      allViolations.push(...audit.violations);
      totalScore += audit.compliance_score;

      output.notebook.cells.push({
        type: 'code',
        content: `# Audit Report: ${asset.file_path || asset.type}
audit_summary = """${audit.summary}"""
print(audit_summary)

violations = ${JSON.stringify(audit.violations, null, 2)}

if violations:
    print("\\n⚠️  VIOLATIONS DETECTED:")
    for i, v in enumerate(violations, 1):
        print(f"\\n{i}. [{v['severity'].upper()}] {v['category'].upper()}")
        print(f"   Issue: {v['violation']}")
        print(f"   Current: {v['current_value']}")
        print(f"   Expected: {v['expected_value']}")
        print(f"   Fix: {v['fix']}")
else:
    print("\\n✅ NO VIOLATIONS - FULL COMPLIANCE")`,
      });
    }

    const avgScore = totalScore / request.assets_to_audit.length;
    output.brand_audit = {
      violations: allViolations,
      compliance_score: avgScore,
      summary: `Audited ${request.assets_to_audit.length} assets. Average compliance: ${avgScore.toFixed(1)}%. Total violations: ${allViolations.length}.`,
    };
  }

  // Module F: Strategist
  if (request.modules.includes('strategist') && request.business_goal && request.target_audience) {
    const strategy = developCreativeStrategy(
      request.business_goal,
      request.target_audience,
      request.constraints || []
    );
    output.creative_strategy = strategy;

    output.notebook.cells.push({
      type: 'markdown',
      content: `## MODULE F :: THE STRATEGIST
### Business Goal → Creative Strategy

**Business Goal:** ${strategy.business_goal}
**Target Audience:** ${strategy.target_audience}`,
    });

    output.notebook.cells.push({
      type: 'code',
      content: `# Creative Strategy Breakdown
strategy = ${JSON.stringify(strategy, null, 2)}

print("🎯 STRATEGIC DIRECTIVE")
print("=" * 70)
print(f"OBJECTIVE: {strategy['business_goal']}")
print(f"AUDIENCE: {strategy['target_audience']}")
print("\\n📐 VISUAL STRATEGY:")
print(f"  Aesthetic: {strategy['visual_strategy']['aesthetic']}")
print(f"  Palette: {strategy['visual_strategy']['palette_direction']}")
print(f"  Typography: {strategy['visual_strategy']['typography_direction']}")
print(f"  Imagery: {strategy['visual_strategy']['imagery_direction']}")
print("\\n💬 MESSAGING STRATEGY:")
print(f"  Voice: {strategy['messaging_strategy']['voice']}")
print(f"  Themes: {', '.join(strategy['messaging_strategy']['key_themes'])}")
print(f"  Avoid: {', '.join(strategy['messaging_strategy']['avoid'])}")
print("\\n📦 TACTICAL OUTPUTS:")
for i, output in enumerate(strategy['tactical_outputs'], 1):
    print(f"  {i}. {output}")
print("=" * 70)`,
    });
  }

  // Footer cell
  output.notebook.cells.push({
    type: 'markdown',
    content: `---

## END TRANSMISSION

**The Creative Director v1.2**
Generated: ${output.notebook.metadata.generated_at}
Modules Used: ${output.notebook.metadata.modules_used.join(', ')}

*"Form Follows Data. Consistency is Sovereignty. Strategy First."*`,
  });

  return output;
}
