import axios from "axios";

export async function generateResponse(history: string[]): Promise<string> {
    // obtain the endpoint
    const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;

    if (!endpoint || endpoint.length === 0) {
        throw new Error("Backend endpoint for LLM is undefined");
    }

    // convert the history into an array of text
    const messages = history.map(message => {
        return {
            "text": message
        }
    })

    const res = await axios.post(endpoint, {
        messages: messages
    });

    return res.data;
}