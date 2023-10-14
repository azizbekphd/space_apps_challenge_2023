const lunarPhaseFromDate = (() => {
  const lunarDays = 29.53058770576;
  const lunarSecs = lunarDays * (24 * 60 * 60);
  const newMoonDate = new Date("01-06-2000 18:14 GMT");
  return (date: Date) => {
    const totalSecs = (date.getTime() - newMoonDate.getTime()) / 1000;
    let currentSecs = totalSecs % lunarSecs;
    currentSecs += currentSecs < 0 ? 1 : 0;
    currentSecs = Math.abs(currentSecs);
    const currentFrac = currentSecs / lunarSecs;
    return currentFrac;
  }
})()

export { lunarPhaseFromDate };

