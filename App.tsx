
import React, { useState, useEffect, useCallback } from 'react';
import type { Topic, QuizState, BattleState, BattlePlayer, TwentyQuestionsState, TwentyQuestionsHistoryItem } from './types.ts';
import * as geminiService from './services/geminiService.ts';
import TopicList from './components/TopicList.tsx';
import PromptEditor from './components/PromptEditor.tsx';
import QuizView from './components/QuizView.tsx';
import BattleView from './components/BattleView.tsx';
import TwentyQuestionsView from './components/TwentyQuestionsView.tsx';
import { LogoIcon } from './components/icons.tsx';

type ViewMode = 'editor' | 'quiz' | 'welcome' | 'battle' | 'twenty-questions';
type EditorLoadingAction = 'optimize' | 'review' | 'suggest' | null;

const WelcomeScreen = () => (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-gray-900/80 border border-gray-800 rounded-lg shadow-2xl">
        <LogoIcon className="h-20 w-20 text-cyan-400 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Chào mừng đến với ABAII Prompt&Play</h2>
        <p className="text-lg text-gray-400 max-w-md">Chọn một mục từ thanh bên để bắt đầu, hoặc tạo một chủ đề mới để khám phá sức mạnh của AI.</p>
    </div>
);


const App: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [promptReview, setPromptReview] = useState('');
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
    const [view, setView] = useState<ViewMode>('welcome');
    const [quizState, setQuizState] = useState<QuizState | null>(null);
    const [battleState, setBattleState] = useState<BattleState | null>(null);
    const [twentyQuestionsState, setTwentyQuestionsState] = useState<TwentyQuestionsState>({
        status: 'idle',
        secretWord: '',
        history: [],
        questionsLeft: 20,
        gameResult: null,
        error: null,
    });
    const [editorLoadingAction, setEditorLoadingAction] = useState<EditorLoadingAction>(null);
    
    useEffect(() => {
        const initialTopics: Topic[] = [
            { id: '1', name: 'Viết tiếp câu chuyện từ nhân vật bạn yêu thích' },
            { id: '2', name: 'Phát minh một thứ có thể thay đổi thế giới' },
            { id: '3', name: 'Miêu tả một thế giới nơi con người có thêm một giác quan mới' },
        ];
        setTopics(initialTopics);
    }, []);

    const handleSelectTopic = (topic: Topic) => {
        setView('editor');
        setSelectedTopic(topic);
        setBattleState(null);
        setCurrentPrompt('');
        setOptimizedPrompt('');
        setPromptReview('');
        setSuggestedPrompts([]);
        setEditorLoadingAction(null);
    };

    const handleAddTopic = (topicName: string) => {
        const newTopic: Topic = { id: Date.now().toString(), name: topicName };
        setTopics([newTopic, ...topics]);
        handleSelectTopic(newTopic);
    };

    const handleGenerateRandomTopic = async () => {
        setIsGeneratingTopic(true);
        const randomTopicName = await geminiService.generateRandomTopic();
        if (randomTopicName && !randomTopicName.startsWith("Lỗi")) {
            handleAddTopic(randomTopicName);
        }
        setIsGeneratingTopic(false);
    };

    const handleOptimize = async () => {
        if (!selectedTopic || !currentPrompt) return;
        setEditorLoadingAction('optimize');
        setOptimizedPrompt('');
        setPromptReview('');
        setSuggestedPrompts([]);
        const result = await geminiService.optimizePrompt(selectedTopic.name, currentPrompt);
        setOptimizedPrompt(result);
        setEditorLoadingAction(null);
    };

    const handleReview = async () => {
        if (!selectedTopic || !currentPrompt) return;
        setEditorLoadingAction('review');
        setOptimizedPrompt('');
        setPromptReview('');
        setSuggestedPrompts([]);
        const result = await geminiService.reviewPrompt(selectedTopic.name, currentPrompt);
        setPromptReview(result);
        setEditorLoadingAction(null);
    };

    const handleSuggestPrompts = async () => {
        if (!selectedTopic) return;
        setEditorLoadingAction('suggest');
        setOptimizedPrompt('');
        setPromptReview('');
        setSuggestedPrompts([]);
        const result = await geminiService.suggestPrompts(selectedTopic.name);
        setSuggestedPrompts(result);
        setEditorLoadingAction(null);
    };
    
    const handleStartQuiz = () => {
        setView('quiz');
        setSelectedTopic(null);
        setBattleState(null);
        if(!quizState || quizState.status === 'answered'){
            handleNewQuestion();
        }
    };

    const handleNewQuestion = useCallback(async () => {
        setIsLoading(true);
        setQuizState(null);
        const question = await geminiService.generateQuizQuestion();
        setQuizState({
            question,
            userAnswer: '',
            feedbackText: '',
            status: 'asking',
            imageUrl: null,
        });
        setIsLoading(false);
    }, []);

    const handleAnswerSubmit = async (answer: string) => {
        if (!quizState) return;
        setIsLoading(true);
    
        const evalResult = await geminiService.evaluateQuizAnswer(quizState.question, answer);
        
        let imageUrl: string | null = null;
        if (evalResult.imagePrompt) {
            const imageBytes = await geminiService.generateQuizImage(evalResult.imagePrompt);
            if (imageBytes) {
                imageUrl = `data:image/jpeg;base64,${imageBytes}`;
            }
        }
    
        setQuizState({
            ...quizState,
            userAnswer: answer,
            feedbackText: evalResult.feedback,
            status: 'answered',
            imageUrl: imageUrl,
        });
        
        setIsLoading(false);
    };

    // --- Battle Mode Handlers ---
    const handleStartBattle = () => {
        setView('battle');
        setSelectedTopic(null);
        setBattleState({
            status: 'configuring',
            topic: '',
            players: []
        });
    };

    const handleBattleConfigured = async (playerCount: number) => {
        setIsLoading(true);
        const topic = await geminiService.generateBattleTopic();
        const players: BattlePlayer[] = Array.from({ length: playerCount }, (_, i) => ({
            id: i + 1,
            prompt: '',
            score: 0,
            feedback: ''
        }));
        setBattleState({
            status: 'writing',
            topic,
            players
        });
        setIsLoading(false);
    };
    
    const handleUpdatePlayerPrompt = (playerId: number, prompt: string) => {
        if (!battleState) return;
        setBattleState({
            ...battleState,
            players: battleState.players.map(p => p.id === playerId ? { ...p, prompt } : p)
        });
    };

    const handleEvaluateBattle = async () => {
        if (!battleState) return;
        setIsLoading(true);
        setBattleState({ ...battleState, status: 'evaluating' });

        const promptsToEvaluate = battleState.players.map(({id, prompt}) => ({id, prompt}));
        const results = await geminiService.evaluateBattlePrompts(battleState.topic, promptsToEvaluate);

        const updatedPlayers = battleState.players.map(player => {
            const result = results.find(r => r.playerId === player.id);
            return {
                ...player,
                score: result?.score ?? 0,
                feedback: result?.feedback ?? 'Không có nhận xét.'
            };
        }).sort((a, b) => b.score - a.score);


        setBattleState({
            ...battleState,
            status: 'results',
            players: updatedPlayers
        });
        setIsLoading(false);
    };

    // --- 20 Questions Handlers ---
    const handleStartTwentyQuestions = () => {
        setView('twenty-questions');
        setSelectedTopic(null);
        handleResetTwentyQuestions();
    };

    const handleResetTwentyQuestions = useCallback(async () => {
        setTwentyQuestionsState({
            status: 'starting',
            secretWord: '',
            history: [],
            questionsLeft: 20,
            gameResult: null,
            error: null,
        });
        const secret = await geminiService.startTwentyQuestionsGame();
        if (secret && secret !== "Lỗi") {
            setTwentyQuestionsState(s => ({ ...s, status: 'playing', secretWord: secret }));
        } else {
            setTwentyQuestionsState(s => ({ ...s, status: 'idle', error: "Không thể bắt đầu trò chơi. Vui lòng thử lại." }));
        }
    }, []);

    const handleAskTwentyQuestion = async (question: string) => {
        setTwentyQuestionsState(s => ({ ...s, status: 'evaluating' }));
        const answer = await geminiService.answerTwentyQuestions(twentyQuestionsState.secretWord, twentyQuestionsState.history, question);
        
        const questionHistoryItem: TwentyQuestionsHistoryItem = { type: 'question', text: question, answer: answer };
        
        const newQuestionsLeft = twentyQuestionsState.questionsLeft - 1;
        const questionsAskedCount = 20 - newQuestionsLeft;

        let updatedHistory = [...twentyQuestionsState.history, questionHistoryItem];
        
        const hintMilestones = [5, 10, 15, 19];
        if (hintMilestones.includes(questionsAskedCount) && newQuestionsLeft > 0) {
            const hintText = await geminiService.generateTwentyQuestionsHint(
                twentyQuestionsState.secretWord, 
                updatedHistory,
                questionsAskedCount
            );
            if (hintText) {
                const hintHistoryItem: TwentyQuestionsHistoryItem = { type: 'hint', text: hintText };
                updatedHistory.push(hintHistoryItem);
            }
        }
        
        const newState: Partial<TwentyQuestionsState> = {
            status: newQuestionsLeft > 0 ? 'playing' : 'finished',
            history: updatedHistory,
            questionsLeft: newQuestionsLeft,
        };

        if (newQuestionsLeft <= 0) {
            newState.gameResult = 'lose';
        }

        setTwentyQuestionsState(s => ({ ...s, ...newState }));
    };

    const handleFinalGuess = async (guess: string) => {
        setTwentyQuestionsState(s => ({ ...s, status: 'evaluating' }));
        const isCorrect = await geminiService.evaluateTwentyQuestionsGuess(twentyQuestionsState.secretWord, guess);

        const newHistoryItem: TwentyQuestionsHistoryItem = { type: 'guess', text: guess };
        setTwentyQuestionsState(s => ({
            ...s,
            status: 'finished',
            history: [...s.history, newHistoryItem],
            gameResult: isCorrect ? 'win' : 'lose',
        }));
    };

    const renderMainContent = () => {
        switch (view) {
            case 'editor':
                if (selectedTopic) {
                    return (
                        <PromptEditor
                            topic={selectedTopic}
                            prompt={currentPrompt}
                            onPromptChange={setCurrentPrompt}
                            optimizedPrompt={optimizedPrompt}
                            promptReview={promptReview}
                            loadingAction={editorLoadingAction}
                            onOptimize={handleOptimize}
                            onReview={handleReview}
                            suggestedPrompts={suggestedPrompts}
                            onSuggestPrompts={handleSuggestPrompts}
                            onPromptSelect={setCurrentPrompt}
                        />
                    );
                }
                return <WelcomeScreen />;
            case 'quiz':
                return (
                    <QuizView
                        quizState={quizState}
                        isLoading={isLoading}
                        onAnswerSubmit={handleAnswerSubmit}
                        onNewQuestion={handleNewQuestion}
                    />
                );
            case 'battle':
                return (
                    <BattleView
                        battleState={battleState}
                        isLoading={isLoading}
                        onConfigure={handleBattleConfigured}
                        onPromptChange={handleUpdatePlayerPrompt}
                        onEvaluate={handleEvaluateBattle}
                        onReset={handleStartBattle}
                    />
                );
            case 'twenty-questions':
                 return (
                    <TwentyQuestionsView
                        gameState={twentyQuestionsState}
                        onAsk={handleAskTwentyQuestion}
                        onGuess={handleFinalGuess}
                        onReset={handleResetTwentyQuestions}
                    />
                 );
            case 'welcome':
            default:
                return <WelcomeScreen />;
        }
    };

    return (
        <div className="flex h-screen text-gray-200">
            <TopicList
                topics={topics}
                selectedTopic={selectedTopic}
                onSelectTopic={handleSelectTopic}
                onAddTopic={handleAddTopic}
                onGenerateRandomTopic={handleGenerateRandomTopic}
                onStartQuiz={handleStartQuiz}
                onStartBattle={handleStartBattle}
                onStartTwentyQuestions={handleStartTwentyQuestions}
                isGenerating={isGeneratingTopic}
            />
            <main className="flex-1 flex flex-col relative p-4 overflow-y-auto">
                {renderMainContent()}
            </main>
        </div>
    );
};

export default App;