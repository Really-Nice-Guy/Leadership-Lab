import type { Article, Session, Mapping } from '../types';

export async function loadArticles(): Promise<Article[]> {
  const response = await fetch('/data/articles.json');
  return response.json();
}

export async function loadSessions(): Promise<Session[]> {
  const response = await fetch('/data/sessions.json');
  return response.json();
}

export async function loadMapping(): Promise<Mapping> {
  const response = await fetch('/data/mapping.json');
  return response.json();
}

export function getFourCColorClass(fourC: string): string {
  const colors: Record<string, string> = {
    'Communication': 'bg-communication',
    'Customer': 'bg-customer',
    'Cognizance': 'bg-cognizance',
    'Charisma': 'bg-charisma',
  };
  return colors[fourC] || 'bg-gray-500';
}

export function getFourCBorderClass(fourC: string): string {
  const borders: Record<string, string> = {
    'Communication': 'border-communication',
    'Customer': 'border-customer',
    'Cognizance': 'border-cognizance',
    'Charisma': 'border-charisma',
  };
  return borders[fourC] || 'border-gray-400';
}

export function getFourCTextClass(fourC: string): string {
  const colors: Record<string, string> = {
    'Communication': 'text-communication',
    'Customer': 'text-customer',
    'Cognizance': 'text-cognizance',
    'Charisma': 'text-charisma',
  };
  return colors[fourC] || 'text-gray-500';
}

export function getFourCLightBgClass(fourC: string): string {
  const bgs: Record<string, string> = {
    'Communication': 'bg-communication-light',
    'Customer': 'bg-customer-light',
    'Cognizance': 'bg-cognizance-light',
    'Charisma': 'bg-charisma-light',
  };
  return bgs[fourC] || 'bg-gray-100';
}
