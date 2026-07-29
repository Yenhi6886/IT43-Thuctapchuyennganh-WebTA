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
  
  // Use fmt=vtt
  const enRes = await fetch(enTrack.baseUrl + '&fmt=vtt', { headers });
  const enData = await enRes.text();
  console.log("VTT format length:", enData.length);
  console.log(enData.slice(0, 300));
}
getCaptionsInnerTube('juKd26qkNAw');
