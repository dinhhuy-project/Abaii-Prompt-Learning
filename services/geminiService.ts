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
            contents: "Tạo một chủ đề ngẫu nhiên. Chủ đề này có thể là chủ đề học tập khác nhau (Toán, Văn, Lịch sử, v.v.), tình huống học tập thực tế (Ví dụ: Tạo danh sách kiểm tra bài tập, giải thích lý thuyết khoa học),... . Chỉ trả về tên chủ đề.",
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
            contents: "Tạo một chủ đề thi đấu dưới dạng một yêu cầu thực tế. Chỉ cần ngắn gọn, dễ hiểu để người chơi có thể có nhiều cách để viết một prompt để giải quyết vấn đề. Ví dụ: 'Nay bạn cần phải viết email để thông báo cho thầy cô về danh sách lớp học' Hãy tạo ra một tình huống tương tự. Chỉ trả về đoạn văn mô tả tình huống.",
            config: {
                temperature: 1.0,
                maxOutputTokens: 150,
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
    const fullPrompt = `Chủ đề: "${topic}"\nCâu của người dùng: "${userPrompt}"\n\nHãy giúp người dùng viết lại prompt này theo cấu trúc đầy đủ sau:
    - Mô tả nhiệm vụ: Nêu rõ ràng những gì bạn muốn AI làm.
    - Ngữ cảnh: Cung cấp thông tin nền hoặc dữ liệu có liên quan.
    - Vai trò: Chỉ định vai trò hoặc tính cách mà bạn muốn AI đảm nhận.
    - Yêu cầu: Liệt kê các yêu cầu về phong cách, định dạng hoặc nội dung.
    - Giới hạn: Đặt ra giới hạn về những gì cần loại trừ hoặc tránh.
    - Lập luận: Yêu cầu AI giải thích lý luận hoặc cách tiếp cận của nó.
    Chỉ trả về câu đã được viết lại.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "Bạn là một AI giảng viên chuyên nghiệp, giúp người dùng cải thiện câu văn prompt của mình. Hãy viết lại câu prompt của người dùng một cách hay hơn, đầy đủ nội dung hơn nhưng vẫn giữ ý chính. Hãy dùng từ ngữ đơn giản, dễ hiểu.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error optimizing prompt:", error);
        return "Lỗi khi tối ưu hóa prompt. Vui lòng thử lại.";
    }
};

export const reviewPrompt = async (topic: string, userPrompt: string): Promise<string> => {
    const fullPrompt = `Chủ đề: "${topic}"\nCâu của người dùng: "${userPrompt}"\n\nHãy nhận xét câu prompt này một cách thật thân thiện. Bắt đầu bằng việc khen một điểm hay. Sau đó, hãy khuyên nhủ người dùng dựa trên cấu trúc prompt sau để phát huy tối đa hiệu quả khi giao tiếp với AI:
    - Mô tả nhiệm vụ: Nêu rõ ràng những gì bạn muốn AI làm.
    - Ngữ cảnh: Cung cấp thông tin nền hoặc dữ liệu có liên quan.
    - Vai trò: Chỉ định vai trò hoặc tính cách mà bạn muốn AI đảm nhận.
    - Yêu cầu: Liệt kê các yêu cầu về phong cách, định dạng hoặc nội dung.
    - Giới hạn: Đặt ra giới hạn về những gì cần loại trừ hoặc tránh.
    - Lập luận: Yêu cầu AI giải thích lý luận hoặc cách tiếp cận của nó.
    Dùng ngôn ngữ tích cực và dễ hiểu nhé.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "Bạn là một AI giảng viên tốt bụng và nhiệt tính, luôn động viên và khuyến khích người dùng Nhiệm vụ của bạn là đưa ra những lời khen và góp ý nhẹ nhàng để giúp câu văn của người dùng tốt hơn.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error reviewing prompt:", error);
        return "Lỗi khi nhận xét prompt. Vui lòng thử lại.";
    }
};

export const suggestPrompts = async (topic: string): Promise<string[]> => {
    const fullPrompt = `Với chủ đề "${topic}", hãy tạo một danh sách gồm 3 prompt tối ưu và đa dạng. Các prompt này phải sáng tạo, rõ ràng, và có cấu trúc như sau:
    - Mô tả nhiệm vụ: Nêu rõ ràng những gì bạn muốn AI làm.
    - Ngữ cảnh: Cung cấp thông tin nền hoặc dữ liệu có liên quan.
    - Vai trò: Chỉ định vai trò hoặc tính cách mà bạn muốn AI đảm nhận.
    - Yêu cầu: Liệt kê các yêu cầu về phong cách, định dạng hoặc nội dung.
    - Giới hạn: Đặt ra giới hạn về những gì cần loại trừ hoặc tránh.
    - Lập luận: Yêu cầu AI giải thích lý luận hoặc cách tiếp cận của nó.
    Các prompt nên khác nhau về phong cách và mục tiêu.`;

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
    const fullPrompt = `Chủ đề: "${topic}"\n\nĐây là một cuộc thi đánh giá độ hiểu quả của các câu prompt. Hãy đóng vai một giám khảo công tâm, chấm điểm từng prompt của người chơi dựa trên tiêu chí của cấu trúc sau: 
    - Mô tả nhiệm vụ: Nêu rõ ràng những gì bạn muốn AI làm.
    - Ngữ cảnh: Cung cấp thông tin nền hoặc dữ liệu có liên quan.
    - Vai trò: Chỉ định vai trò hoặc tính cách mà bạn muốn AI đảm nhận.
    - Yêu cầu: Liệt kê các yêu cầu về phong cách, định dạng hoặc nội dung.
    - Giới hạn: Đặt ra giới hạn về những gì cần loại trừ hoặc tránh.
    - Lập luận: Yêu cầu AI giải thích lý luận hoặc cách tiếp cận của nó.
    Cho điểm theo thang 1-100 và đưa ra nhận xét ngắn gọn, mang tính xây dựng. \n\nCác prompt cần chấm điểm:\n${promptsToEvaluate}\n\nHãy trả về kết quả dưới dạng JSON theo schema đã cung cấp.`;

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

export const generateTwentyQuestionsHint = async (secretWord: string, history: TwentyQuestionsHistoryItem[], questionsAskedCount: number): Promise<string> => {
    const historyText = history.filter(h => h.type === 'question').map(h => `Hỏi: ${h.text}\nĐáp: ${h.answer}`).join('\n\n');

    let hintInstruction = '';
    if (questionsAskedCount === 5) {
        hintInstruction = "Gợi ý mức độ 1 (rất mơ hồ): Cho biết danh mục rất chung chung của từ bí mật (ví dụ: 'Nó là một đồ vật', 'Nó là một sinh vật sống', 'Nó là một khái niệm').";
    } else if (questionsAskedCount === 10) {
        hintInstruction = "Gợi ý mức độ 2 (cụ thể hơn): Cho biết một danh mục phụ hoặc một thuộc tính cơ bản (ví dụ: 'Nó là một loại trái cây', 'Nó được tìm thấy trong nhà bếp', 'Nó lớn hơn một chiếc bánh mì').";
    } else if (questionsAskedCount === 15) {
        hintInstruction = "Gợi ý mức độ 3 (khá rõ ràng): Mô tả một đặc điểm, công dụng hoặc màu sắc đặc trưng (ví dụ: 'Nó có màu vàng', 'Nó được dùng để viết', 'Nó có thể bay').";
    } else if (questionsAskedCount === 19) {
        hintInstruction = "Gợi ý mức độ 4 (rất rõ ràng): Đưa ra một gợi ý rất mạnh, gần như tiết lộ câu trả lời (ví dụ: 'Loài khỉ rất thích nó', 'Nó là bạn thân của chuột Jerry').";
    } else {
        return ""; // Should not be called for other counts
    }

    const fullPrompt = `Từ bí mật là: "${secretWord}".\n\nLịch sử hỏi đáp:\n${historyText}\n\nNhiệm vụ: Dựa vào từ bí mật và lịch sử hỏi đáp, hãy tạo một câu gợi ý cho người chơi. \n\n${hintInstruction}\n\nHãy chỉ trả về NỘI DUNG của câu gợi ý, không có tiền tố như 'Gợi ý:'.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "Bạn là người quản trò thông thái trong trò 20 câu hỏi. Nhiệm vụ của bạn là đưa ra một gợi ý hữu ích nhưng không quá lộ liễu, dựa trên mức độ đã được yêu cầu.",
                temperature: 0.7,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return `Gợi ý: ${response.text.trim()}`;
    } catch (error) {
        console.error("Error generating 20 questions hint:", error);
        return "Gợi ý: Không thể tạo gợi ý vào lúc này.";
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