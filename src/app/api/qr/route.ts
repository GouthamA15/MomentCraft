import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const text = searchParams.get("text")?.trim() || "";
  const path = searchParams.get("path")?.trim() || "";

  const value = text || (path ? new URL(path, request.url).toString() : "");

  if (!value) {
    return NextResponse.json({ error: "Provide ?text=... or ?path=/site/slug" }, { status: 400 });
  }

  const svg = await QRCode.toString(value, {
    type: "svg",
    margin: 1,
    width: 256,
    errorCorrectionLevel: "M",
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
