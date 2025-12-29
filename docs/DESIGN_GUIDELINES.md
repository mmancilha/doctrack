# DocTrack Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Motion Primitives (micro-interactions), DocuSign CLM (professional UX), shadcn/ui (component aesthetics), and Notion (editing experience).

## Core Design Principles
- **Clean Light Mode**: Professional, distraction-free interface optimized for extended document work
- **Fluid Micro-interactions**: Every action should have subtle, satisfying visual feedback
- **Responsive Excellence**: Seamless adaptation across mobile, tablet, and desktop
- **Performance-First**: Instant responses and smooth 60fps animations

## Typography System
- **Headings**: Modern sans-serif with clear hierarchy (h1: 2xl-3xl, h2: xl-2xl, h3: lg-xl)
- **Body Text**: Readable sans-serif optimized for long-form reading (base to lg)
- **Editor Content**: Slightly larger (lg) for comfortable document editing
- **Monospace**: For code snippets and technical content

## Layout System
**Spacing**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm

**Structure**:
- Collapsible sidebar (w-64 expanded, w-16 collapsed) with smooth transitions
- Main content area with max-w-6xl for optimal reading
- Dashboard grid: 2-3 columns on desktop, single column on mobile
- Editor: Centered max-w-4xl for focused writing experience

## Component Library

**Navigation**:
- Minimalist sidebar with icon-only collapsed state
- Smooth expand/collapse animation (300ms ease)
- Active state indicators with subtle background and accent border

**Dashboard Cards**:
- Elevated cards with subtle shadows (shadow-sm hover:shadow-md)
- Status indicators with colored dots
- Quick action buttons revealed on hover
- Document preview snippets

**Editor Interface**:
- Floating toolbar with formatting options (sticky on scroll)
- Clean editing canvas with generous padding
- Inline formatting controls that appear on text selection
- Side panel for version history and comments

**Version Control**:
- Timeline sidebar showing all versions with timestamps and authors
- Visual diff view with green highlights (additions) and red strikethroughs (deletions)
- Side-by-side comparison option for detailed review

**Modals & Overlays**:
- Smooth fade-in with backdrop blur
- Slide-up animation for mobile
- Command palette (Cmd+K) with instant search results

**Buttons**:
- Primary: Blurple accent with subtle glow on hover
- Secondary: Soft gray with border
- Ghost: Minimal with hover background
- All buttons include micro-feedback (scale, shadow changes)

**Forms & Inputs**:
- Clean borders with focus ring animations
- Inline validation with smooth error messages
- Autocomplete suggestions with keyboard navigation

## Visual Treatment
**Color Palette**:
- Base: Whites and soft grays (gray-50 to gray-200)
- Accent: Purple/blue blurple for primary actions
- Success: Soft green for additions/confirmations
- Warning: Soft amber for caution states
- Error: Soft red for deletions/errors

**Shadows & Depth**:
- Subtle elevation with shadow-sm for cards at rest
- shadow-md on hover for interactive elements
- shadow-lg for modals and overlays

## Animations & Transitions
**Micro-interactions** (inspired by Motion Primitives):
- Button press: Subtle scale (0.98) with spring physics
- Card hover: Gentle lift (translateY(-2px))
- Page transitions: Smooth fade with slight slide
- Loading states: Skeleton screens with shimmer effect
- Toast notifications: Slide-in from top-right

**Performance Rules**:
- Use transform and opacity for animations (GPU accelerated)
- Keep animations under 300ms for UI feedback
- Disable animations on reduced-motion preference

## Images
**Company Logo**: Place in sidebar header and PDF exports (small, monochrome variant)
**No hero images**: This is an internal productivity tool - focus on clean, functional interface

## Accessibility
- Keyboard navigation throughout (Tab, Enter, Escape, Cmd+K)
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Semantic HTML structure
- Color contrast ratios meeting WCAG AA standards