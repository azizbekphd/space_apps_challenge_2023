import { Template } from "../types/Template";

export function introLoader(): Template {
  return [`
  <div class="loader-wrapper">
    <div class="loader-content">
      <h2 class="loader-text">Loading</h2>
      <span class="loader-spinner"></span>
    </div>
  </div>
  <style>
    .loader-wrapper {
      z-index: 10000;
      position: fixed;
      display: flex;
      justify-content: center;
      align-items: center;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      backdrop-filter: blur(10px);
    }

    .loader-content {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .loader-text {
      text-align: center;
      margin-right: 10px;
    }

    @keyframes loader-text-dots{
      0% {
        rotate: 0deg;
        background: #ff0000;
      }
      25% {
        rotate: 90deg;
        background: #ffff00;
      }
      50% {
        rotate: 180deg;
        background: #00ffff;
      }
      75% {
        rotate: 270deg;
        background: #0000ff;
      }
      100% {
        rotate: 360deg;
        background: #ff0000;
      }
    }

    .loader-spinner {
      display: block;
      position: inline;
      width: 20px;
      height: 20px;
      animation: 2s linear 0s infinite running loader-text-dots;
    }
  </style>
  `];
}

