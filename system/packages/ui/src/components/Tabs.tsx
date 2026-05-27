import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="mech-tabs">
      <div className="mech-tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTabId}
            className={`mech-tab-btn ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mech-tab-panel" role="tabpanel">
        {activeTab ? activeTab.content : null}
      </div>
    </div>
  );
};
