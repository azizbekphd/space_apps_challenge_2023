import { Template } from "../types/Template";

export function quakeInfo(quake: any): Template {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const content = `
    <ul>
      <li>Year: ${quake.year}</li>
      <li>Day: ${quake.day}</li>
      <li>Time: ${quake.hour}-${quake.minute}-${quake.seconds}</li>
      <li>Coordinates: ${quake.latitude}, ${quake.longitude}</li>
      <li>Magnitude: ${quake.magnitude}</li>
    </ul>
  `;
  const desktopVersion = `
    <div class="quake-info__desktop">${content}</div>
    <style>
      .quake-info__desktop {
        position: fixed;
        background: #33333388;
        padding-right: 20px;
        pointer-events: none;
        left: 15px;
        top: 15px;
        z-index: 100;
      }
    </style>
  `;
  const mobileVersion = `
    <div class="quake-info__mobile">
      <span class="quake-info-toggler">i</span>
      <div class="quake-info-dialog closed">
        <h3>Information about the selected moonquake</h3>
        ${content}
        <a href="#" class="quake-info-close">Close</a>
      </div>
    </div>
    </script>
    <style>
      .quake-info__mobile > * {
        z-index: 1000;
      }

      .quake-info-toggler {
        pointer-events: all;
        display: block;
        position: fixed;
        top: 15px;
        left: 15px;
        width: 25px;
        height: 25px;
        background: yellow;
        border-radius: 50%;
        color: black;
        text-align: center;
        line-height: 25px;
      }

      .quake-info-dialog {
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        width: 300px;
        height: fit-content;
        background: #333333;
        padding: 0px 10px 15px 10px;
        text-align: center;
      }

      .quake-info-dialog.closed {
        display: none;
      }

      .quake-info-dialog li {
        text-align: left;
      }
    </style>
  `;

  const callback = () => {
    if (isMobile) {
      const toggler = document.querySelector(".quake-info-toggler")! as HTMLSpanElement;
      const dialog = document.querySelector(".quake-info-dialog")! as HTMLDivElement;
      const close = document.querySelector(".quake-info-close")! as HTMLDivElement;

      toggler.onclick = (e) => {
        e.stopPropagation();
        dialog.classList.remove("closed");
      }
      close.onclick = (e) => {
        e.stopPropagation();
        dialog.classList.add("closed");
      }
    }
  }
  return isMobile ? [mobileVersion, callback] : [desktopVersion];
}

