"use client";

import React, { useState } from "react";
import { RegistrationIntro } from "../RegistrationIntro/RegistrationIntro";

interface RegistrationIntroGateProps {
  hasSeenIntro: boolean;
  children: React.ReactNode;
}

export function RegistrationIntroGate({ hasSeenIntro, children }: RegistrationIntroGateProps) {
  const [showIntro, setShowIntro] = useState(!hasSeenIntro);

  if (showIntro) {
    return <RegistrationIntro onComplete={() => setShowIntro(false)} />;
  }

  return <>{children}</>;
}
