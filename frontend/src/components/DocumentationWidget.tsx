import React, { useState, useEffect, useRef } from 'react';

type THelpContent = {
  title: string;
  content: string;
};

type TProps = {
  // Add props here when needed
};

const helpContent: Record<string, THelpContent> = {
  'connections': {
    title: 'Connections',
    content: `
      <h5>Managing Database Connections</h5>
      <p>Learn how to set up and manage your database connections securely.</p>
      <ul>
        <li>Add new database connections</li>
        <li>Test connection health</li>
        <li>Manage connection pools</li>
        <li>Configure SSL/TLS settings</li>
      </ul>
      <p>Click the "+" button in the connections panel to add a new connection. You'll need to provide connection details like host, port, username, and password.</p>
    `
  },
  'query-editor': {
    title: 'Query Editor',
    content: `
      <h5>Writing and Executing Queries</h5>
      <p>The query editor provides a powerful interface for writing and running SQL queries.</p>
      <ul>
        <li>Syntax highlighting for SQL</li>
        <li>Auto-completion and suggestions</li>
        <li>Query history and favorites</li>
        <li>Export results to various formats</li>
      </ul>
      <p>Use <strong>Ctrl+Enter</strong> to execute your query. Results will appear in the panel below.</p>
    `
  },
  'data-sources': {
    title: 'Data Sources',
    content: `
      <h5>Configuring Data Sources</h5>
      <p>Connect to various types of databases and data sources.</p>
      <ul>
        <li>PostgreSQL, MySQL, SQLite</li>
        <li>MongoDB, Redis</li>
        <li>API endpoints and webhooks</li>
        <li>File uploads (CSV, JSON)</li>
      </ul>
      <p>Each data source type has specific configuration requirements. Refer to the connection wizard for detailed setup instructions.</p>
    `
  },
  'visualizations': {
    title: 'Visualizations',
    content: `
      <h5>Creating Charts and Graphs</h5>
      <p>Transform your query results into meaningful visualizations.</p>
      <ul>
        <li>Bar charts, line graphs, pie charts</li>
        <li>Scatter plots and heat maps</li>
        <li>Custom styling and themes</li>
        <li>Interactive filtering options</li>
      </ul>
      <p>Select data columns and choose a visualization type to get started. You can customize colors, labels, and other styling options.</p>
    `
  },
  'dashboards': {
    title: 'Dashboards',
    content: `
      <h5>Building Interactive Dashboards</h5>
      <p>Combine multiple visualizations into comprehensive dashboards.</p>
      <ul>
        <li>Drag-and-drop dashboard builder</li>
        <li>Real-time data updates</li>
        <li>Responsive layouts</li>
        <li>Share and collaborate</li>
      </ul>
      <p>Create a new dashboard and add widgets by dragging visualizations from your library. Resize and arrange them as needed.</p>
    `
  },
  'user-management': {
    title: 'User Management',
    content: `
      <h5>Managing Users and Permissions</h5>
      <p>Control access to your data and dashboards with user management features.</p>
      <ul>
        <li>Create and manage user accounts</li>
        <li>Role-based access control</li>
        <li>Team collaboration features</li>
        <li>Audit logs and activity tracking</li>
      </ul>
      <p>Admin users can invite new team members and assign appropriate roles and permissions.</p>
    `
  },
  'settings': {
    title: 'Settings',
    content: `
      <h5>Application Settings</h5>
      <p>Configure global settings and preferences for your application.</p>
      <ul>
        <li>Theme and appearance settings</li>
        <li>Default query timeout values</li>
        <li>Security and privacy options</li>
        <li>Email notifications</li>
      </ul>
      <p>Access settings through the gear icon in the top navigation bar.</p>
    `
  },
  'api-reference': {
    title: 'API Reference',
    content: `
      <h5>API Documentation</h5>
      <p>Integrate with external applications using our REST API.</p>
      <ul>
        <li>Authentication and API keys</li>
        <li>Query execution endpoints</li>
        <li>Dashboard sharing APIs</li>
        <li>Webhook configurations</li>
      </ul>
      <p>Generate API keys from your user profile settings. All API requests require authentication.</p>
    `
  }
};

function DocumentationWidget(props: TProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isSidePanelVisible, setIsSidePanelVisible] = useState(false);
  
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (isSidePanelVisible) {
          hideSidePanel();
        } else if (isOpen) {
          closeHelpWidget();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, isSidePanelVisible]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        closeHelpWidget();
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      function handleTabKey(event: KeyboardEvent) {
        if (event.key === 'Tab' && dialogRef.current) {
          const focusableElements = dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
            }
          }
        }
      }

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen, isSidePanelVisible]);

  function toggleHelpWidget() {
    if (isOpen) {
      closeHelpWidget();
    } else {
      setIsOpen(true);
    }
  }

  function closeHelpWidget() {
    setIsOpen(false);
    setIsSidePanelVisible(false);
    setSelectedSection(null);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }

  function showSidePanel(sectionKey: string) {
    setSelectedSection(sectionKey);
    setIsSidePanelVisible(true);
  }

  function hideSidePanel() {
    setIsSidePanelVisible(false);
    setSelectedSection(null);
  }

  const sections = [
    { key: 'connections', label: 'Connections' },
    { key: 'query-editor', label: 'Query editor' },
    { key: 'data-sources', label: 'Data sources' },
    { key: 'visualizations', label: 'Visualizations' },
    { key: 'dashboards', label: 'Dashboards' },
    { key: 'user-management', label: 'User management' },
    { key: 'settings', label: 'Settings' },
    { key: 'api-reference', label: 'API Reference' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '64px',
      right: '64px',
      zIndex: 1000
    }}>
      <button 
        ref={triggerRef}
        onClick={toggleHelpWidget}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? 'Close help dialog' : 'Open help dialog'}
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#007bff',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3), 0 2px 8px rgba(0, 123, 255, 0.2)',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4), 0 4px 12px rgba(0, 123, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3), 0 2px 8px rgba(0, 123, 255, 0.2)';
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid #007bff';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
        </svg>
      </button>
      
      <div 
        ref={dialogRef}
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? 'true' : undefined}
        aria-labelledby="helpTitle"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '320px',
          height: '420px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0)',
          transformOrigin: 'bottom right',
          transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
          pointerEvents: isOpen ? 'auto' : 'none',
          overflow: 'hidden'
        }}
      >
        {isOpen && (
          <>
            <div style={{
              padding: '20px 20px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e9ecef',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <h3 id="helpTitle" style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#212529',
                margin: 0
              }}>
                Documentation
              </h3>
              <button 
                onClick={closeHelpWidget}
                aria-label="Close help dialog"
                style={{
                  width: '24px',
                  height: '24px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.color = '#495057';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6c757d';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div style={{
              position: 'relative',
              height: 'calc(100% - 72px)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                overflowY: 'auto',
                padding: '0 20px 20px',
                transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                transform: isSidePanelVisible ? 'translateX(-100%)' : 'translateX(0)'
              }}>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0
                }}>
                  {sections.map((section) => (
                    <li key={section.key} style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #f1f3f4',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.margin = '0 -12px';
                      e.currentTarget.style.paddingLeft = '12px';
                      e.currentTarget.style.paddingRight = '12px';
                      e.currentTarget.style.borderRadius = '8px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.margin = '0';
                      e.currentTarget.style.paddingLeft = '0';
                      e.currentTarget.style.paddingRight = '0';
                      e.currentTarget.style.borderRadius = '0';
                    }}
                    onClick={() => showSidePanel(section.key)}
                    >
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#495057'
                      }}>
                        {section.label}
                      </span>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{
                        color: '#6c757d',
                        transition: 'transform 0.2s ease'
                      }}>
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </li>
                  ))}
                </ul>
              </div>
              
              {selectedSection && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'white',
                  transform: isSidePanelVisible ? 'translateX(0)' : 'translateX(100%)',
                  transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                  padding: '20px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    <button
                      onClick={hideSidePanel}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6c757d',
                        marginRight: '12px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.color = '#495057';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6c757d';
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 7l-5 5 5 5V7z"/>
                      </svg>
                    </button>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#212529',
                      margin: 0
                    }}>
                      {helpContent[selectedSection].title}
                    </h4>
                  </div>
                  <div 
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.5,
                      color: '#495057'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: helpContent[selectedSection].content
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DocumentationWidget;
