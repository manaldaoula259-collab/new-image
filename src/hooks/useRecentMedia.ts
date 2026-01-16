"use client";

import axios from "axios";
import { useMemo } from "react";
import { useQuery } from "react-query";

export interface RecentMediaItem {
  id: string;
  url: string;
  createdAt: Date;
  prompt?: string;
  source?: string;
}

interface MediaApiResponseItem {
  id: string;
  url: string;
  createdAt: string;
  prompt?: string;
  source?: string;
}

export function useRecentMedia(limit?: number) {
  const query = useQuery(
    ["recent-media"],
    async () => {
      const response = await axios.get<MediaApiResponseItem[]>("/api/media");
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  const media = useMemo<RecentMediaItem[]>(() => {
    if (!query.data) {
      return [];
    }

    const items = query.data
      .map((item) => ({
        id: item.id,
        url: item.url,
        prompt: item.prompt,
        source: item.source,
        createdAt: new Date(item.createdAt),
      }))
      .filter((item) => item.url);

    const sorted = items.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }, [query.data, limit]);

  return {
    ...query,
    media,
  };
}

