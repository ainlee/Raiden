import React, { useState, useEffect, useRef } from 'react';
import styles from './DevPanel.module.css';

/**
 * 開發者面板元件
 * @param {Object} props - 元件屬性
 * @param {boolean} props.isDevMode - 是否為開發模式
 */
const DevPanel: React.FC<{ isDevMode: boolean }> = ({ isDevMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isInvincible, setIsInvincible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 切換面板展開狀態
  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  // 初始化日誌攔截
  useEffect(() => {
    if (!isDevMode) return;

    const originalConsole = { ...console };
    const logMethods = ['log', 'warn', 'error'] as const;

    logMethods.forEach((method) => {
      console[method] = (...args: any[]) => {
        originalConsole[method](...args);
        setLogs((prev) => [...prev, args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : arg
        ).join(' ')]);
      };
    });

    return () => {
      logMethods.forEach((method) => {
        console[method] = originalConsole[method];
      });
    };
  }, [isDevMode]);

  // 清除日誌
  const clearLogs = () => {
    setLogs([]);
  };

  // 複製日誌
  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
      console.log('日誌已複製到剪貼簿');
    } catch (err) {
      console.error('複製日誌失敗:', err);
    }
  };

  if (!isDevMode) return null;

  return (
    <div className={`${styles.panel} ${isExpanded ? styles.expanded : ''}`} ref={panelRef}>
      <div className={styles.header} onClick={togglePanel}>
        <span>開發者面板</span>
        <button className={styles.toggleButton}>
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.controls}>
            <button onClick={clearLogs}>清除日誌</button>
            <button onClick={copyLogs}>複製日誌</button>
            <label>
              <input
                type="checkbox"
                checked={isInvincible}
                onChange={() => {
                  setIsInvincible(!isInvincible);
                  eventBus.emit('TOGGLE_INVINCIBILITY');
                }}
              />
              無敵模式
            </label>
          </div>

          <div className={styles.logContainer}>
            {logs.map((log, index) => (
              <div key={index} className={styles.logEntry}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevPanel;