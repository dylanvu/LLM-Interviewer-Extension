export type MessageAction = "problem" | "scrapingError" | "scrapeProblem" | "domStateChange"

export interface ChromeMessage {
    action: MessageAction,
    [x: string]: any
}