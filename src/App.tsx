import { useEffect, useMemo, useState } from 'react'
import { EXAMPLE_GROUPS, VALUES } from './values'

const MAX_GROUPS = 5
const GROUP_COLORS = ['#e07a5f', '#3d7dd8', '#5a9e7c', '#e0a030', '#8e5bd6']
const STORAGE_KEY = 'values-exercise-v1'

type Group = { id: string; values: string[]; label: string | null }
type Step = 'intro' | 'pick' | 'group' | 'label' | 'results'
type State = { step: Step; selected: string[]; custom: string[]; groups: Group[]; active: number }

const INITIAL: State = { step: 'intro', selected: [], custom: [], groups: [], active: 0 }
const STEPS: Step[] = ['pick', 'group', 'label']

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...INITIAL, ...JSON.parse(raw) }
  } catch {
    /* ignore corrupt storage */
  }
  return INITIAL
}

const newGroup = (): Group => ({ id: Math.random().toString(36).slice(2), values: [], label: null })
const tap = () => navigator.vibrate?.(8)

export default function App() {
  const [state, setState] = useState<State>(loadState)
  const update = (fn: (s: State) => State) => setState((s) => fn(s))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.step])

  const go = (step: Step) =>
    update((s) => {
      if (step === 'group' && s.groups.length === 0) return { ...s, step, groups: [newGroup()], active: 0 }
      if (step === 'label' || step === 'results') {
        const groups = s.groups
          .filter((g) => g.values.length > 0)
          .map((g) => ({ ...g, label: g.label && g.values.includes(g.label) ? g.label : g.values.length === 1 ? g.values[0] : null }))
        return { ...s, step, groups, active: Math.min(s.active, Math.max(groups.length - 1, 0)) }
      }
      return { ...s, step }
    })

  const back = () => {
    const order: Step[] = ['intro', 'pick', 'group', 'label', 'results']
    go(order[Math.max(order.indexOf(state.step) - 1, 0)])
  }

  return (
    <div className="app">
      {state.step !== 'intro' && (
        <header className="topbar">
          <button className="icon-btn" onClick={back} aria-label="Back">
            ‹
          </button>
          <div className="progress">
            {STEPS.map((s, i) => (
              <span key={s} className={`dot ${STEPS.indexOf(state.step) >= i || state.step === 'results' ? 'on' : ''}`} />
            ))}
          </div>
          <span className="icon-btn placeholder" />
        </header>
      )}
      {state.step === 'intro' && <Intro state={state} go={go} reset={() => setState({ ...INITIAL, step: 'pick' })} />}
      {state.step === 'pick' && <Pick state={state} update={update} next={() => go('group')} />}
      {state.step === 'group' && <GroupStep state={state} update={update} next={() => go('label')} />}
      {state.step === 'label' && <LabelStep state={state} update={update} next={() => go('results')} />}
      {state.step === 'results' && <Results state={state} go={go} reset={() => setState(INITIAL)} />}
    </div>
  )
}

type StepProps = { state: State; update: (fn: (s: State) => State) => void; next: () => void }

function Intro({ state, go, reset }: { state: State; go: (s: Step) => void; reset: () => void }) {
  const inProgress = state.selected.length > 0
  return (
    <main className="intro">
      <div className="hero">
        <div className="logo">♥</div>
        <h1>Find your core values</h1>
        <p className="lead">Three quick steps. No right or wrong answers.</p>
      </div>
      <ol className="steps-list">
        <li>
          <b>Pick</b> every value that resonates with you.
        </li>
        <li>
          <b>Group</b> similar values together, up to five groups.
        </li>
        <li>
          <b>Label</b> each group with the one word that sums it up.
        </li>
      </ol>
      <div className="intro-actions">
        {inProgress ? (
          <>
            <button className="btn primary" onClick={() => go(state.groups.some((g) => g.values.length) ? 'group' : 'pick')}>
              Continue where you left off
            </button>
            <button className="btn ghost" onClick={reset}>
              Start fresh
            </button>
          </>
        ) : (
          <button className="btn primary" onClick={() => go('pick')}>
            Start
          </button>
        )}
      </div>
      <p className="credit">
        Adapted from the{' '}
        <a href="https://web.archive.org/web/20180904200552/http://www.taproot.com/archives/37771" target="_blank" rel="noreferrer">
          Taproot values exercise
        </a>
        . Your answers stay on this device.
      </p>
    </main>
  )
}

function Pick({ state, update, next }: StepProps) {
  const [query, setQuery] = useState('')
  const [onlySelected, setOnlySelected] = useState(false)
  const all = useMemo(() => [...new Set([...VALUES, ...state.custom])].sort((a, b) => a.localeCompare(b)), [state.custom])
  const q = query.trim()
  const shown = all.filter(
    (v) => v.toLowerCase().includes(q.toLowerCase()) && (!onlySelected || state.selected.includes(v)),
  )
  const exact = all.find((v) => v.toLowerCase() === q.toLowerCase())

  const toggle = (v: string) => {
    tap()
    update((s) => {
      const on = s.selected.includes(v)
      return {
        ...s,
        selected: on ? s.selected.filter((x) => x !== v) : [...s.selected, v],
        groups: on ? s.groups.map((g) => ({ ...g, values: g.values.filter((x) => x !== v), label: g.label === v ? null : g.label })) : s.groups,
      }
    })
  }

  const addCustom = () => {
    if (!q) return
    if (exact) {
      if (!state.selected.includes(exact)) toggle(exact)
    } else {
      tap()
      update((s) => ({ ...s, custom: [...s.custom, q], selected: [...s.selected, q] }))
    }
    setQuery('')
  }

  return (
    <>
      <main className="content">
        <p className="eyebrow">Step 1 of 3</p>
        <h2>Tap every value that feels like you</h2>
        <p className="hint">Don't overthink it. Missing one? Type it and add your own.</p>
        <div className="search">
          <input
            type="search"
            placeholder="Search or add a value…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            enterKeyHint="done"
          />
          <button className={`chip small ${onlySelected ? 'on' : ''}`} onClick={() => setOnlySelected((x) => !x)}>
            {onlySelected ? 'Show all' : 'Selected'}
          </button>
        </div>
        <div className="chips">
          {q && !exact && (
            <button className="chip add" onClick={addCustom}>
              + Add “{q}”
            </button>
          )}
          {shown.map((v) => (
            <button key={v} className={`chip ${state.selected.includes(v) ? 'on' : ''}`} onClick={() => toggle(v)}>
              {v}
            </button>
          ))}
          {shown.length === 0 && !q && <p className="empty">Nothing selected yet.</p>}
        </div>
      </main>
      <footer className="bottombar">
        <span className="count">
          <b>{state.selected.length}</b> selected
        </span>
        <button className="btn primary" disabled={state.selected.length === 0} onClick={next}>
          Next: Group
        </button>
      </footer>
    </>
  )
}

function GroupStep({ state, update, next }: StepProps) {
  const [hideGrouped, setHideGrouped] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [showUngroupedPrompt, setShowUngroupedPrompt] = useState(false)
  const groupOf = (v: string) => state.groups.findIndex((g) => g.values.includes(v))
  const ungrouped = state.selected.filter((v) => groupOf(v) === -1)
  const shown = hideGrouped ? ungrouped : state.selected
  const activeGroup = state.groups[state.active]
  const hasGrouped = state.groups.some((g) => g.values.length > 0)

  const assign = (v: string) => {
    tap()
    update((s) => {
      const target = s.groups[s.active]
      if (!target) return s
      const inTarget = target.values.includes(v)
      return {
        ...s,
        groups: s.groups.map((g, i) => {
          if (i === s.active) return { ...g, values: inTarget ? g.values.filter((x) => x !== v) : [...g.values, v] }
          return g.values.includes(v) ? { ...g, values: g.values.filter((x) => x !== v) } : g
        }),
      }
    })
  }

  const addGroup = () => {
    tap()
    update((s) => (s.groups.length >= MAX_GROUPS ? s : { ...s, groups: [...s.groups, newGroup()], active: s.groups.length }))
  }

  const removeGroup = () =>
    update((s) => {
      const groups = s.groups.filter((_, i) => i !== s.active)
      return { ...s, groups: groups.length ? groups : [newGroup()], active: Math.max(0, s.active - 1) }
    })

  return (
    <>
      <main className="content">
        <p className="eyebrow">Step 2 of 3</p>
        <h2>Group similar values</h2>
        <p className="hint">
          Choose a group, then tap the values that belong in it. Up to {MAX_GROUPS} groups; anything left ungrouped gets dropped.{' '}
          <button className="link" onClick={() => setShowExample(true)}>
            See an example
          </button>
        </p>
        <div className="group-tabs">
          {state.groups.map((g, i) => (
            <button
              key={g.id}
              className={`group-tab ${i === state.active ? 'active' : ''}`}
              aria-label={`Group ${i + 1}`}
              style={{ '--c': GROUP_COLORS[i] } as React.CSSProperties}
              onClick={() => {
                tap()
                update((s) => ({ ...s, active: i }))
              }}
            >
              <span className="tab-num">{i + 1}</span>
              <span className="badge">{g.values.length}</span>
            </button>
          ))}
          {state.groups.length < MAX_GROUPS && (
            <button className="group-tab new" onClick={addGroup} aria-label="New group">
              +
            </button>
          )}
        </div>
        {activeGroup && (
          <div className="active-panel" style={{ '--c': GROUP_COLORS[state.active] } as React.CSSProperties}>
            <span>
              Adding to <b>Group {state.active + 1}</b>
              {activeGroup.values.length > 0 && <>: {activeGroup.values.join(', ')}</>}
            </span>
            {(activeGroup.values.length > 0 || state.groups.length > 1) && (
              <button className="link danger" onClick={removeGroup}>
                Delete
              </button>
            )}
          </div>
        )}
        <div className="toolbar">
          <span className="muted">{ungrouped.length} ungrouped</span>
          <button className={`chip small ${hideGrouped ? 'on' : ''}`} onClick={() => setHideGrouped((x) => !x)}>
            {hideGrouped ? 'Show all' : 'Hide grouped'}
          </button>
        </div>
        <div className="chips">
          {shown.map((v) => {
            const gi = groupOf(v)
            return (
              <button
                key={v}
                className={`chip ${gi >= 0 ? 'grouped' : ''} ${gi === state.active ? 'in-active' : ''}`}
                style={gi >= 0 ? ({ '--c': GROUP_COLORS[gi] } as React.CSSProperties) : undefined}
                onClick={() => assign(v)}
              >
                {gi >= 0 && <span className="gnum">{gi + 1}</span>}
                {v}
              </button>
            )
          })}
          {shown.length === 0 && <p className="empty">Everything is grouped. Nice.</p>}
        </div>
      </main>
      <footer className="bottombar">
        <span className="count">
          <b>{state.groups.filter((g) => g.values.length).length}</b> / {MAX_GROUPS} groups
        </span>
        <button className="btn primary" disabled={!hasGrouped} onClick={() => (ungrouped.length ? setShowUngroupedPrompt(true) : next())}>
          Next: Label
        </button>
      </footer>
      {showExample && <ExampleSheet close={() => setShowExample(false)} />}
      {showUngroupedPrompt && (
        <UngroupedSheet
          ungrouped={ungrouped}
          canAddGroup={state.groups.length < MAX_GROUPS || state.groups.some((g) => g.values.length === 0)}
          close={() => setShowUngroupedPrompt(false)}
          groupThem={() => {
            setShowUngroupedPrompt(false)
            setHideGrouped(true)
            update((s) => {
              const empty = s.groups.findIndex((g) => g.values.length === 0)
              if (empty >= 0) return { ...s, active: empty }
              if (s.groups.length >= MAX_GROUPS) return s
              return { ...s, groups: [...s.groups, newGroup()], active: s.groups.length }
            })
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          skip={() => {
            setShowUngroupedPrompt(false)
            next()
          }}
        />
      )}
    </>
  )
}

function LabelStep({ state, update, next }: StepProps) {
  const allLabeled = state.groups.every((g) => g.label)
  const setLabel = (gi: number, v: string) => {
    tap()
    update((s) => ({ ...s, groups: s.groups.map((g, i) => (i === gi ? { ...g, label: v } : g)) }))
  }
  return (
    <>
      <main className="content">
        <p className="eyebrow">Step 3 of 3</p>
        <h2>Pick a label for each group</h2>
        <p className="hint">Tap the one word that best represents the whole group.</p>
        <div className="group-cards">
          {state.groups.map((g, gi) => (
            <section key={g.id} className="group-card" style={{ '--c': GROUP_COLORS[gi] } as React.CSSProperties}>
              <header>
                <span className="gnum">{gi + 1}</span>
                {g.label ? <b>{g.label}</b> : <span className="muted">Tap a label</span>}
              </header>
              <div className="chips">
                {g.values.map((v) => (
                  <button key={v} className={`chip ${g.label === v ? 'label-on' : ''}`} onClick={() => setLabel(gi, v)}>
                    {v}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <footer className="bottombar">
        <span className="count">
          <b>{state.groups.filter((g) => g.label).length}</b> / {state.groups.length} labeled
        </span>
        <button className="btn primary" disabled={!allLabeled} onClick={next}>
          See my values
        </button>
      </footer>
    </>
  )
}

function Results({ state, go, reset }: { state: State; go: (s: Step) => void; reset: () => void }) {
  const [copied, setCopied] = useState(false)
  const text =
    'My core values\n\n' +
    state.groups.map((g, i) => `${i + 1}. ${g.label}\n   ${g.values.filter((v) => v !== g.label).join(', ')}`).join('\n\n')

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My core values', text })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <main className="content">
        <p className="eyebrow">Done</p>
        <h2>Your core values</h2>
        <ol className="results">
          {state.groups.map((g, i) => (
            <li key={g.id} style={{ '--c': GROUP_COLORS[i] } as React.CSSProperties}>
              <span className="big">{g.label}</span>
              <span className="members">{g.values.filter((v) => v !== g.label).join(' · ')}</span>
            </li>
          ))}
        </ol>
        <div className="result-actions">
          <button className="btn ghost" onClick={() => go('group')}>
            Edit groups
          </button>
          <button
            className="btn ghost danger"
            onClick={() => confirm('Start over? This clears your answers.') && reset()}
          >
            Start over
          </button>
        </div>
      </main>
      <footer className="bottombar">
        <button className="btn primary wide" onClick={share}>
          {copied ? 'Copied!' : 'Share / copy'}
        </button>
      </footer>
    </>
  )
}

function UngroupedSheet({
  ungrouped,
  canAddGroup,
  close,
  groupThem,
  skip,
}: {
  ungrouped: string[]
  canAddGroup: boolean
  close: () => void
  groupThem: () => void
  skip: () => void
}) {
  const n = ungrouped.length
  return (
    <div className="sheet-backdrop" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Ungrouped values">
        <div className="sheet-head">
          <h3>
            {n} value{n === 1 ? ' is' : 's are'} still ungrouped
          </h3>
          <button className="icon-btn" onClick={close} aria-label="Close">
            ×
          </button>
        </div>
        <div className="chips sheet-chips">
          {ungrouped.map((v) => (
            <span key={v} className="chip static">
              {v}
            </span>
          ))}
        </div>
        <p className="hint">
          {canAddGroup
            ? 'Start a new group and tap the ones that belong together, or skip and leave them out.'
            : "You're at 5 groups. Add them to an existing group, or skip and leave them out."}
        </p>
        <div className="sheet-actions">
          <button className="btn primary" onClick={groupThem}>
            {canAddGroup ? 'Make a new group' : 'Add to a group'}
          </button>
          <button className="btn ghost" onClick={skip}>
            Skip, leave {n === 1 ? 'it' : 'them'} out
          </button>
        </div>
      </div>
    </div>
  )
}

function ExampleSheet({ close }: { close: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Example">
        <div className="sheet-head">
          <h3>Example</h3>
          <button className="icon-btn" onClick={close} aria-label="Close">
            ×
          </button>
        </div>
        <p className="hint">Five groups, each with a bold label chosen from inside the group.</p>
        <div className="group-cards">
          {EXAMPLE_GROUPS.map((g, i) => (
            <section key={g.label} className="group-card" style={{ '--c': GROUP_COLORS[i] } as React.CSSProperties}>
              <header>
                <span className="gnum">{i + 1}</span>
                <b>{g.label}</b>
              </header>
              <p className="members">
                {g.values.map((v, j) => (
                  <span key={v}>
                    {v === g.label ? <b>{v}</b> : v}
                    {j < g.values.length - 1 && ', '}
                  </span>
                ))}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
