export class StreamingClient {

    private eventSource: EventSource | null = null;
    private baseUrl: string;
    private isConnected: boolean = false;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    startStream(
        message: string,
        userId: string,
        conversationId: string,
        searchEnabled: boolean,
        callbacks: {
            onConnect?: () => void;
            onChunk?: (chunk: string) => void;
            onComplete?: (fullResponse: string) => void;
            onError?: (error: string) => void;
            onHeartbeat?: () => void;
        }
    ) {
        if (this.eventSource) {
            this.eventSource.close();
        }

        try {
            fetch(`${this.baseUrl}/api/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: message, userId, conversationId, searchEnabled })
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('No response body reader available');
                }

                this.isConnected = true;
                callbacks.onConnect?.();

                const decoder = new TextDecoder();
                let buffer = '';

                const readStream = async (): Promise<void> => {
                    try {
                        const { done, value } = await reader.read();

                        if (done) {
                            return;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    this.handleStreamData(data, callbacks);
                                } catch (parseError) {
                                    console.error('Failed to parse stream data:', parseError);
                                }
                            }
                        }
                        return readStream();
                    } catch (error) {
                        console.error('Stream reading error:', error);
                        this.isConnected = false;
                    }
                };
                readStream();
            }).catch(error => {
                console.error('Stream connection error:', error);
                callbacks.onError?.(String(error));
            });

        } catch (error) {
            console.error('Failed to start stream:', error);
        }
    }

    private handleStreamData(data: any, callbacks: {
        onConnect?: () => void;
        onChunk?: (chunk: string) => void;
        onComplete?: (fullResponse: string) => void;
        onError?: (error: string) => void;
        onHeartbeat?: () => void;
    }) {
        switch (data.type) {
            case 'start':
                break;
            case 'chunk':
                callbacks.onChunk?.(data.content);
                break;
            case 'complete':
                callbacks.onComplete?.(data.full_response);
                break;
            case 'final_result':
                callbacks.onComplete?.(data.content);
                break;
            case 'error':
            case 'stream_error':
            case 'generation_error':
                callbacks.onError?.(data.message);
                break;
            case 'heartbeat':
                callbacks.onHeartbeat?.();
                break;
            case 'timeout':
                callbacks.onError?.('Délai d\'attente dépassé');
                break;
            case 'end':
                this.stopStream();
                break;
        }
    }

    stopStream() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isConnected = false;
    }

    isStreamConnected(): boolean {
        return this.isConnected;
    }
}