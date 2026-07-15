type PixelTab = {
  id: string;
  label: string;
  disabled?: boolean;
};

type PixelTabsProps = {
  id: string;
  label: string;
  tabs: PixelTab[];
  activeId: string;
  onChange: (id: string) => void;
};

export function PixelTabs({ id, label, tabs, activeId, onChange }: PixelTabsProps) {
  const enabledTabs = tabs.filter((tab) => !tab.disabled);

  const moveFocus = (
    currentId: string,
    direction: "next" | "previous" | "first" | "last",
  ) => {
    const currentIndex = enabledTabs.findIndex((tab) => tab.id === currentId);
    const nextIndex =
      direction === "first"
        ? 0
        : direction === "last"
          ? enabledTabs.length - 1
          : direction === "next"
            ? (currentIndex + 1) % enabledTabs.length
            : (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    const nextTab = enabledTabs[nextIndex];
    if (!nextTab) return;
    onChange(nextTab.id);
    document.getElementById(`${id}-tab-${nextTab.id}`)?.focus();
  };

  return (
    <div className="pixel-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            id={`${id}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${id}-panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                moveFocus(tab.id, "next");
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveFocus(tab.id, "previous");
              } else if (event.key === "Home") {
                event.preventDefault();
                moveFocus(tab.id, "first");
              } else if (event.key === "End") {
                event.preventDefault();
                moveFocus(tab.id, "last");
              }
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
