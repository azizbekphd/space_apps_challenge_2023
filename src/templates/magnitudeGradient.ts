export function magnitudeGradient(params: {visible: boolean, min: number, max: number}) {
  return [`
  <div class="magnitude-gradient" style="display: ${params.visible ? "block" : "none"}; position: fixed;
      bottom: 25px; right: 15px; width: 20px; height: 150px; overflow: visible;
      font-size: 12px; font-weight: bold;
      background: linear-gradient(to top, #0000ff, #00ff00, #ff0000)">
      <div style="position: absolute; left: -7px; width: 1px; height: 100%;
              background: white">
          <div style="position: absolute; width: 7px; height: 1px; right: 0px; top: 0px; background: white;">
              <div style="position: absolute; translate: -120% -40%;">
                ${params.max}
              </div>
          </div>
          <div style="position: absolute; width: 7px; height: 1px; right: 0px; top: 50%; background: white;">
              <div style="position: absolute; translate: -120% -40%;">
                ${(params.max - params.min) / 2}
              </div>
          </div>
          <div style="position: absolute; width: 7px; height: 1px; right: 0px; bottom: 0px; background: white;">
              <div style="position: absolute; translate: -120% -40%;">
                ${params.min}
              </div>
          </div>
      </div>
  </div>
  <style>
    @media screen and (max-width: 480px) {
      .magnitude-gradient {
        bottom: 50%!important;
        translate: 0 50%!important;
      }
    }
  </style>
  `];
}

