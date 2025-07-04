import React, { useState, useEffect, useRef } from 'react';
import styles from './HelpWidget.module.css';

type TFileItem = {
  title: string;
  type: 'frontend' | 'backend' | 'api';
  path: string;
  detail: string;
  link?: string;
};

type TProps = {
  // Add props here when needed
};

const PROJECT_FILES: TFileItem[] = [
  {
    title: 'HelpWidget Component',
    type: 'frontend',
    path: 'frontend/src/components/HelpWidget.tsx',
    detail: 'This interactive help widget component. Built with React, TypeScript, and CSS modules. Features hover tooltips and sliding detail panels with accessibility support.',
    link: '/frontend/src/components/HelpWidget.tsx'
  },
  {
    title: 'Database Server',
    type: 'backend',
    path: 'src/server.ts',
    detail: 'Main Hono server with database connection management for SQLite and PostgreSQL. Handles connection pooling, query execution, and table browsing.',
    link: '/src/server.ts'
  },
  {
    title: 'Main Application',
    type: 'frontend',
    path: 'public/index.html',
    detail: 'Frontend HTML interface with Tailwind CSS. Contains connection forms, query editor, and results display with responsive design.',
    link: '/public/index.html'
  },
  {
    title: 'Application Logic',
    type: 'frontend',
    path: 'public/app.js',
    detail: 'Frontend JavaScript with database connection management, query execution, real-time validation, and clipboard detection for auto-filling connection URLs.',
    link: '/public/app.js'
  },
  {
    title: 'Connections API',
    type: 'api',
    path: '/api/connections',
    detail: 'GET: List all database connections\nPOST: Create new connection (SQLite/PostgreSQL)\nSupports both URL and field-based PostgreSQL connections',
    link: '/api/connections'
  },
  {
    title: 'Connection Test API',
    type: 'api',
    path: '/api/connections/test',
    detail: 'POST: Test database connection without saving\nValidates SQLite paths and PostgreSQL URLs/credentials\nReturns success status and error messages',
    link: '/api/connections/test'
  },
  {
    title: 'Query Execution API',
    type: 'api',
    path: '/api/connections/:id/query',
    detail: 'POST: Execute SQL queries on specific connection\nSupports SELECT, INSERT, UPDATE, DELETE operations\nReturns results with execution metadata',
    link: '/api/connections/:id/query'
  },
  {
    title: 'Tables Browser API',
    type: 'api',
    path: '/api/connections/:id/tables',
    detail: 'GET: List all tables in database\nReturns table names for both SQLite and PostgreSQL\nFilters system tables automatically',
    link: '/api/connections/:id/tables'
  },
  {
    title: 'Widget Styles',
    type: 'frontend',
    path: 'frontend/src/components/HelpWidget.module.css',
    detail: 'CSS modules with advanced animations and responsive design. Features custom scrollbars, smooth transitions, and accessibility-focused styling.',
    link: '/frontend/src/components/HelpWidget.module.css'
  }
];

function HelpWidget(props: TProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'frontend' | 'backend' | 'api'>('all');
  
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to close widget or detail panel
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (isDetailVisible) {
          // Close detail panel first
          handleBackToMain();
        } else if (isOpen) {
          // Close widget
          handleClose();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, isDetailVisible]);

  // Focus management and trap focus in dialog
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Focus first focusable element when opening
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      // Trap focus within dialog
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
  }, [isOpen, isDetailVisible]);

  function handleToggle() {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setIsDetailVisible(false);
    setSelectedItem(null);
    // Return focus to trigger button
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }

  function handleItemClick(index: number) {
    setSelectedItem(index);
    setIsDetailVisible(true);
  }

  function handleFilterChange(newFilter: 'all' | 'frontend' | 'backend' | 'api') {
    setFilter(newFilter);
    setIsDetailVisible(false);
    setSelectedItem(null);
  }

  function getFilteredFiles() {
    if (filter === 'all') return PROJECT_FILES;
    return PROJECT_FILES.filter(file => file.type === filter);
  }

  function getTypeIcon(type: 'frontend' | 'backend' | 'api') {
    switch (type) {
      case 'frontend':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" className={styles.typeIcon}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#3b82f6"/>
          </svg>
        );
      case 'backend':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" className={styles.typeIcon}>
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="#10b981"/>
          </svg>
        );
      case 'api':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" className={styles.typeIcon}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 5-5 1.41 1.41L7.83 12l3.58 3.59L10 17zm4 0l-1.41-1.41L16.17 12l-3.58-3.59L14 7l5 5-5 5z" fill="#f59e0b"/>
          </svg>
        );
    }
  }

  function handleBackToMain() {
    setIsDetailVisible(false);
    setSelectedItem(null);
  }

  function renderDetail(detail: string) {
    // Simple markdown-like rendering for **bold** text and line breaks
    return detail
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className={styles.helpWidget}>
      <button 
        ref={triggerRef}
        onClick={handleToggle}
        className={styles.helpButton}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? 'Close project browser' : 'Open project browser'}
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
        </svg>
      </button>
      
      <div 
        className={`${styles.helpCard} ${isOpen ? styles['help--open'] : ''}`}
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? 'true' : undefined}
        aria-labelledby="help-title"
        ref={dialogRef}
      >
        {isOpen && (
          <>
            <div className={styles.helpCardHeader}>
              <div>
                <h2 id="help-title" className={styles.helpCardTitle}>
                  Project Files & APIs
                </h2>
                <p className={styles.helpCardSubtitle}>
                  Browse frontend code, backend endpoints, and API documentation
                </p>
              </div>
              <button 
                ref={firstFocusableRef}
                onClick={handleClose}
                className={styles.closeButton}
                aria-label="Close help dialog"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className={styles.helpCardContent}>
              <div className={`${styles.helpMainPanel} ${isDetailVisible ? styles.shifted : ''}`}>
                <div className={styles.filterTabs}>
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange('frontend')}
                    className={`${styles.filterTab} ${filter === 'frontend' ? styles.active : ''}`}
                  >
                    Frontend
                  </button>
                  <button
                    onClick={() => handleFilterChange('backend')}
                    className={`${styles.filterTab} ${filter === 'backend' ? styles.active : ''}`}
                  >
                    Backend
                  </button>
                  <button
                    onClick={() => handleFilterChange('api')}
                    className={`${styles.filterTab} ${filter === 'api' ? styles.active : ''}`}
                  >
                    API
                  </button>
                </div>
                <ul className={styles.helpList} role="list">
                  {getFilteredFiles().map((file, index) => {
                    const originalIndex = PROJECT_FILES.findIndex(f => f === file);
                    return (
                      <li key={originalIndex} className={styles.helpListItem}>
                        <button
                          onClick={() => handleItemClick(originalIndex)}
                          className={styles.helpListLabel}
                          aria-expanded={false}
                          title={file.path}
                        >
                          <div className={styles.fileInfo}>
                            <div className={styles.fileHeader}>
                              {getTypeIcon(file.type)}
                              <span className={styles.fileTitle}>{file.title}</span>
                            </div>
                            <span className={styles.filePath}>{file.path}</span>
                          </div>
                          <svg className={styles.chevronIcon} viewBox="0 0 24 24" width="16" height="16">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {selectedItem !== null && (
                <div className={`${styles.helpSidePanel} ${isDetailVisible ? styles['detail--visible'] : ''}`}>
                  <div className={styles.sidePanelHeader}>
                    <button
                      onClick={handleBackToMain}
                      className={styles.backButton}
                      aria-label="Back to file list"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                      </svg>
                    </button>
                    <div className={styles.sidePanelTitleGroup}>
                      <div className={styles.sidePanelTitleRow}>
                        {getTypeIcon(PROJECT_FILES[selectedItem].type)}
                        <h3 className={styles.sidePanelTitle}>
                          {PROJECT_FILES[selectedItem].title}
                        </h3>
                      </div>
                      <code className={styles.sidePanelPath}>
                        {PROJECT_FILES[selectedItem].path}
                      </code>
                    </div>
                  </div>
                  <div className={styles.sidePanelContent}>
                    <div 
                      className={styles.detailContent}
                      dangerouslySetInnerHTML={{
                        __html: renderDetail(PROJECT_FILES[selectedItem].detail)
                      }}
                    />
                    {PROJECT_FILES[selectedItem].link && (
                      <div className={styles.linkSection}>
                        <h4>Access Link</h4>
                        <a 
                          href={PROJECT_FILES[selectedItem].link}
                          className={styles.fileLink}
                          target={PROJECT_FILES[selectedItem].type === 'api' ? '_blank' : '_self'}
                          rel={PROJECT_FILES[selectedItem].type === 'api' ? 'noopener noreferrer' : undefined}
                        >
                          {PROJECT_FILES[selectedItem].type === 'api' ? 'Open API Endpoint' : 'View Source Code'}
                          <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zm-2 16H5V8h7V6H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2v-7h-2v7z"/>
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HelpWidget;
