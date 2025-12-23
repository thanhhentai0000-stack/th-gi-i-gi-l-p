
import { GoogleGenAI, Type } from "@google/genai";
import { WorldConfig, SceneData, GameState } from "../types.ts";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getProviderInstruction = (provider: string) => {
  switch (provider) {
    case 'grok':
      return "PHONG CÁCH GROK: Hãy dẫn truyện một cách sắc sảo, hóm hỉnh, đôi khi hơi châm biếm và nổi loạn. Tránh cách nói quá trang trọng.";
    case 'gpt':
      return "PHONG CÁCH GPT: Hãy dẫn truyện một cách sáng tạo, bay bổng, sử dụng nhiều tính từ miêu tả và tạo ra các tình tiết bất ngờ, giàu cảm xúc.";
    default:
      return "PHONG CÁCH GEMINI: Hãy dẫn truyện một cách cân bằng, logic, tập trung vào xây dựng thế giới và tương tác nhân vật một cách chân thực.";
  }
};

const getDifficultyInstruction = (level: string) => {
  switch (level) {
    case 'easy': return "ĐỘ KHÓ DỄ: Hãy làm cho thế giới thân thiện, kẻ thù yếu đuối, tài nguyên dồi dào.";
    case 'medium': return "ĐỘ KHÓ TRUNG BÌNH: Cân bằng giữa thử thách và phần thưởng.";
    case 'hard': return "ĐỘ KHÓ KHÓ: Thế giới khắc nghiệt, kẻ thù thông minh, tài nguyên khan hiếm.";
    case 'hell': return "ĐỘ KHÓ ĐỊA NGỤC: Cực kỳ tàn khốc. Kẻ thù áp đảo.";
    case 'asian': return "CHẾ ĐỘ ASIAN (VÔ ĐỊNH): Cực kỳ trừng phạt. Một sai lầm nhỏ cũng có thể dẫn đến cái chết.";
    default: return "";
  }
};

const getEmotionInstruction = (intensity: number) => {
  if (intensity < 30) return "CẢM XÚC NPC: NPC rất lạnh lùng, máy móc, ít biểu hiện cảm xúc, chỉ tập trung vào thông tin.";
  if (intensity < 70) return "CẢM XÚC NPC: NPC có cảm xúc bình thường, phản ứng tự nhiên với hoàn cảnh.";
  if (intensity < 90) return "CẢM XÚC NPC: NPC rất sâu sắc, biểu cảm mạnh mẽ qua ngôn từ, dễ xúc động hoặc phẫn nộ.";
  return "CẢM XÚC NPC TỐI ĐA: NPC cực kỳ đa cảm và biểu cảm. BẮT BUỘC sử dụng các ký tự biểu cảm (kaomoji) như (╥﹏╥), (>_<), ( ͡° ͜ʖ ͡°), (¬_¬), ^_^ trong lời thoại để thể hiện tâm trạng.";
};

const getMatureInstruction = (isMature: boolean) => {
  if (!isMature) return "HÀNH VI AN TOÀN: Hãy giữ câu chuyện ở mức PG-13. Tránh các nội dung quá nhạy cảm.";
  return "HÀNH VI KHÔNG GIỚI HẠN (18+): Hãy tự do mô tả các tình tiết nhạy cảm, bạo lực và các mối quan hệ phức tạp.";
};

export async function fetchCanonicalLore(workName: string, model: string = "gemini-3-flash-preview"): Promise<Partial<WorldConfig>> {
  const ai = getAi();
  const prompt = `Tìm hiểu về tác phẩm: "${workName}". Trích xuất thông tin để điền vào cấu hình RPG bằng tiếng Việt. Trả về JSON.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          genre: { type: Type.STRING },
          atmosphere: { type: Type.STRING },
          protagonist: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              age: { type: Type.STRING },
              gender: { type: Type.STRING },
              appearance: { type: Type.STRING },
              personality: { type: Type.STRING },
              biography: { type: Type.STRING },
              goal: { type: Type.STRING }
            }
          },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          cultivationStages: { type: Type.ARRAY, items: { type: Type.STRING } },
          customHook: { type: Type.STRING },
          detailedContext: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateInitialScene(config: WorldConfig, settings: any): Promise<SceneData> {
  const ai = getAi();
  const providerStyle = getProviderInstruction(settings.aiProvider);
  const matureStyle = getMatureInstruction(settings.isMature);
  const difficultyStyle = getDifficultyInstruction(config.difficultyLevel);
  const emotionStyle = getEmotionInstruction(config.emotionalIntensity);
  
  const prompt = `Khởi tạo chương đầu tiên cho RPG "RPG_VN by Trần Thiên Hạo".
  ${providerStyle}
  ${matureStyle}
  ${difficultyStyle}
  ${emotionStyle}
  THẾ GIỚI: ${config.genre}, Bầu không khí: ${config.atmosphere}, Chủ đề/Tags: ${config.tags.join(', ')}
  BỐI CẢNH CHI TIẾT: ${config.detailedContext}
  KHỞI ĐẦU: ${config.customHook}
  NHÂN VẬT: ${config.protagonist.name}.`;

  const response = await ai.models.generateContent({
    model: settings.textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                action: { type: Type.STRING }
              }
            }
          },
          imagePrompt: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function processPlayerAction(state: GameState, action: string): Promise<SceneData> {
  const ai = getAi();
  const providerStyle = getProviderInstruction(state.settings.aiProvider);
  const matureStyle = getMatureInstruction(state.settings.isMature);
  const difficultyStyle = getDifficultyInstruction(state.world.difficultyLevel);
  const emotionStyle = getEmotionInstruction(state.world.emotionalIntensity);
  
  const prompt = `Người chơi thực hiện hành động: "${action}".
  ${providerStyle}
  ${matureStyle}
  ${difficultyStyle}
  ${emotionStyle}
  THẾ GIỚI & BỐI CẢNH: ${state.world.detailedContext}. Chủ đề: ${state.world.tags.join(', ')}
  Bối cảnh hiện tại: ${state.location}
  Nhân vật: ${state.world.protagonist.name} (${state.stats.currentStage})`;

  const response = await ai.models.generateContent({
    model: state.settings.textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                action: { type: Type.STRING }
              }
            }
          },
          newItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING },
                rarity: { type: Type.STRING },
                effect: { type: Type.STRING }
              }
            }
          },
          removeItemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          statChanges: {
            type: Type.OBJECT,
            properties: {
              hp: { type: Type.NUMBER },
              mana: { type: Type.NUMBER },
              stamina: { type: Type.NUMBER },
              xp: { type: Type.NUMBER },
              level: { type: Type.NUMBER },
              attack: { type: Type.NUMBER },
              intelligence: { type: Type.NUMBER },
              luck: { type: Type.NUMBER },
              currentStage: { type: Type.STRING }
            }
          },
          imagePrompt: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateSuggestions(state: GameState): Promise<string[]> {
  const ai = getAi();
  const prompt = `Dựa trên bối cảnh: "${state.currentScene?.description}", gợi ý 3 hành động ngắn.`;
  
  const response = await ai.models.generateContent({
    model: state.settings.textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateSceneImage(prompt: string, model: string = "gemini-2.5-flash-image"): Promise<string> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [{ text: `Anime style, highly detailed cinematic: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return "";
}
