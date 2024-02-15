export type MessageAction = "problem" | "scrapingError" | "scrapeProblem" | "domStateChange" | "log"

export interface ChromeMessage {
    action: MessageAction,
    [x: string]: any
}