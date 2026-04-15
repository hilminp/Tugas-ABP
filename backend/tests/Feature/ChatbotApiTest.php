<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ChatbotApiTest extends TestCase
{
    #[Test]
    public function it_can_start_the_chatbot(): void
    {
        $response = $this->getJson('/api/chat/start');

        $response->assertOk()->assertExactJson([
            'text' => 'Kamu lagi kenapa?',
            'options' => ['sedih', 'marah', 'overthinking', 'lelah'],
        ]);
    }

    #[Test]
    public function it_can_move_to_the_next_node_using_a_lowercase_option(): void
    {
        $response = $this->postJson('/api/chat/next', [
            'option' => 'sedih',
        ]);

        $response->assertOk()->assertExactJson([
            'text' => 'Aku di sini ya. Kamu nggak sendirian.',
            'options' => ['cerita', 'distraksi'],
        ]);
    }

    #[Test]
    public function it_normalizes_the_selected_option_to_lowercase(): void
    {
        $response = $this->postJson('/api/chat/next', [
            'option' => 'SeDiH',
        ]);

        $response->assertOk()->assertExactJson([
            'text' => 'Aku di sini ya. Kamu nggak sendirian.',
            'options' => ['cerita', 'distraksi'],
        ]);
    }

    #[Test]
    public function it_returns_to_start_when_the_option_is_not_found(): void
    {
        $response = $this->postJson('/api/chat/next', [
            'option' => 'tidak-ada',
        ]);

        $response->assertOk()->assertExactJson([
            'text' => 'Kamu lagi kenapa?',
            'options' => ['sedih', 'marah', 'overthinking', 'lelah'],
        ]);
    }

    #[Test]
    public function it_can_reset_the_chatbot(): void
    {
        $response = $this->postJson('/api/chat/reset');

        $response->assertOk()->assertExactJson([
            'text' => 'Kamu lagi kenapa?',
            'options' => ['sedih', 'marah', 'overthinking', 'lelah'],
        ]);
    }

    #[Test]
    public function terminal_nodes_now_offer_a_payment_redirect_option(): void
    {
        $response = $this->postJson('/api/chat/next', [
            'option' => 'cerita',
        ]);

        $response->assertOk()->assertExactJson([
            'text' => 'Coba cerita ke orang yang kamu percaya ya. Kalau kamu mau lanjut ke sesi yang lebih serius, aku bisa arahin ke pembayaran.',
            'options' => ['lanjut ke pembayaran'],
        ]);
    }

    #[Test]
    public function it_can_return_the_payment_redirection_node(): void
    {
        $response = $this->postJson('/api/chat/next', [
            'option' => 'lanjut ke pembayaran',
        ]);

        $response->assertOk()->assertExactJson([
            'text' => 'Oke, aku arahin kamu ke halaman pembayaran yang sudah tersedia ya.',
            'options' => [],
        ]);
    }
}
