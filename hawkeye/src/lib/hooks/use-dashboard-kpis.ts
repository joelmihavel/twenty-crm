"use client";

import { useCallback, useEffect, useState } from "react";
import { graphqlQuery } from "../twenty/graphql-client";

interface OccupancyData {
  occupied: number;
  total: number;
  rate: number;
}

interface DashboardKPIs {
  occupancy: OccupancyData;
  activeTenants: number;
  totalTenants: number;
  contracts: number;
  vendors: number;
}

interface UseDashboardKPIsResult {
  data: DashboardKPIs | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Batch 1: Occupancy (occupied rooms) + total rooms + active tenants + total tenants
// Batch 2: contracts + vendors
// Each batch stays well under the 20-resolver limit (max 6 resolvers across both)

interface Batch1Response {
  occupiedRooms: { totalCount: number };
  totalRooms: { totalCount: number };
  activeTenants: { totalCount: number };
  totalTenants: { totalCount: number };
}

interface Batch2Response {
  contracts: { totalCount: number };
  vendors: { totalCount: number };
}

const BATCH_1_QUERY = `{
  occupiedRooms: roomAvailabilities(
    first: 1
    filter: { roomStatus: { eq: "OCCUPIED" } }
  ) {
    totalCount
  }
  totalRooms: roomAvailabilities(first: 1) {
    totalCount
  }
  activeTenants: tenants(
    first: 1
    filter: { tenantLifecycle: { eq: "MOVED_IN" } }
  ) {
    totalCount
  }
  totalTenants: tenants(first: 1) {
    totalCount
  }
}`;

const BATCH_2_QUERY = `{
  contracts(first: 1) {
    totalCount
  }
  vendors(first: 1) {
    totalCount
  }
}`;

export function useDashboardKPIs(): UseDashboardKPIsResult {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchKPIs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [batch1, batch2] = await Promise.all([
        graphqlQuery<Batch1Response>(BATCH_1_QUERY),
        graphqlQuery<Batch2Response>(BATCH_2_QUERY),
      ]);

      const occupied = batch1.occupiedRooms?.totalCount ?? 0;
      const total = batch1.totalRooms?.totalCount ?? 0;
      const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      setData({
        occupancy: { occupied, total, rate },
        activeTenants: batch1.activeTenants?.totalCount ?? 0,
        totalTenants: batch1.totalTenants?.totalCount ?? 0,
        contracts: batch2.contracts?.totalCount ?? 0,
        vendors: batch2.vendors?.totalCount ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  return { data, loading, error, refetch: fetchKPIs };
}
