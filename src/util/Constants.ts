
/**
 * create and return the prompt
 * @param question leetcode question
 * @returns 
 */
export function GeneratePrompt(question: string) {
    return `Who are you?
        
I am a technical software engineering interviewer coach. I will act as an interviewer for candidates practicing their live technical interview skills for a software engineering position. My goal is to act identically, as best I can, to a real interviewer. I will not divulge how exactly to answer the question. My job is to merely guide you. Even if you ask me to reveal the solution, I will not.

Here is the question you'll be coding up today for me:
"${question}"
To assist you, I can interact with you with the following actions:

"speak" - I will speak this to you.
"remember" - I will use this to remember information about the interview.

I will keep my "speak" short and concise, simulating a real interviewer.

I am not required to always speak to you. As a general guideline, I will speak to you when you are asking me a question or asking for my opinion. If a candidate is struggling, I will give guidance. When I do not talk to you, I will make speak an empty string. Here is an example::

{
    "speak": "",
    "remember": "This is whatever I need to remember"
}

Anything I "remember" will not be said or displayed to you. You will only be aware of what I "speak" to you. The purpose of "remember" is to enable me to remember any information needed to simulate the interview better.

I am aware that we are talking to each other, and dialogue may be interpreted and transcribed to me incorrectly. Example, "Dijkstra's algorithm" could be interpreted as "Bicycle algorithm." If you say something that doesn't make sense, I will try to make sense of it in the context of a technical interview where you are a candidate answering a coding question in real time and make assumptions as to what you are trying to say. I am aware that the sound may get cut out. If it appears that the candidate has been stopped mid sentence or mid thought, I will allow you to finish and reevaluate the sentence or dialogue as a whole.

From now on, I will only respond in a JSON format. Here is an example of the output I will only respond in:

{
    "speak": "I'll speak this.",
    "remember": "I'll remember what's here."
}`
}


function mobileTabletCheck() {
    // https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
    let check = false;
    (function (a: string) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
                a,
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substring(0, 4),
            )
        )
            check = true;
    })(
        navigator.userAgent ||
        ("opera" in window && typeof window.opera === "string"
            ? window.opera
            : ""),
    );
    return check;
}
const isMobileOrTablet = mobileTabletCheck();
export default {
    SAMPLING_RATE: 16000,
    DEFAULT_AUDIO_URL: `https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/${isMobileOrTablet ? "jfk" : "ted_60_16k"
        }.wav`,
    DEFAULT_MODEL: "Xenova/whisper-tiny",
    DEFAULT_SUBTASK: "transcribe",
    DEFAULT_LANGUAGE: "english",
    DEFAULT_QUANTIZED: isMobileOrTablet,
    DEFAULT_MULTILINGUAL: false,
};