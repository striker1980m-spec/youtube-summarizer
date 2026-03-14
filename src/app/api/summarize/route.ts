import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from "youtube-transcript";
import { NextResponse } from "next/server";

const getGenAI = (userKey?: string) => {
  return new GoogleGenerativeAI(userKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
};

export async function POST(req: Request) {
  try {
    const { urls, type } = await req.json();
    const userKey = req.headers.get("X-Gemini-API-Key");
    const genAI = getGenAI(userKey || undefined);

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: "Invalid URLs" }, { status: 400 });
    }

    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const videoId = extractVideoId(url);
          if (!videoId) throw new Error("Invalid YouTube URL");

          const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
          const fullText = transcriptData.map((t) => t.text).join(" ");

          let prompt = "";
          if (type === "detailed") {
            prompt = `
              다음은 유튜브 영상의 자막 텍스트입니다. 이 내용을 바탕으로 상세한 요약을 작성해 주세요.
              각 주요 섹션별로 소제목을 달고 상세히 설명해 주세요. 결과는 반드시 한국어(Korean)로 출력해 주세요.
              
              텍스트: ${fullText.substring(0, 30000)}
            `;
          } else {
            prompt = `
              다음은 유튜브 영상의 자막 텍스트입니다. 이 내용을 바탕으로 핵심 내용을 요약해 주세요.
              가장 중요한 5개의 핵심 포인트를 불렛 포인트로 정리해 주세요. 결과는 반드시 한국어(Korean)로 출력해 주세요.
              
              텍스트: ${fullText.substring(0, 30000)}
            `;
          }

          // 무료 티어에서 쿼터(TPM)가 넉넉한 Flash 모델들을 우선적으로 시도합니다.
          // Flash: 1,000,000 TPM / Pro: 32,000 TPM (차이가 매우 큼)
          const modelNames = ["gemini-1.5-flash", "gemini-flash-latest", "gemini-2.0-flash"];
          let lastError = null;

          for (const mName of modelNames) {
            try {
              const model = genAI.getGenerativeModel({ model: mName });
              const result = await model.generateContent(prompt);
              const response = await result.response;
              const summary = response.text();
              const usage = response.usageMetadata;

              return { 
                url, 
                videoId, 
                summary, 
                success: true,
                usage: {
                  promptTokens: usage?.promptTokenCount,
                  candidatesTokens: usage?.candidatesTokenCount,
                  totalTokens: usage?.totalTokenCount
                }
              };
            } catch (err: any) {
              lastError = err;
              console.warn(`Model ${mName} failed:`, err.message);
              if (err.message.includes("429")) break; // Quota error, don't spam other models
            }
          }

          throw lastError;
        } catch (error: any) {
          console.error(`Gemini API Error for ${url}:`, error);
          let userFriendlyMessage = `AI 분석 중 오류가 발생했습니다: ${error.message}`;
          
          if (error.message.includes("API key not valid")) {
            userFriendlyMessage = userKey 
              ? "입력하신 개인 API 키가 유효하지 않습니다. [설정]에서 키를 다시 확인해 주세요."
              : "서비스 공용 API 키가 유효하지 않습니다. 관리자에게 문의하거나 개인 키를 등록해 주세요.";
          } else if (error.message.includes("429")) {
            userFriendlyMessage = userKey
              ? "개인 API 할당량을 초과했습니다. 잠시 후 다시 시도하시거나 키 설정을 확인해 주세요."
              : "서비스 공용 할당량을 초과했습니다. [설정]에서 개인 API 키를 등록하시면 제한 없이 사용 가능합니다!";
          } else if (error.message.includes("not found")) {
            userFriendlyMessage = "사용 가능한 AI 모델을 찾을 수 없습니다. Google AI Studio에서 모델 권한을 확인해 주세요.";
          }
          
          return { url, error: userFriendlyMessage, success: false };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}
