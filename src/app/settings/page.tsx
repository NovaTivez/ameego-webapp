import type { Metadata } from "next";

import { SettingsPanel } from "@/components/SettingsPanel";
import styles from "@/components/settings-panel.module.css";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your local Ameego learner profile and stored progress.",
};

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageTitle}>
        <h1>Settings</h1>
        <p>Profile and local learning data</p>
      </header>
      <SettingsPanel />
    </div>
  );
}
