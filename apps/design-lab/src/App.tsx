import { Flame, Hand, Lock, MoonStar, Mountain, Search, Shield, Sparkles } from 'lucide-react'
import {
  Badge,
  Button,
  Surface,
  componentFamilies,
  designPrinciples,
  palette,
} from '@cavebook/ui'
import './app.css'

export function App() {
  return (
    <div className="cb-page">
      <div className="cb-ambient cb-ambient--left" />
      <div className="cb-ambient cb-ambient--right" />

      <header className="lab-masthead cb-frame">
        <div className="lab-masthead__glyphs">
          <Badge icon={<Hand size={14} />}>Cavebook OS</Badge>
          <Badge variant="stone" icon={<Flame size={14} />}>
            Sacred Fire Online
          </Badge>
        </div>
        <div className="lab-masthead__title-wrap">
          <p className="cb-eyebrow">Design language for React apps</p>
          <h1 className="cb-display">Cavebook framework</h1>
          <p className="cb-copy">
            Shared tokens, materials, and interaction primitives for products that
            feel carved from parchment, stone, soot, and ember.
          </p>
        </div>
        <div className="lab-masthead__actions">
          <Button variant="utility" size="icon" aria-label="Search">
            <Search size={18} />
          </Button>
          <Button variant="utility" size="icon" aria-label="Moon">
            <MoonStar size={18} />
          </Button>
        </div>
      </header>

      <main className="lab-grid">
        <aside className="lab-stack">
          <Surface variant="stone">
            <p className="cb-section-kicker">Principles</p>
            <div className="lab-stack">
              {designPrinciples.map((principle) => (
                <div key={principle.name}>
                  <p className="lab-name">{principle.name}</p>
                  <p className="cb-copy">{principle.description}</p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface>
            <p className="cb-section-kicker">Component families</p>
            <div className="lab-stack">
              {componentFamilies.map((family) => (
                <div key={family.name} className="lab-row">
                  <div>
                    <p className="lab-name">{family.name}</p>
                    <p className="cb-copy">{family.description}</p>
                  </div>
                  <Badge variant={family.badgeVariant}>{family.scale}</Badge>
                </div>
              ))}
            </div>
          </Surface>
        </aside>

        <section className="lab-stack">
          <Surface>
            <p className="cb-section-kicker">Palette</p>
            <div className="lab-palette">
              {palette.map((swatch) => (
                <div key={swatch.name} className="lab-swatch">
                  <div className="lab-swatch__chip" style={{ background: swatch.value }} />
                  <div>
                    <p className="lab-name">{swatch.name}</p>
                    <p className="cb-copy">{swatch.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface>
            <p className="cb-section-kicker">Standards</p>
            <div className="lab-chip-row">
              <Badge icon={<Sparkles size={14} />}>Typed React primitives</Badge>
              <Badge variant="stone" icon={<Mountain size={14} />}>
                Shared CSS tokens
              </Badge>
              <Badge variant="ember" icon={<Lock size={14} />}>
                Storybook-ready package
              </Badge>
            </div>
            <div className="lab-button-row">
              <Button>
                <Shield size={18} />
                Primary action
              </Button>
              <Button variant="ghost">
                <Mountain size={18} />
                Ghost action
              </Button>
              <Button variant="utility">
                <Search size={18} />
                Utility action
              </Button>
            </div>
          </Surface>
        </section>
      </main>
    </div>
  )
}
