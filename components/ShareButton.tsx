"use client";

type Props = {
  title?: string;
  text?: string;
  url?: string; // if omitted, uses current location
  children?: React.ReactNode; // optional custom label
};

export default function ShareButton({ title, text, url, children }: Props) {
  async function handleShare() {
    const shareUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const payload = { title, text, url: shareUrl };

    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${title ? title + "\n" : ""}${text ? text + "\n" : ""}${shareUrl}`
        );
        alert("Link copied to clipboard!");
      } else {
        // last-resort fallback
        const tmp = document.createElement("textarea");
        tmp.value = shareUrl;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        alert("Link copied to clipboard!");
      }
    } catch {
      // user canceled or share failed — ignore quietly
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        padding: "6px 10px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: "white",
        cursor: "pointer",
      }}
      title="Share this word"
    >
      {children ?? "📤 Share"}
    </button>
  );
}
