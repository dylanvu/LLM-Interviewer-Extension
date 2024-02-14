// import axios for API calls to the leetcode website
import Axios from "axios";
import { Problem, FilterOptions } from "../interfaces/leetcodeInterfaces";
import { getRandomInt } from "../util/util";

const leetcodeApiUrl = "https://leetcode.com/api/problems/all/";
const leetcodeProblemUrlBase = "https://leetcode.com/problems/";

/**
 * API call to get all questions, no filtering
 * @returns 
 */
export async function getAllProblems(): Promise<Problem[]> {
    // make api request for problems
    const res = await Axios.get(leetcodeApiUrl);

    const allProblems = res.data.stat_status_pairs;

    // parse through all problems and create a list
    // TODO: create interface for problem
    return allProblems.map((problem: any): Problem => {
        const stat = problem.stat;
        const id = stat.question_id;
        const title = stat.question__title;
        const slug = stat.question__title_slug;
        const url = `${leetcodeProblemUrlBase}${slug}/`; // ex: https://leetcode.com/problems/two-sum/
        const difficulty: number = problem.difficulty.level;
        const paid = problem.paid_only;

        const strDifficulty = difficulty === 3 ? 'Hard' : difficulty === 2 ? 'Medium' : 'Easy';

        // create the object
        return {
            id: id,
            title: title,
            url: url,
            titleSlug: slug,
            difficulty: strDifficulty,
            paid: paid
        }
    });
}

/**
 * Generate a new leetcode problem by calling the api
 * @param filterOptions optional filtering options
 * @returns an embed object with the new problem
 */
export async function generateNewProblem(filterOptions?: FilterOptions) {
    console.log("Sending a new problem");
    // make the api call
    const problems = await getAllProblems();
    let filtered: Problem[] = [];

    // default filtering options
    if (!filterOptions) {
        // filter out only free problems
        filtered = problems.filter((problem) => {
            return !problem.paid;
        });
    } else {
        // filter based on inputted options
        filtered = problems.filter((problem) => {
            return filterOptions.difficulty.has(problem.difficulty) && problem.paid === filterOptions.paid;
        })
    }
    if (filtered.length === 0) {
        // TODO: send a "no valid problem found" embed
        console.error("no valid problem");
        return;
    }
    // generate a random number
    const randInt = getRandomInt(filtered.length - 1);
    // get problem
    const today = filtered.at(randInt);
    if (!today) {
        console.error("error finding random problem");
    } else {
        console.log(today.url)
    }
    return;
}