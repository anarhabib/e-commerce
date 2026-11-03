"use client";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  createRealtimeClient,
  nodePostgresParsers,
  type SealedLiveQuery,
} from "@neon/realtime/client";
import { adminApi, AdminApiError } from "./api";

type Summary = { total: number; latest: string };
type Feed =
  | { enabled: false }
  | { enabled: true; url: string; query: SealedLiveQuery<Summary> };

export function useLiveOrders(
  enabled: boolean,
  refresh: Dispatch<SetStateAction<number>>,
) {
  const [status, setStatus] = useState("Connecting live updates");
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let client: ReturnType<typeof createRealtimeClient> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last: string | undefined;
    function failed(error: unknown) {
      if (!active) return;
      clearTimeout(timer);
      client?.close();
      setStatus("Live updates unavailable. Reload to reconnect.");
      // A full load drops the previous owner's live connection; the protected
      // admin page then redirects to sign-in using its server session check.
      if (error instanceof AdminApiError && error.status === 401)
        window.location.reload();
    }
    async function connect() {
      const feed = await adminApi<Feed>("live-orders", "POST");
      if (!active) return;
      if (!feed.enabled) {
        setStatus("Live updates are not configured");
        return;
      }
      client = createRealtimeClient({
        url: feed.url,
        parsers: nodePostgresParsers,
      });
      const subscription = client.subscribe(feed.query);
      subscription.onChange((snapshot) => {
        if (!active) return;
        if (snapshot.status === "error") {
          failed(snapshot.error);
          return;
        }
        if (snapshot.status === "stale" || snapshot.status === "connecting") {
          setStatus("Connecting live updates");
          return;
        }
        if (snapshot.status !== "live" || !snapshot.data) return;
        setStatus("Order requests update live");
        const signature = JSON.stringify(snapshot.data);
        if (last !== undefined && signature !== last)
          refresh((value) => value + 1);
        last = signature;
      });
      function schedule(query: SealedLiveQuery<Summary>) {
        if (!active) return;
        timer = setTimeout(
          async () => {
            try {
              const next = await adminApi<Feed>("live-orders", "POST");
              if (!active) return;
              if (!next.enabled)
                throw new Error("Live updates are not configured");
              await subscription.renew(next.query);
              schedule(next.query);
            } catch (error) {
              failed(error);
            }
          },
          Math.max(1000, query.expiresAt - Date.now() - 10_000),
        );
      }
      schedule(feed.query);
    }
    void connect().catch(failed);
    return () => {
      active = false;
      clearTimeout(timer);
      client?.close();
    };
  }, [enabled, refresh]);
  return enabled ? status : "";
}
