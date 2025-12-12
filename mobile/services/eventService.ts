/**
 * @fileoverview Event Service
 * @description Handles fall detection and heart rate event queries and summary
 */

import { apiClient, toApiError } from './api';
import type { DailySummary, Event, MonthlySummary, Paginated } from './types';

export type EventFilters = {
  elderId?: string;
  deviceId?: string;
  type?: string;
  severity?: string;
  page?: number;
  pageSize?: number;
};

export async function listEvents(filters: EventFilters = {}): Promise<Paginated<Event>> {
  try {
    const { data } = await apiClient.get<Paginated<Event>>('/api/events', { params: filters });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getRecentEvents(): Promise<Event[]> {
  try {
    const { data } = await apiClient.get<Event[]>('/api/events/recent');
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getEvent(eventId: string): Promise<Event> {
  try {
    const { data } = await apiClient.get<Event>(`/api/events/${eventId}`);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function cancelEvent(eventId: string): Promise<Event> {
  try {
    const { data } = await apiClient.post<Event>(`/api/events/${eventId}/cancel`);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getDailySummary(): Promise<DailySummary[]> {
  try {
    const { data } = await apiClient.get<DailySummary[]>('/api/events/summary/daily');
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getMonthlySummary(): Promise<MonthlySummary[]> {
  try {
    const { data } = await apiClient.get<MonthlySummary[]>('/api/events/summary/monthly');
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}
