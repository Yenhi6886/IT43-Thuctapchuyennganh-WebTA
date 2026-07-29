async function getCaptionsInnerTube(videoId) {
  const payload = { context: { client: { clientName: "ANDROID", clientVersion: "20.10.38" } }, videoId };
  const headers = { "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)", "Content-Type": "application/json" };
  const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", { method: "POST", headers, body: JSON.stringify(payload) });
  const data = await res.json();
  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  return tracks ? tracks.map(t=>t.languageCode).join(',') : 'NONE';
}

const vids = ['UF8uR6Z6KLc', 'bBTPZ9NdSk8', 'd2qYFmO6Lbk', 'P1mQG4s7Lbs', 'XKu_SEDAykw', 'lCAg8Ybm2us', 'juKd26qkNAw'];
(async () => {
  for (let v of vids) {
    console.log(v, await getCaptionsInnerTube(v));
  }
})();
