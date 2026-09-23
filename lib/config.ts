export const CONFIG = {
  APP_NAME: 'Atlas Induct 360',
  COMPANY: 'Atlas Labs',
  CLIENT: 'Colab Warehouse',
  PANO: {
    SRC: '/warehouse-panorama.png',
    TYPE: 'equirectangular',
    INITIAL_YAW: 0,
    INITIAL_PITCH: 0,
    INITIAL_HFOV: 100,
  },
  HOTSPOTS: [
    { id: 'forklift', label: 'Forklift zone', yaw: -30, pitch: -5, hazard: 'Forklifts move fast here. They cannot stop quickly.', fix: 'Stay on the walkway. Wait until the driver sees you. Never walk behind a forklift.' },
    { id: 'ppe', label: 'PPE rack', yaw: 40, pitch: 0, hazard: 'No hi-vis vest means drivers cannot see you. No boots means foot injuries.', fix: 'Take a vest, boots, and gloves before you enter the floor. Check they are not torn.' },
    { id: 'exit', label: 'Fire exit', yaw: 120, pitch: -2, hazard: 'Boxes or pallets can block the exit door.', fix: 'Keep the exit clear. Know your nearest exit. Tell a manager about any blocked door.' },
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
  { question: 'Where must you walk near forklifts?', answer: 'On the marked walkway.', options: ['Between the pallets.', 'On the marked walkway.', 'Behind the forklift.', 'Anywhere you can see.'], reason: 'The marked walkway keeps people away from moving vehicles.' },
  { question: 'What must you wear before you enter the floor?', answer: 'Hi-vis vest, safety boots, and gloves.', options: ['A cap and trainers.', 'Hi-vis vest, safety boots, and gloves.', 'A coat only.', 'No special clothing.'], reason: 'These items help protect you and help drivers see you.' },
  { question: 'What do you do if a fire exit is blocked?', answer: 'Tell a manager now.', options: ['Move the boxes alone.', 'Use the blocked exit.', 'Tell a manager now.', 'Ignore it.'], reason: 'A manager must clear the exit so everyone can leave safely.' },
] as const

export type StoreAction = Partial<DemoState> | { type: 'viewHotspot'; id: string } | { type: 'pass'; score: number }
export function reduceState(state: DemoState, action: StoreAction): DemoState {
  if ('type' in action && action.type === 'viewHotspot') return { ...state, viewedHotspots: Array.from(new Set([...state.viewedHotspots, action.id])) }
  if ('type' in action && action.type === 'pass') { const date = new Date().toISOString(); const record = { name: state.learnerName, score: action.score, date, passed: true, learner: true }; return { ...state, lastScore: action.score, passed: true, completedAt: date, attempts: state.attempts + 1, records: [...state.records.filter((r) => !(r.learner && r.name === state.learnerName)), record] } }
  return { ...state, ...action }
}

export function useDemoStore() {
  throw new Error('Use DemoStoreProvider and useDemoStoreContext in client components')
}
