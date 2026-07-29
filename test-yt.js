async function test() {
  const { YoutubeTranscript } = await import('youtube-transcript');
  try {
    const list = await YoutubeTranscript.fetchTranscript('qB3S0Q9k-6o');
    console.log(list.slice(0, 2));
  } catch (e) {
    console.error('err:', e);
  }
}
test();
