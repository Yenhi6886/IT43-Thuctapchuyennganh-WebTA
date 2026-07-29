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
  
  // Notice we use the same headers!
  const viRes = await fetch(enTrack.baseUrl + '&tlang=vi', { headers });
  console.log("VI Xml:", (await viRes.text()).slice(0, 300));
}
getCaptionsInnerTube('juKd26qkNAw');
