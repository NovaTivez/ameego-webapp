import { ImageResponse } from "next/og";

const ICON_SIZES = new Set([192, 512]);
const LETTER_A = [
  "0011100",
  "0110110",
  "1100011",
  "1100011",
  "1111111",
  "1100011",
  "1100011",
];

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> },
) {
  const requestedSize = Number((await context.params).size);
  const size = ICON_SIZES.has(requestedSize) ? requestedSize : 192;
  const pixel = Math.floor(size / 12);
  const letterWidth = pixel * 7;
  const letterHeight = pixel * 7;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#0e192c",
        border: `${Math.max(8, Math.floor(size / 32))}px solid #01040a`,
        boxShadow: `inset 0 0 0 ${Math.max(5, Math.floor(size / 48))}px #526b8e`,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width: letterWidth,
          height: letterHeight,
        }}
      >
        {LETTER_A.flatMap((row, y) =>
          [...row].map((value, x) =>
            value === "1" ? (
              <span
                key={`${x}-${y}`}
                style={{
                  position: "absolute",
                  top: y * pixel,
                  left: x * pixel,
                  width: pixel,
                  height: pixel,
                  background: "#f3c54b",
                  boxShadow: `inset ${Math.max(2, Math.floor(pixel / 5))}px ${Math.max(2, Math.floor(pixel / 5))}px 0 #ffe58a`,
                }}
              />
            ) : null,
          ),
        )}
      </div>
      <div
        style={{
          position: "absolute",
          right: "18%",
          bottom: "13%",
          left: "18%",
          height: "8%",
          background: "#4cae49",
          border: `${Math.max(3, Math.floor(size / 85))}px solid #01040a`,
        }}
      />
    </div>,
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
