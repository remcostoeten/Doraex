// Main View
export { MainView } from './views/main-view'

// Views
export { default as TableView } from './views/table-view'
export { default as QueryView } from './views/query-views'
export { default as MessagesView } from './views/messages-views'

// Components
export { default as TabSystem } from './components/tab-system'
export { default as TabBar } from './components/tab-bar'
export { default as DataTable } from './components/data-table'
export { default as FilterBar } from './components/filter-bar'
export { default as Sidebar } from './components/sidebar'

// Hooks
export { useTabs } from './hooks/use-tabs'

// Utils
export { createTableTab, createQueryTab, createMessagesTab } from './utils/tab-factory'

// Types
export type { Tab, TableData, QueryData } from './types/types'

// Demo
export { default as UIExampleDemo } from './demo'
