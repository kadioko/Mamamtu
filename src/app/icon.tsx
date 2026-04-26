import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#0f766e',
          borderRadius: 112,
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            background: '#fdf2f8',
            borderRadius: 152,
            color: '#e11d48',
            display: 'flex',
            fontSize: 210,
            fontWeight: 800,
            height: 304,
            justifyContent: 'center',
            lineHeight: 1,
            width: 304,
          }}
        >
          M
        </div>
      </div>
    ),
    size
  );
}
