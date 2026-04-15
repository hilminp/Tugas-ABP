<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    /**
     * Memulai chatbot dari node awal.
     */
    public function start(): JsonResponse
    {
        return response()->json($this->getNodeResponse($this->getStartNode()));
    }

    /**
     * Mengembalikan node berikutnya berdasarkan opsi yang dipilih user.
     */
    public function next(Request $request): JsonResponse
    {
        $selectedOption = strtolower((string) $request->input('option', ''));

        if (!$this->nodeExists($selectedOption)) {
            return response()->json($this->getNodeResponse($this->getStartNode()));
        }

        return response()->json($this->getNodeResponse($selectedOption));
    }

    /**
     * Me-reset chatbot ke node awal.
     */
    public function reset(): JsonResponse
    {
        return response()->json($this->getNodeResponse($this->getStartNode()));
    }

    /**
     * Mengambil isi flow chatbot dari file config.
     *
     * @return array<string, array{text: string, options: array<int, string>}>
     */
    private function getFlow(): array
    {
        return config('chatbot.flow', []);
    }

    /**
     * Mengambil key node awal chatbot.
     */
    private function getStartNode(): string
    {
        return config('chatbot.start_node', 'start');
    }

    /**
     * Mengecek apakah node yang diminta tersedia di flow chatbot.
     */
    private function nodeExists(string $node): bool
    {
        return array_key_exists($node, $this->getFlow());
    }

    /**
     * Menyusun payload JSON agar konsisten untuk frontend.
     *
     * @return array{text: string, options: array<int, string>}
     */
    private function getNodeResponse(string $node): array
    {
        $flow = $this->getFlow();
        $fallbackNode = $this->getStartNode();
        $chatNode = $flow[$node] ?? $flow[$fallbackNode] ?? ['text' => '', 'options' => []];

        return [
            'text' => $chatNode['text'],
            'options' => $chatNode['options'],
        ];
    }
}
