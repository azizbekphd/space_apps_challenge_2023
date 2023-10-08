export function quakeInfo(quake: any, coords: { x: number, y: number }) {
  return `
  <div style="position: fixed; background: #333333; padding-right: 20px; left: ${coords.x}px; top: ${coords.y}px">
    <ul>
      <li>Year: ${quake.year}</li>
      <li>Day: ${quake.day}</li>
      <li>Time: ${quake.hour}-${quake.minute}-${quake.seconds}</li>
      <li>Coordinates: ${quake.latitude}, ${quake.longitude}</li>
      <li>Magnitude: ${quake.magnitude}</li>
    </ul>
  </div>
  `;
}

