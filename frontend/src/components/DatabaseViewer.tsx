import { useState, useEffect } from 'react';

type TConnection = {
  id: string;
  name: string;
  type: 'sqlite' | 'postgres';
  status: 'connected' | 'disconnected' | 'connecting';
  config: any;
};

type TQueryResult = {
  columns: string[];
  rows: any[][];
  error?: string;
  executionTime?: number;
};

function DatabaseViewer() {
  const [connections, setConnections] = useState<TConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [dbType, setDbType] = useState<'sqlite' | 'postgres'>('sqlite');
  const [connectionName, setConnectionName] = useState('');
  const [connectionConfig, setConnectionConfig] = useState<Record<string, any>>({});
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState<TQueryResult | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      loadTables();
    }
  }, [selectedConnection]);

  function loadConnections() {
    fetch('/api/connections')
      .then(res => res.json())
      .then(data => setConnections(data))
      .catch(err => console.error('Failed to load connections:', err));
  }

  function loadTables() {
    if (!selectedConnection) return;
    
    fetch(`/api/connections/${selectedConnection}/tables`)
      .then(res => res.json())
      .then(data => setTables(data))
      .catch(err => console.error('Failed to load tables:', err));
  }

  function handleAddConnection() {
    if (!connectionName.trim()) {
      alert('Please enter a connection name');
      return;
    }

    const connectionData = {
      name: connectionName,
      type: dbType,
      config: connectionConfig
    };

    fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connectionData)
    })
    .then(res => res.json())
    .then(() => {
      loadConnections();
      setConnectionName('');
      setConnectionConfig({});
    })
    .catch(err => console.error('Failed to add connection:', err));
  }

  function handleExecuteQuery() {
    if (!selectedConnection) {
      alert('Please select a connection');
      return;
    }

    if (!query.trim()) {
      alert('Please enter a query');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    fetch(`/api/connections/${selectedConnection}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    .then(res => res.json())
    .then(data => {
      const executionTime = Date.now() - startTime;
      setQueryResults({ ...data, executionTime });
    })
    .catch(err => {
      setQueryResults({ columns: [], rows: [], error: err.message });
    })
    .finally(() => setIsLoading(false));
  }

  function handleTableClick(tableName: string) {
    setQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
  }

  function renderConnectionConfig() {
    if (dbType === 'sqlite') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database File Path
          </label>
          <input
            type="text"
            value={connectionConfig.path || ''}
            onChange={(e) => setConnectionConfig({ path: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="/path/to/database.db"
          />
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host
            </label>
            <input
              type="text"
              value={connectionConfig.host || ''}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, host: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="localhost"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port
            </label>
            <input
              type="number"
              value={connectionConfig.port || ''}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, port: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="5432"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Database
            </label>
            <input
              type="text"
              value={connectionConfig.database || ''}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, database: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="mydb"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={connectionConfig.username || ''}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, username: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="postgres"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={connectionConfig.password || ''}
              onChange={(e) => setConnectionConfig(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="password"
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Database Viewer</h1>
        
        {/* Connection Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Database Connections</h2>
          
          {/* Add Connection Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Type
              </label>
              <select
                value={dbType}
                onChange={(e) => setDbType(e.target.value as 'sqlite' | 'postgres')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="sqlite">SQLite</option>
                <option value="postgres">PostgreSQL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Name
              </label>
              <input
                type="text"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="My Database"
              />
            </div>
          </div>
          
          <div className="mb-4">
            {renderConnectionConfig()}
          </div>
          
          <button
            onClick={handleAddConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Add Connection
          </button>
          
          {/* Active Connections */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Active Connections</h3>
            <div className="space-y-2">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <span className="font-medium">{conn.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({conn.type})</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${{
                      connected: 'bg-green-100 text-green-800',
                      disconnected: 'bg-red-100 text-red-800',
                      connecting: 'bg-yellow-100 text-yellow-800'
                    }[conn.status]}`}
                  >
                    {conn.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Query Interface */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Query Editor</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Connection
            </label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a connection...</option>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SQL Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono"
              placeholder="SELECT * FROM users;"
            />
          </div>
          
          <button
            onClick={handleExecuteQuery}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
          >
            {isLoading ? 'Executing...' : 'Execute Query'}
          </button>
          
          {/* Tables Browser */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Tables</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tables.map((table) => (
                <button
                  key={table}
                  onClick={() => handleTableClick(table)}
                  className="p-2 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-md text-sm"
                >
                  {table}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Query Results</h2>
          <div className="overflow-x-auto">
            {queryResults?.error ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-md">
                <strong>Error:</strong> {queryResults.error}
              </div>
            ) : queryResults?.columns ? (
              <div>
                <div className="mb-2 text-sm text-gray-600">
                  {queryResults.rows.length} rows returned
                  {queryResults.executionTime && ` in ${queryResults.executionTime}ms`}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {queryResults.columns.map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queryResults.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {cell === null ? (
                              <span className="text-gray-400 italic">NULL</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Execute a query to see results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseViewer;
