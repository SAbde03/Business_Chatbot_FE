import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // Here you would typically call an AI service or your own logic
    // This is just a simple echo response for demonstration
    const response = `I received your message: "${message}". This is a simulated response.`

    return NextResponse.json({ response })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while processing your message.' },
      { status: 500 }
    )
  }
}