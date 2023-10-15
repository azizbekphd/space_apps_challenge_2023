type LatLon = {lat: number; lon: number};

export function viewportData(camera: LatLon, pointer?: LatLon) {
  return [`
  <div class="viewport-data">
    <table class="viewport-data-table">
      <tr>
        <th></th>
        <th>Latitude</th>
        <th>Longitude</th>
      </tr>
      <tr>
        <th>Camera</th>
        <td>${camera.lat.toFixed(6)}</td>
        <td>${camera.lon.toFixed(6)}</td>
      </tr>
      ${pointer ?
        `<tr>
          <th>Pointer</th>
          <td>${pointer.lat.toFixed(6)}</td>
          <td>${pointer.lon.toFixed(6)}</td>
        </tr>` : ""}
    </table>
  </div>
  <style>
    .viewport-data{
      --cell-height: 30px;
      position: fixed;
      display: flex;
      top: calc(100vh - var(--cell-height) * 3 - 20px);
      left: 50%;
      translate: -50%;
      justify-content: center;
      align-items: center;
      background: #33333388;
      cursor: auto;
    }

    .viewport-data-table {
      border-spacing: 0;
    }

    .viewport-data-table td, .viewport-data-table th {
      border: 0.5px solid yellow;
      color: yellow;
    }

    .viewport-data-table td, .viewport-data-table th {
      width: 100px;
      height: var(--cell-height);
    }

    .viewport-data-table td {
      text-align: right;
    }
  </style>
  `];
}

