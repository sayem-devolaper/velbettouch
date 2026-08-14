import { useEffect } from "react";

/** Injects the Meta (Facebook) Pixel base code once and tracks PageView. */
export function MetaPixel({ pixelId }: { pixelId: string | null }) {
  useEffect(() => {
    if (!pixelId) return;
    const w = window as any;

    if (!w.fbq) {
      const n: any = (w.fbq = function (...args: unknown[]) {
        n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
      });
      if (!w._fbq) w._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }

    if (!w.__fbPixelInit) {
      w.fbq("init", pixelId);
      w.__fbPixelInit = pixelId;
    }
    w.fbq("track", "PageView");
  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        alt=""
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}

export function getFbCookies() {
  if (typeof document === "undefined") return {};
  const read = (name: string) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
  return { fbp: read("_fbp"), fbc: read("_fbc") };
}
