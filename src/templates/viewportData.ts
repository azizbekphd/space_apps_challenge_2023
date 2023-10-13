export function viewportData(lat: number, lon: number) {
  return `
  <div style="position: fixed; bottom: 0; left: 0; right: 0;">
    <p style="text-align: center; color: yellow">Latitude: ${lat.toFixed(6)}; Longitude: ${lon.toFixed(6)}</p>
  </div>
  `;
}

