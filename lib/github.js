import { Octokit } from 'octokit';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

export async function fetchUser(username) {
    try {
        const { data } = await octokit.rest.users.getByUsername({ username });
        return data;
    } catch (err) {
        console.error("Error fetching user:", err);
        return null;
    }
}

export async function fetchUserEvents(username) {
    try {
        const { data } = await octokit.rest.activity.listPublicEventsForUser({
            username,
            per_page: 30
        });
        return data; // returns array of events
    } catch (err) {
        console.error("Error fetching events:", err);
        return [];
    }
}

export async function fetchUserRepos(username) {
    try {
        const { data } = await octokit.rest.repos.listForUser({
            username,
            sort: 'updated',
            per_page: 10
        });
        return data;
    } catch (err) {
        console.error("Error fetching repos:", err);
        return [];
    }
}
