const ytdl = require('@distube/ytdl-core');

async function test() {
  const vid = 'juKd26qkNAw';
  try {
    const info = await ytdl.getInfo(vid);
    const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    console.log('Available tracks:', tracks.map(t => ({ lang: t.languageCode, name: t.name.simpleText })));
    
    // Find english
    const en = tracks.find(t => t.languageCode === 'en' || t.languageCode === 'en-US');
    if (en) {
      const res = await fetch(en.baseUrl);
      const text = await res.text();
      console.log('EN XML:', text.slice(0, 500));
    }
    
    // Auto-translated Vietnamese
    const viUrl = en.baseUrl + '&tlang=vi';
    const resVi = await fetch(viUrl);
    const textVi = await resVi.text();
    console.log('VI XML:', textVi.slice(0, 500));
  } catch (e) {
    console.error('err:', e.message);
  }
}
test();
