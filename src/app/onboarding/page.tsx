import type { Metadata } from "next";

import { OnboardingForm } from "@/components/OnboardingForm";

import styles from "./onboarding.module.css";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Set your first learning goal and practice preferences.",
};

export default function OnboardingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.panel} aria-labelledby="onboarding-title">
        <p className={styles.kicker}>Welcome to Ameego</p>
        <h1 id="onboarding-title">Build your first learning path</h1>
        <p className={styles.intro}>
          Three quick choices help us set up your first practice session. You can update
          them later in the Interview Center.
        </p>
        <OnboardingForm />
      </section>
    </div>
  );
}
