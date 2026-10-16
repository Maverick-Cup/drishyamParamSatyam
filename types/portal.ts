export type ExperienceStatus = 'active' | 'prototype' | 'coming-soon';

export interface ExperienceDefinition {
  id: string;
  orderNumber: string;
  title: string;
  subtitle: string;
  description: string;
  status: ExperienceStatus;
  statusLabel: string;
  route: string;
  capabilities: string[];
  isHero: boolean;
}
