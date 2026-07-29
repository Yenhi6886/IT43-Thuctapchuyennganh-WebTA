async function getCaptionsInnerTube(videoId) {
  const payload = {
    context: {
      client: {
        clientName: "ANDROID",
        clientVersion: "20.10.38"
      }
    },
    videoId: videoId
  };

  const headers = {
    "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    "Content-Type": "application/json"
  };

  const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST", headers, body: JSON.stringify(payload)
  });

  const data = await res.json();
  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!tracks) return console.log("No tracks");

  const enTrack = tracks.find(t => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];
  
  // Use fmt=json3
  const enRes = await fetch(enTrack.baseUrl + '&fmt=json3', { headers });
  const enData = await enRes.json();
  console.log("JSON3 format events count:", enData.events?.length);
  // first event with text
  const first = enData.events?.find(e => e.segs && e.segs.length > 0);
  console.log("First:", first);
}
getCaptionsInnerTube('juKd26qkNAw');
