const lunarPhaseFromDate = (() => {
  const lunarDays = 29.53058770576;
  const lunarSecs = lunarDays * (24 * 60 * 60);
  const newMoonDate = new Date("2000-01-06 18:14");
  return (date: Date) => {
    const totalSecs = date.getTime() - newMoonDate.getTime() / 1000;
    let currentSecs = totalSecs % lunarSecs;
    currentSecs += currentSecs < 0 ? 1 : 0;
    const currentFrac = currentSecs / lunarSecs;
    const currentDays = currentFrac * lunarDays;
    return currentFrac;
  }
})()

export { lunarPhaseFromDate };

