async function getYoutubeCaptions(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await res.text();
    
    // Quick parse JSON using string matching
    const match = html.match(/"captions":({.*?})[,}]]*/);
    if (!match) process.exit(1);

    const match2 = html.match(/"captionTracks":(\[.*?\])/);
    if (!match2) throw new Error('No tracks');
    
    const tracks = JSON.parse(match2[1]);
    
    let track = tracks.find(t => t.languageCode === 'en' || t.languageCode === 'en-US' || t.vssId === '.en');
    if (!track) track = tracks[0]; 
    
    const xmlRes = await fetch(track.baseUrl);
    const xml = await xmlRes.text();
    console.log('XML:', xml.slice(0, 300));
    
    const viRes = await fetch(track.baseUrl + '&tlang=vi');
    const viXml = await viRes.text();
    console.log('VI XML:', viXml.slice(0, 300));

  } catch (e) {
    console.error(e);
  }
}

getYoutubeCaptions('juKd26qkNAw');
