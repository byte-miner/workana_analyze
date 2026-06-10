"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

function FeedLoading({ message = "Loading feed..." }: { message?: string }) {
  return (
    <div className="workana-panel mx-auto max-w-[1170px] p-8 text-center text-[var(--muted)]">
      {message}
    </div>
  );
}

const FeedPage = dynamic(
  () => import("@/components/FeedPage").then((mod) => ({ default: mod.FeedPage })),
  {
    ssr: false,
    loading: () => <FeedLoading />,
  }
);

class FeedChunkErrorBoundary extends Component<
  { children: ReactNode },
  { retrying: boolean }
> {
  state = { retrying: false };

  static getDerivedStateFromError(error: Error) {
    if (error.name === "ChunkLoadError") {
      return { retrying: true };
    }
    throw error;
  }

  componentDidCatch(error: Error) {
    if (error.name === "ChunkLoadError" && typeof window !== "undefined") {
      window.setTimeout(() => window.location.reload(), 300);
    }
  }

  render() {
    if (this.state.retrying) {
      return <FeedLoading message="Updating feed — refreshing..." />;
    }
    return this.props.children;
  }
}

export default function FeedRoute() {
  return (
    <FeedChunkErrorBoundary>
      <FeedPage />
    </FeedChunkErrorBoundary>
  );
}
