const express = require('express');
const { YtCaptionKit } = require('yt-caption-kit');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

// 자막 추출 엔드포인트
app.get('/transcript', async (req, res) => {
  const { videoId } = req.query;
  
  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  console.log(`[${new Date().toLocaleTimeString()}] Fetching transcript for: ${videoId}`);
  
  try {
    const kit = new YtCaptionKit();
    const transcriptData = await kit.fetch(videoId);
    res.json(transcriptData);
    console.log(`[Success] Sent transcript for ${videoId}`);
  } catch (error) {
    console.error(`[Error] Failed to fetch for ${videoId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log('\n================================================');
  console.log('🚀 YouTube 자막 프록시 서버가 실행 중입니다!');
  console.log(`📡 로컬 주소: http://localhost:${port}`);
  console.log('================================================\n');
  console.log('1. ngrok을 실행하여 이 서버를 외부로 노출하세요:');
  console.log(`   ngrok http ${port}`);
  console.log('\n2. ngrok 주소를 Vercel의 [LOCAL_TRANSCRIPT_PROXY_URL] 환경 변수에 등록하세요.');
  console.log('   (예: https://xxxx-xxxx.ngrok-free.app)');
});
