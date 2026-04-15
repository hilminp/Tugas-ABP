<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set your Merchant Server Key
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        // Set to Development/Sandbox Environment (default). Set to true for Production Environment (accept real transaction).
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        // Set sanitization on (default)
        Config::$isSanitized = true;
        // Set 3DS transaction for credit card to true
        Config::$is3ds = true;
    }

    public function getToken(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'order_id' => 'string'
        ]);

        $orderId = $request->order_id ?? 'ORDER-' . time() . '-' . uniqid();

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $request->amount,
            ],
            'customer_details' => [
                'first_name' => $request->user()->name ?? 'Pengguna',
                'email' => $request->user()->email ?? 'user@example.com',
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            return response()->json([
                'status' => 'success',
                'snap_token' => $snapToken,
                'order_id' => $orderId
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function verifySuccess(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->update(['is_premium' => true]);
            return response()->json([
                'status' => 'success',
                'message' => 'Account upgraded to premium!',
                'user' => $user
            ]);
        }
        return response()->json(['error' => 'Unauthorized'], 401);
    }
}
