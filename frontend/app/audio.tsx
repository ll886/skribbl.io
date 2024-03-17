const soundMapping: Record<string, string> = {
  click: "click.mp3",
  pop: "pop.mp3",
  roundTransition: "round-transition.mp3",
  gameOver: "gameover.mp3",
  clock: "clock.mp3",
};

function getAudio(sound: string) {
  const filename = soundMapping[sound];
  return new Audio(`/sound/${filename}`);
}

export { getAudio };
