import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ParamSathya — Private Remembrance & Guided Reflection',
    short_name: 'ParamSathya',
    description: 'Evidence-grounded memory preservation and neutral reflection sanctuary.',
    start_url: '/experience/presence',
    display: 'standalone',
    background_color: '#0b0f17',
    theme_color: '#0b0f17',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
