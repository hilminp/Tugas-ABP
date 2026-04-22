<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

class ChatbotController extends Controller
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key');
        $this->model = config('services.groq.model', 'llama-3.1-8b-instant');
    }

    /**
     * Memulai percakapan chatbot AI.
     */
    public function start(): JsonResponse
    {
        Session::forget('chatbot_messages');
        
        $initialMessage = 'Halo! 👋 Aku Sahabat Mental, aku di sini untuk mendengarkanmu.' . "\n\n" . 'Apa yang sedang kamu rasakan saat ini? Kamu boleh cerita apa saja, aku siap menemani dan membantu.';
        
        Session::put('chatbot_messages', json_encode([
            ['role' => 'assistant', 'content' => $initialMessage]
        ]));

        return response()->json([
            'text' => $initialMessage,
            'options' => []
        ]);
    }

    /**
     * Mengirim pesan dan mendapatkan respons dari AI.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $userMessage = trim($request->input('message') ?? $request->input('option') ?? '');
        
        if (empty($userMessage)) {
            return response()->json(['error' => 'Pesan tidak boleh kosong'], 400);
        }

        // Ambil history dari session
        $historyJson = Session::get('chatbot_messages', '[]');
        $messages = json_decode($historyJson, true) ?: [];

        // Proteksi Premium: Batasi 5 chat untuk non-premium
        $user = $request->user();
        if ($user && !$user->is_premium) {
            if ($user->chatbot_usage >= 5) {
                return response()->json([
                    'text' => 'Maaf, kuota chat harian kamu sudah habis. ✨ Upgrade ke Premium untuk ngobrol sepuasnya denganku dan akses fitur eksklusif lainnya!',
                    'options' => ['Lanjut ke Pembayaran']
                ]);
            }
            
            // Increment usage
            $user->increment('chatbot_usage');
        }
        
        // Tambah pesan user
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        try {
            $response = $this->callGroqApi($messages);
            
            // Simpan ke history
            $messages[] = ['role' => 'assistant', 'content' => $response];
            $messages = array_slice($messages, -20); // Max 20 pesan
            Session::put('chatbot_messages', json_encode($messages));

            return response()->json([
                'text' => $response,
                'options' => []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Maaf, terjadi kesalahan. ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memanggil Groq API.
     */
    private function callGroqApi(array $messages): string
    {
        if (empty($this->apiKey)) {
            throw new \Exception('GROQ_API_KEY belum diset di file .env');
        }

        $systemPrompt = [
            'role' => 'system',
            'content' => 'Kamu adalah asisten psikologis yang hangat, empatik, dan suportif. Namamu adalah "Sahabat Mental". Selalu gunakan Bahasa Indonesia.'
        ];

        $fullMessages = array_merge([$systemPrompt], $messages);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json'
        ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => $this->model,
            'messages' => $fullMessages,
            'temperature' => 0.8,
            'max_tokens' => 1024
        ]);

        if (!$response->successful()) {
            $error = $response->json();
            throw new \Exception($error['error']['message'] ?? 'Gagal mengambil respons dari Groq API');
        }

        return $response['choices'][0]['message']['content'] ?? 'Maaf, aku tidak bisa menjawab saat ini.';
    }

    /**
     * Me-reset chatbot ke kondisi awal.
     */
    public function reset(): JsonResponse
    {
        return $this->start();
    }
}
