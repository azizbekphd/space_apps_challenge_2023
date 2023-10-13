export function quakeInfo(quake: any, coords: { x: number, y: number }) {
  return `
  <div style="position: fixed; background: #333333;
      padding-right: 20px;
      left: ${Math.min(coords.x, window.innerWidth - 250)}px;
      top: ${Math.min(coords.y, window.innerHeight - 160)}px;
      z-index: 100;
      ">
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

