export const CONFIG = {
  APP_NAME: 'Atlas Induct 360',
  COMPANY: 'Atlas Labs',
  CLIENT: 'Colab Warehouse',
  PANO: {
    SRC: 'https://pannellum.org/images/alma.jpg', // TEMP placeholder until Amin supplies a warehouse equirect 2:1 pano
    TYPE: 'equirectangular',
    INITIAL_YAW: 0,
    INITIAL_PITCH: 0,
    INITIAL_HFOV: 100,
  },
  HOTSPOTS: [
    { id: 'forklift', label: 'Forklift zone', yaw: -30, pitch: -5, hazard: 'Forklifts move fast here. They cannot stop quickly.', fix: 'Stay on the walkway. Wait until the driver sees you. Never walk behind a forklift.', roleTag: 'all', active: true },
    { id: 'ppe', label: 'PPE rack', yaw: 40, pitch: 0, hazard: 'No hi-vis vest means drivers cannot see you. No boots means foot injuries.', fix: 'Take a vest, boots, and gloves before you enter the floor. Check they are not torn.', roleTag: 'all', active: true },
    { id: 'exit', label: 'Fire exit', yaw: 120, pitch: -2, hazard: 'Boxes or pallets can block the exit door.', fix: 'Keep the exit clear. Know your nearest exit. Tell a manager about any blocked door.', roleTag: 'all', active: true },
    { id: 'manual', label: 'Manual handling bay', yaw: -110, pitch: -4, hazard: 'Heavy boxes here cause back injuries when lifted wrong.', fix: 'Bend your knees, keep the load close, and ask for help over 20kg.', roleTag: 'picker', active: true },
    { id: 'spill', label: 'Spill point', yaw: 170, pitch: -6, hazard: 'Liquid on the floor causes slips near the packing benches.', fix: 'Warn others first, mark the area, then tell a manager at once.', roleTag: 'picker', active: true },
  ],
  PASS_MARK_PERCENT: 70,
  STORAGE_KEY: 'atlas-induct-360-v1',
} as const

export type Hotspot = (typeof CONFIG.HOTSPOTS)[number]
export type ManagerRecord = { name: string; score: number; date: string; passed: boolean; learner?: boolean }
export type DemoState = { learnerName: string; viewedHotspots: string[]; attempts: number; lastScore: number | null; passed: boolean; completedAt: string | null; records: ManagerRecord[] }

export const SEED_RECORDS: ManagerRecord[] = [
  { name: 'Aarav Sharma', score: 100, date: '2026-09-19', passed: true },
  { name: 'Maya Chen', score: 67, date: '2026-09-18', passed: false },
  { name: 'Bikash Rai', score: 100, date: '2026-09-17', passed: true },
  { name: 'Sofia Williams', score: 33, date: '2026-09-16', passed: false },
  { name: 'Nima Gurung', score: 100, date: '2026-09-15', passed: true },
  { name: 'Lucas Martin', score: 67, date: '2026-09-14', passed: false },
]

export const initialState = (): DemoState => ({ learnerName: '', viewedHotspots: [], attempts: 0, lastScore: null, passed: false, completedAt: null, records: SEED_RECORDS })

export function formatDate(date: string) { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date)) }
export function formatLongDate(date: string) { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date)) }

export const QUIZ = [
  { question: 'Where must you walk near forklifts?', answer: 'On the marked walkway.', options: ['Between the pallets.', 'On the marked walkway.', 'Behind the forklift.', 'Anywhere you can see.'], reason: 'The marked walkway keeps people away from moving vehicles.', hotspot: 'forklift' },
  { question: 'What must you wear before you enter the floor?', answer: 'Hi-vis vest, safety boots, and gloves.', options: ['A cap and trainers.', 'Hi-vis vest, safety boots, and gloves.', 'A coat only.', 'No special clothing.'], reason: 'These items help protect you and help drivers see you.', hotspot: 'ppe' },
  { question: 'What do you do if a fire exit is blocked?', answer: 'Tell a manager now.', options: ['Move the boxes alone.', 'Use the blocked exit.', 'Tell a manager now.', 'Ignore it.'], reason: 'A manager must clear the exit so everyone can leave safely.', hotspot: 'exit' },
  { question: 'A box feels over 20kg. How do you lift it?', answer: 'Bend knees, load close, ask for help.', options: ['Bend your back and jerk it up.', 'Bend knees, load close, ask for help.', 'Drag it across the floor.', 'Get a forklift to lift it.'], reason: 'Knees bent and load close protects your back. Heavy loads need two people.', hotspot: 'manual' },
  { question: 'You see a spill on the floor. What do you do first?', answer: 'Warn others, then tell a manager.', options: ['Walk around it.', 'Warn others, then tell a manager.', 'Wipe it with paper towels.', 'Wait for someone else.'], reason: 'Others can slip before it gets cleaned.', hotspot: 'spill' },
] as const
] as const

export const OPEN_QUESTION = {
  hotspot: 'exit',
  prompt: 'In your own words: you find boxes blocking your nearest fire exit. What do you do?',
  modelAnswer: 'Keep clear of the blocked exit, use your nearest open exit if needed, and tell a manager at once so it is cleared.',
} as const

export type StoreAction = Partial<DemoState> | { type: 'viewHotspot'; id: string } | { type: 'pass'; score: number }
export function reduceState(state: DemoState, action: StoreAction): DemoState {
  if ('type' in action && action.type === 'viewHotspot') return { ...state, viewedHotspots: Array.from(new Set([...state.viewedHotspots, action.id])) }
  if ('type' in action && action.type === 'pass') { const date = new Date().toISOString(); const record = { name: state.learnerName, score: action.score, date, passed: true, learner: true }; return { ...state, lastScore: action.score, passed: true, completedAt: date, attempts: state.attempts + 1, records: [...state.records.filter((r) => !(r.learner && r.name === state.learnerName)), record] } }
  return { ...state, ...action }
}

export function useDemoStore() {
  throw new Error('Use DemoStoreProvider and useDemoStoreContext in client components')
}
