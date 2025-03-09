import type { Config } from "release-it";

const config: Config = {
    git: {
        tagName: "v${version}",
        commitMessage: "chore: release ${version}",
        requireCleanWorkingDir: true,
        requireUpstream: false,
        requireCommits: true,
        requireBranch: "main",
        push: true,
        pushArgs: ["--follow-tags"],
        tag: true,
        tagAnnotation: "Release ${version}",
    },
    github: {
        release: true,
        // releaseName: "Release ${version}",
        // releaseNotes: "Release ${version}",
        // tokenRef: "GITHUB_TOKEN",
    },
    npm: {
        publish: false,
    },
};

await require("release-it").default(config);
