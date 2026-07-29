async function getCaptionsInnerTube(videoId) {
  const payload = { context: { client: { clientName: "ANDROID", clientVersion: "20.10.38" } }, videoId };
  const headers = { "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)", "Content-Type": "application/json" };
  const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", { method: "POST", headers, body: JSON.stringify(payload) });
  const data = await res.json();
  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  return tracks ? tracks.map(t=>t.languageCode).join(',') : 'NONE';
}

const vids = ['v_t-9Q2lH_E', 'cGr_DLzQqu8', 'KVpq8EE0q0U'];
(async () => {
  for (let v of vids) {
    console.log(v, await getCaptionsInnerTube(v));
  }
})();
