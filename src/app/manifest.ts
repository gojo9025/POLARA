import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'POLARA — Polar Outreach, Learning & Research Archive',
    short_name: 'POLARA',
    description: 'Autonomous AI Polar Science Knowledge Ecosystem & Scientific Repository (NCPOR)',
    start_url: '/',
    display: 'standalone',
    background_color: '#060a14',
    theme_color: '#38b6e6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
