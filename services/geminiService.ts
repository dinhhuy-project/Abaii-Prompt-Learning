import { GoogleGenAI, Type } from "@google/genai";
import type { TwentyQuestionsHistoryItem } from '../types.ts';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface BattleEvaluationResult {
    playerId: number;
    score: number;
    feedback: string;
}

export interface QuizEvaluationResult {
    feedback: string;
    imagePrompt: string;
}

export const generateRandomTopic = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Tạo một chủ đề ngẫu nhiên. Chủ đề nên mở ra không gian cho việc kể chuyện, tưởng tượng, hoặc các tình huống thực tế trong cuộc sống. Ví dụ: 'Bạn sẽ làm gì nếu có thể du hành thời gian?', 'Thiết kế một môn học mới cho trường của bạn', 'Viết một câu chuyện kinh dị chỉ trong ba câu', 'Em gái của bạn hôm nay muốn ăn một món tráng miệng'. Chỉ trả về tên chủ đề.",
            config: {
                temperature: 1.0,
                maxOutputTokens: 50,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim().replace(/"/g, ''); // Clean up potential quotes
    } catch (error) {
        console.error("Error generating random topic:", error);
        return "Lỗi khi tạo chủ đề. Vui lòng thử lại.";
    }
};

export const generateBattleTopic = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Tạo một chủ đề thi đấu dưới dạng một đoạn văn mô tả một tình huống hoặc một câu đố mẹo. Đoạn văn phải hoàn chỉnh và đầy đủ chi tiết để người chơi có thể dựa vào đó viết một prompt để giải quyết vấn đề. Ví dụ: 'Bạn là một nhà khảo cổ học vừa khám phá ra một căn hầm cổ bị niêm phong. Bên trong, có ba cánh cửa. Một bản khắc trên tường ghi: \"Một cánh cửa dẫn đến kho báu, một dẫn đến cạm bẫy chết người, và một dẫn ra ngoài an toàn. Mỗi cánh cửa được canh giữ bởi một pho tượng biết nói. Tượng canh cửa an toàn luôn nói thật, tượng canh cửa kho báu luôn nói dối, và tượng canh cửa cạm bẫy lúc nói thật lúc nói dối. Bạn chỉ được hỏi một câu hỏi duy nhất cho một trong ba pho tượng.\" Hãy tạo ra những tình huống tương tự.' Chỉ trả về đoạn văn mô tả tình huống.",
            config: {
                temperature: 1.0,
                maxOutputTokens: 500,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error generating battle topic:", error);
        return "Lỗi khi tạo chủ đề thi đấu. Vui lòng thử lại.";
    }
};


export const optimizePrompt = async (topic: string, userPrompt: string): Promise<string> => {
    const fullPrompt = `Chủ đề: "${topic}"\nCâu của bạn học sinh: "${userPrompt}"\n\nHãy giúp bạn ấy viết lại câu này thật hay và sáng tạo nhé! Chỉ trả về câu đã được viết lại.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
             config: {
                systemInstruction: "Bạn là một người bạn AI thân thiện, giúp các bạn học sinh cải thiện câu văn của mình. Hãy viết lại câu của bạn ấy một cách hay hơn, giàu trí tưởng tượng hơn nhưng vẫn giữ ý chính. Hãy dùng từ ngữ đơn giản, dễ hiểu.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error optimizing prompt:", error);
        return "Lỗi khi tối ưu hóa prompt. Vui lòng thử lại.";
    }
};

export const reviewPrompt = async (topic: string, userPrompt: string): Promise<string> => {
    const fullPrompt = `Chủ đề: "${topic}"\nCâu của bạn học sinh: "${userPrompt}"\n\nHãy nhận xét câu này một cách thật thân thiện. Bắt đầu bằng việc khen một điểm hay. Sau đó, gợi ý một hoặc hai điều nhỏ để câu văn trở nên thú vị hơn nữa. Dùng ngôn ngữ tích cực và dễ hiểu nhé.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "Bạn là một người bạn AI tốt bụng, luôn động viên và khuyến khích các bạn học sinh. Nhiệm vụ của bạn là đưa ra những lời khen và góp ý nhẹ nhàng để giúp câu văn của các bạn ấy tốt hơn.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error reviewing prompt:", error);
        return "Lỗi khi nhận xét prompt. Vui lòng thử lại.";
    }
};

export const suggestPrompts = async (topic: string): Promise<string[]> => {
    const fullPrompt = `Với chủ đề "${topic}", hãy tạo một danh sách gồm 3 prompt tối ưu và đa dạng. Các prompt này phải sáng tạo, rõ ràng, và có cấu trúc tốt để AI có thể hiểu và trả lời một cách hiệu quả nhất. Các prompt nên khác nhau về phong cách và mục tiêu.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "Bạn là một chuyên gia về prompt engineering. Nhiệm vụ của bạn là tạo ra các prompt mẫu chất lượng cao.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        prompts: {
                            type: Type.ARRAY,
                            description: "Một danh sách gồm 3 prompt gợi ý.",
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ['prompts']
                }
            }
        });
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.prompts || [];
    } catch (error) {
        console.error("Error suggesting prompts:", error);
        return ["Đã xảy ra lỗi khi tạo gợi ý. Vui lòng thử lại."];
    }
};

export const generateQuizQuestion = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Tạo một câu đố vừa giải trí vừa thử thách trí tuệ cho học sinh từ lớp 6 đến lớp 12. Câu đố có thể là một câu hỏi mẹo, một câu đố logic, hoặc một câu hỏi kiến thức phổ thông thú vị. Chỉ trả về câu đố.",
            config: {
                temperature: 0.9,
                 thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating quiz question:", error);
        return "Lỗi khi tạo câu hỏi quiz. Vui lòng thử lại.";
    }
};

export const evaluateQuizAnswer = async (question: string, answer: string): Promise<QuizEvaluationResult> => {
    const fullPrompt = `Câu đố: "${question}"\nCâu trả lời của bạn học sinh: "${answer}"\n\nHãy thực hiện 2 việc:\n1. Đưa ra phản hồi về câu trả lời. Dù đúng hay sai, hãy luôn động viên. Nếu sai, giải thích đáp án đúng một cách đơn giản, vui vẻ.\n2. Tạo một câu prompt ngắn gọn (bằng tiếng Anh) để một AI tạo ảnh có thể vẽ một hình minh họa cho đáp án ĐÚNG của câu đố. Prompt này nên mô tả một cảnh đơn giản, tươi sáng và nghệ thuật. \n\nHãy trả về kết quả dưới dạng JSON theo schema đã cung cấp.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "Bạn là một người bạn AI vui vẻ, đang chơi đố vui với học sinh. Hãy đưa ra phản hồi thật nhẹ nhàng và khích lệ, đồng thời tạo ra một prompt tạo ảnh nghệ thuật liên quan đến câu trả lời đúng.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        feedback: {
                            type: Type.STRING,
                            description: "Phản hồi bằng tiếng Việt, thân thiện và mang tính xây dựng cho câu trả lời của học sinh."
                        },
                        imagePrompt: {
                            type: Type.STRING,
                            description: "Một prompt bằng tiếng Anh, đơn giản để tạo hình ảnh minh họa cho câu trả lời đúng. Ví dụ: 'A cute cartoon sun wearing sunglasses and smiling'."
                        }
                    },
                    required: ["feedback", "imagePrompt"]
                }
            }
        });
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;
    } catch (error) {
        console.error("Error evaluating quiz answer:", error);
        return {
            feedback: "Lỗi khi đánh giá câu trả lời. Vui lòng thử lại.",
            imagePrompt: "" 
        };
    }
};

export const generateQuizImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `${prompt}, digital art, vibrant colors, simple, for kids, cheerful`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
             return response.generatedImages[0].image.imageBytes;
        }
        throw new Error("No image was generated.");

    } catch (error) {
        console.error("Error generating quiz image:", error);
        return "";
    }
};


export const evaluateBattlePrompts = async (
    topic: string,
    players: { id: number; prompt: string }[]
): Promise<BattleEvaluationResult[]> => {
    const promptsToEvaluate = players.map(p => `- Người chơi ${p.id}: "${p.prompt}"`).join('\n');
    const fullPrompt = `Chủ đề: "${topic}"\n\nĐây là một chủ đề giải đố. Hãy đóng vai một giám khảo công tâm, chấm điểm từng prompt của người chơi dựa trên khả năng giải quyết vấn đề, sự thông minh, sáng tạo và rõ ràng của prompt. Cho điểm theo thang 1-100 và đưa ra nhận xét ngắn gọn, mang tính xây dựng. \n\nCác prompt cần chấm điểm:\n${promptsToEvaluate}\n\nHãy trả về kết quả dưới dạng JSON theo schema đã cung cấp.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "Danh sách kết quả chấm điểm cho mỗi người chơi.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            playerId: {
                                type: Type.NUMBER,
                                description: "ID của người chơi (ví dụ: 1, 2, ...)"
                            },
                            score: {
                                type: Type.NUMBER,
                                description: "Điểm số từ 1 đến 100."
                            },
                            feedback: {
                                type: Type.STRING,
                                description: "Nhận xét mang tính xây dựng về prompt."
                            }
                        },
                        required: ["playerId", "score", "feedback"]
                    }
                }
            }
        });
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;
    } catch (error) {
        console.error("Error evaluating battle prompts:", error);
        return players.map(p => ({
            playerId: p.id,
            score: 0,
            feedback: "Đã xảy ra lỗi khi chấm điểm. Vui lòng thử lại."
        }));
    }
};

// --- 20 Questions Game ---

export const startTwentyQuestionsGame = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Tôi muốn chơi trò 20 câu hỏi. Hãy nghĩ về MỘT đồ vật, con vật, hoặc nhân vật nổi tiếng bất kỳ. Chỉ trả về TÊN của nó, không có thêm bất kỳ lời giải thích nào. Ví dụ: 'Quả chuối', 'Con mèo', 'Albert Einstein'.",
             config: {
                temperature: 1.0,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error starting 20 questions game:", error);
        return "Lỗi";
    }
};

export const answerTwentyQuestions = async (secretWord: string, history: TwentyQuestionsHistoryItem[], newQuestion: string): Promise<string> => {
    const historyText = history.map(h => `Hỏi: ${h.text}\nĐáp: ${h.answer}`).join('\n\n');
    const fullPrompt = `Từ bí mật là: "${secretWord}".\n\nLịch sử hỏi đáp:\n${historyText}\n\nCâu hỏi mới của người chơi: "${newQuestion}"\n\nHãy trả lời câu hỏi mới này.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "Bạn đang chơi trò 20 câu hỏi. Bạn phải giữ bí mật từ khóa. Người chơi sẽ hỏi bạn những câu hỏi có-không để đoán ra từ đó. Bạn chỉ được phép trả lời bằng một trong ba cách sau: 'Có', 'Không', hoặc 'Không thể trả lời'. Đừng đưa ra bất kỳ lời giải thích nào khác.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        answer: {
                            type: Type.STRING,
                            description: "Câu trả lời cho câu hỏi. Phải là một trong các giá trị: 'Có', 'Không', 'Không thể trả lời'."
                        }
                    },
                    required: ["answer"]
                },
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        const jsonResponse = JSON.parse(response.text);
        const answer = jsonResponse.answer || 'Không thể trả lời';
        // Final validation
        if (['Có', 'Không', 'Không thể trả lời'].includes(answer)) {
            return answer;
        }
        return 'Không thể trả lời';

    } catch (error) {
        console.error("Error answering 20 questions:", error);
        return 'Không thể trả lời';
    }
};


export const evaluateTwentyQuestionsGuess = async (secretWord: string, guess: string): Promise<boolean> => {
    const fullPrompt = `Từ bí mật là: "${secretWord}".\n\nNgười chơi đoán rằng đó là: "${guess}".\n\nĐoán này có đúng không?`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                 systemInstruction: "Bạn là giám khảo trong trò chơi 20 câu hỏi. Từ bí mật đã được xác định. Người chơi đã đưa ra một phỏng đoán cuối cùng. Hãy xác định xem phỏng đoán đó có chính xác hay không. Chỉ quan tâm đến sự tương đồng về mặt ý nghĩa, không cần phải chính xác từng từ.",
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isCorrect: {
                            type: Type.BOOLEAN,
                            description: "True nếu người chơi đoán đúng, False nếu đoán sai."
                        }
                    },
                    required: ["isCorrect"]
                 }
            }
        });
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.isCorrect ?? false;
    } catch (error) {
        console.error("Error evaluating 20 questions guess:", error);
        return false;
    }
};
