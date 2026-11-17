window.GitGuideContent = {
  lessons: [
    {
      id: "fundamentals",
      title: "Git fundamentals",
      summary: "Build a dependable mental model of repositories, snapshots, commits, and the staging area.",
      sections: [
        { heading: "Overview", text: "Git is a distributed version control system. It records project history as snapshots so you can inspect change, work in parallel, and recover from mistakes. Git is the tool on your computer; GitHub is one service for hosting Git repositories and collaborating around them." },
        { heading: "Mental Model", text: "Think of a repository as a project plus its history. Your working tree is the files you are editing, the index (staging area) is the exact next snapshot you are preparing, and a commit is a saved snapshot connected to earlier commits." },
        { heading: "How It Works", text: "Edit files, inspect the difference, stage only the changes that belong together, then commit with a message describing why they changed. A commit does not automatically include every file in your folder: it records the contents that were staged." },
        { heading: "Under the Hood", text: "Git stores content-addressed objects: blobs for file contents, trees for directory structure, and commits that point to a tree and parent commit(s). A branch is a movable name pointing at a commit. HEAD identifies the current checkout, usually through the current branch." },
        { heading: "Commands", code: "git init\n git status\n git diff\n git add src/\n git diff --staged\n git commit -m \"Add request validation\"", text: "Use status and diff before staging. Review the staged diff separately; that is the content your commit will contain." },
        { heading: "Real-World Backend/Engineering Example", text: "A backend developer changes request validation and adds a focused test. They stage those files together and commit them as one reviewable unit, instead of mixing in unrelated formatting or local configuration." },
        { heading: "Common Mistakes", bullets: ["Assuming git add saves a commit; it only stages content.", "Committing without reviewing the staged diff.", "Treating a branch as a separate copy of every project file.", "Putting unrelated changes into one hard-to-review commit."] },
        { heading: "Practice Exercise", text: "In a disposable repository, edit two files. Stage one file, inspect git diff and git diff --staged, then commit. Confirm that the commit contains only the staged file with git show --stat --oneline HEAD." }
      ]
    },
    {
      id: "daily-workflows",
      title: "Daily workflows",
      summary: "Use a repeatable inspect, edit, test, stage, commit, and sync loop.",
      sections: [
        { heading: "Overview", text: "A good daily Git workflow keeps changes small, visible, and easy for teammates to review. The same habits help when working alone: inspect state often, test before committing, and communicate intent in commit messages." },
        { heading: "Mental Model", text: "Treat each commit as a checkpoint that should make sense on its own. The working tree is your work in progress; the staging area is your proposed checkpoint; the commit history is the sequence of accepted checkpoints." },
        { heading: "How It Works", text: "Start by checking the branch and working tree. Make a focused change, run the relevant tests, review the diff, stage selected paths, review the staged diff, and commit. Fetch remote updates before integrating them; push your branch when it is ready to share." },
        { heading: "Under the Hood", text: "Git compares snapshots rather than storing a simple list of line edits as the canonical history. Diff output is calculated by comparing trees. A commit records a tree and parent reference, while your index holds the next tree you intend to create." },
        { heading: "Commands", code: "git status --short --branch\n git diff\n git add -p\n git diff --cached\n git commit -m \"Handle empty customer names\"\n git fetch origin\n git push -u origin feature/customer-validation", text: "git add -p lets you stage selected hunks when one file contains multiple independent changes." },
        { heading: "Real-World Backend/Engineering Example", text: "Before opening a pull request for a new API endpoint, the developer checks that tests pass, scans for accidentally staged secrets or debug output, and pushes a named feature branch rather than committing directly to the shared default branch." },
        { heading: "Common Mistakes", bullets: ["Using git add . without checking for generated files or secrets.", "Writing vague messages such as update or fix.", "Pushing a branch before checking which remote it targets.", "Ignoring a dirty working tree before switching branches."] },
        { heading: "Practice Exercise", text: "Create two unrelated edits in a sample project. Use git add -p to stage one change, inspect the staged diff, commit it, and leave the other change unstaged. Verify the final state with git status." }
      ]
    },
    {
      id: "branching",
      title: "Branching & integration",
      summary: "Create isolated work, understand merge shapes, and choose merge or rebase deliberately.",
      sections: [
        { heading: "Overview", text: "Branches are lightweight references to commits. They let a team develop a feature or fix without changing the branch another person is using. Integration brings the completed work back together." },
        { heading: "Mental Model", text: "A branch is a label that moves when you create a commit on it; it is not a permanent copy of the repository. Switching branches changes which commit your working tree represents, subject to Git protecting uncommitted edits." },
        { heading: "How It Works", text: "Create a branch from a known base, make commits on it, then integrate it. A fast-forward moves the target reference forward when it has no unique work. A three-way merge creates a commit with two parents when histories diverged. Rebase replays commits onto a new base and therefore creates new commit identities." },
        { heading: "Under the Hood", text: "Commit ancestry is a directed acyclic graph. A merge commit records both histories as parents. Rebase re-creates each selected commit on top of another parent; the patch may be similar, but the commit hash changes because parent and metadata are part of commit identity." },
        { heading: "Commands", code: "git switch -c feature/audit-log\n git log --oneline --graph --decorate --all\n git fetch origin\n git merge origin/main\n git rebase origin/main", text: "Prefer rebasing private, unpublished work when a linear branch is useful. For shared history, coordinate before rewriting it; merging preserves the commits already published." },
        { heading: "Real-World Backend/Engineering Example", text: "A team develops a database migration on a feature branch while another pull request updates the application. Before review, the feature author fetches the latest default branch and integrates it, resolves any conflicts, reruns tests, and pushes the reviewed branch." },
        { heading: "Common Mistakes", bullets: ["Rebasing commits other people already based work on without coordination.", "Resolving a conflict without checking the resulting behavior.", "Assuming a successful merge means tests still pass.", "Using force push to hide a mistake on a shared branch."] },
        { heading: "Practice Exercise", text: "In a throwaway repository, create two branches from the same commit and add a commit to each. Inspect the graph, merge one branch, and compare the resulting history with a separate rebase exercise." }
      ]
    },
    {
      id: "remotes",
      title: "Remote repositories",
      summary: "Understand remotes, tracking branches, fetch, pull, and push without guessing where changes go.",
      sections: [
        { heading: "Overview", text: "A remote is a named connection to another repository, often hosted on GitHub. It gives your local repository a way to exchange commits with teammates without making Git itself dependent on a central server." },
        { heading: "Mental Model", text: "Your local branch and a remote-tracking branch are distinct references. origin/main is your local record of the last known main branch on origin; fetching updates that record but does not move your local main branch." },
        { heading: "How It Works", text: "Fetch downloads objects and updates remote-tracking references. Pull is fetch followed by an integration strategy (commonly merge or rebase). Push sends local commits to a remote branch, if the remote can accept them without losing its history." },
        { heading: "Under the Hood", text: "Git negotiates which objects the other side needs, transfers them, then updates references according to the operation. A rejected non-fast-forward push protects commits that exist on the remote but not in your local branch." },
        { heading: "Commands", code: "git remote -v\n git fetch origin\n git branch -vv\n git log --oneline --graph HEAD..origin/main\n git pull --ff-only\n git push -u origin feature/health-check", text: "Use fetch when you want to inspect incoming changes before integrating them. --ff-only makes pull stop rather than create an unexpected merge commit." },
        { heading: "Real-World Backend/Engineering Example", text: "Before updating a production hotfix branch, an engineer fetches origin, checks whether the remote branch advanced, reviews the incoming commits, integrates them, runs tests, and pushes only after confirming the resulting history." },
        { heading: "Common Mistakes", bullets: ["Thinking fetch changes the checked-out files; it normally only updates remote-tracking refs.", "Assuming origin is always the intended remote.", "Using pull without understanding whether it merges or rebases.", "Force pushing after a rejection instead of first inspecting remote commits."] },
        { heading: "Practice Exercise", text: "Clone a repository, create a local branch, and inspect git branch -vv before and after git fetch. Compare your branch with its upstream using git log --left-right --oneline HEAD...@{upstream}." }
      ]
    },
    {
      id: "internals",
      title: "Git internals",
      summary: "Explore objects, references, HEAD, reflog, and the mechanics behind history.",
      sections: [
        { heading: "Overview", text: "Understanding Git's data model turns confusing commands into predictable operations. Git's history consists of immutable objects and mutable references that point to those objects." },
        { heading: "Mental Model", text: "Commits are nodes in a graph; branches and tags are names; HEAD tells Git what you currently have checked out. Most everyday operations create objects or move references rather than changing old commits." },
        { heading: "How It Works", text: "A commit points to a root tree and one or more parent commits. Trees map names to blobs or subtrees. Branches point to commits and advance when new commits are made. The reflog records recent local reference movements, giving you recovery clues." },
        { heading: "Under the Hood", text: "Object IDs are hashes of object type, size, and content. Modern repositories may use SHA-1 or SHA-256 object formats, so do not assume every repository uses the same hash length. Objects are immutable; references are the movable pointers." },
        { heading: "Commands", code: "git cat-file -t HEAD\ngit cat-file -p HEAD\ngit show-ref\n git reflog --date=relative\n git fsck --no-reflogs", text: "These inspection commands are useful when ordinary log output does not explain where a commit went. Avoid manually editing object storage." },
        { heading: "Real-World Backend/Engineering Example", text: "A developer accidentally resets a local branch while reorganizing commits. The commit object may still exist; the reflog can reveal the previous branch tip so the developer can create a rescue branch before doing further cleanup." },
        { heading: "Common Mistakes", bullets: ["Assuming branch names contain the full history.", "Treating reflog as a shared or permanent backup; it is local and expires.", "Assuming a commit hash is a human-readable sequence number.", "Running garbage collection while trying to recover unreachable commits."] },
        { heading: "Practice Exercise", text: "Create two commits, move a branch reference with a safe test operation, and inspect git reflog. Use the reflog entry to create a new rescue branch; do this only in a disposable repository." }
      ]
    },
    {
      id: "github-collaboration",
      title: "GitHub collaboration",
      summary: "Use hosted repositories, issues, pull requests, code review, and team safeguards effectively.",
      sections: [
        { heading: "Overview", text: "Git provides version control; GitHub hosts Git repositories and adds collaboration features such as issues, pull requests, reviews, permissions, branch protection, and automation." },
        { heading: "Mental Model", text: "A pull request is a proposed change between branches, with a diff, discussion, checks, and review state. It is not a Git command or a special kind of commit; merging it eventually updates repository history." },
        { heading: "How It Works", text: "A common workflow is Issue → Feature Branch → Code Changes → Commit → Push → Pull Request → Review → Feedback → Merge. Issues describe work; the branch isolates it; commits record it; the pull request provides a place to evaluate and integrate it. For a repository you cannot push to, fork it under your account, clone your fork, and propose changes back to the original repository with a pull request." },
        { heading: "Under the Hood", text: "GitHub compares source and target branch histories, displays a diff, runs configured checks, and applies repository rules. Branch protection can require reviews and passing status checks. GitHub Actions workflows are event-triggered automation described in repository YAML files; checks report results but do not replace careful permissions or code review. Repository roles control who can read, write, administer, or change settings. The merge method may create a merge commit, squash commits, or rebase commits, depending on repository settings and team policy." },
        { heading: "Commands", code: "git switch -c feature/issue-42-health-check\n git add src/health.py tests/test_health.py\n git commit -m \"Add health endpoint\"\n git push -u origin feature/issue-42-health-check", text: "Open the pull request on GitHub, link the issue, describe behavior and tests, respond to review, then verify the merged result." },
        { heading: "Real-World Backend/Engineering Example", text: "A developer picks up an issue for a health endpoint, branches from the default branch, adds route and tests, pushes the branch, and opens a pull request. CI checks the tests; a reviewer flags an edge case; the author updates the branch and explains the fix before merge." },
        { heading: "Common Mistakes", bullets: ["Confusing local Git branches with GitHub pull requests.", "Opening a pull request against the wrong base branch.", "Treating review comments as a substitute for running tests.", "Sharing credentials or committing environment secrets.", "Using broad repository permissions when a narrower role is enough."] },
        { heading: "Practice Exercise", text: "In a practice repository, create an issue, push a feature branch, open a pull request, add a review comment, update the branch, and inspect the chosen merge method. Never use a production repository for experiments." }
      ]
    },
    {
      id: "advanced",
      title: "Hooks, worktrees & submodules",
      summary: "Learn advanced tools for parallel work, local automation, and repositories with nested dependencies.",
      sections: [
        { heading: "Overview", text: "Git worktrees check out multiple branches from one repository into separate directories. Hooks run local scripts at selected Git events. Submodules record a specific commit from another repository inside a parent repository." },
        { heading: "Mental Model", text: "A worktree is another working directory connected to the same repository data. A hook is a local automation point, not a team-wide policy by itself. A submodule is a pinned repository dependency, not an ordinary nested folder." },
        { heading: "How It Works", text: "Add a worktree for an independent hotfix, inspect the hooks directory or configured hook path, and use submodule commands to initialize or update a pinned dependency. Team enforcement should live in shared CI or repository rules, not only in a developer's local hook." },
        { heading: "Under the Hood", text: "Worktrees share object storage and most refs but have separate checkout metadata. Hooks are executable programs invoked by Git and may be bypassable depending on the hook and command. A gitlink in the parent tree records the submodule commit ID." },
        { heading: "Commands", code: "git worktree add ../api-hotfix hotfix/health\n git worktree list\n git submodule status\n git submodule update --init --recursive", text: "Review submodule URLs and code before initializing unfamiliar projects. Removing a worktree requires ensuring it has no work you still need." },
        { heading: "Real-World Backend/Engineering Example", text: "An engineer uses a second worktree to test an urgent production fix while keeping a long-running feature checkout intact. They open a pull request and rely on CI—not just a local pre-commit hook—to enforce required checks." },
        { heading: "Common Mistakes", bullets: ["Editing the same branch in multiple worktrees.", "Assuming local hooks run for every teammate or in every CI environment.", "Forgetting to initialize submodules on a new clone.", "Deleting a worktree directory that still contains uncommitted work."] },
        { heading: "Practice Exercise", text: "In a disposable repository, add a second worktree for a new branch, make a distinct change in each checkout, and inspect git worktree list. Remove the extra worktree only after verifying it contains no needed changes." }
      ]
    }
  ],
  commands: [
    { name: "git init", category: "Start", synopsis: "Create a new local repository.", usage: "Use in a new project directory. It creates repository metadata but does not add or publish files.", risk: "Safe; be sure you are in the intended directory." },
    { name: "git clone", category: "Start", synopsis: "Copy a repository and its history locally.", usage: "Use to start work on an existing project. It also configures the source as a remote, commonly named origin.", risk: "Safe; cloning does not grant permission to push." },
    { name: "git status", category: "Inspect", synopsis: "Show branch, staged, unstaged, and untracked changes.", usage: "Use before and after almost every state-changing operation.", risk: "Read-only." },
    { name: "git add", category: "Stage", synopsis: "Choose content for the next commit.", usage: "Use a path or git add -p to stage selected files or hunks.", risk: "Does not commit. Review with git diff --staged, especially for secrets." },
    { name: "git commit", category: "Save", synopsis: "Create a commit from the staged snapshot.", usage: "Use for a coherent, tested unit of change. Write a message explaining intent.", risk: "Creates local history; the commit can later be amended or reverted, with collaboration implications." },
    { name: "git log", category: "Inspect", synopsis: "Inspect commit history.", usage: "Use --oneline --graph --decorate --all to understand branches and ancestry.", risk: "Read-only." },
    { name: "git branch", category: "Branches", synopsis: "List, create, or delete branch references.", usage: "Use git branch --all to inspect local and remote-tracking names.", risk: "Deleting a branch removes its name; commits may remain recoverable, but create a rescue ref first if unsure." },
    { name: "git switch", category: "Branches", synopsis: "Change branches or create a branch.", usage: "Use git switch -c feature/name to create and check out a branch.", risk: "Git protects many uncommitted edits but may refuse; check status before switching." },
    { name: "git merge", category: "Integrate", synopsis: "Integrate another branch into the current branch.", usage: "Use to combine histories, preserving existing commits; it may fast-forward or create a merge commit.", risk: "Conflicts need careful resolution and tests. git merge --abort can stop an in-progress merge." },
    { name: "git rebase", category: "Integrate", synopsis: "Replay commits onto a different base.", usage: "Useful for cleaning private branch history or updating it from a base branch.", risk: "Rewrites commit IDs. Avoid rewriting shared commits without explicit team coordination; --abort stops an in-progress rebase." },
    { name: "git fetch", category: "Remote", synopsis: "Download remote objects and update tracking refs.", usage: "Use to inspect remote changes before integration.", risk: "Normally does not change the checked-out branch or files." },
    { name: "git pull", category: "Remote", synopsis: "Fetch and integrate a remote branch.", usage: "Use when you understand the configured upstream and pull strategy; --ff-only prevents unexpected merge commits.", risk: "Can merge or rebase and change your working tree. Fetch first if uncertain." },
    { name: "git push", category: "Remote", synopsis: "Publish local commits to a remote.", usage: "Use to share a branch or update a pull request.", risk: "A normal push preserves remote history. Avoid force options on shared branches." },
    { name: "git stash", category: "Save", synopsis: "Temporarily store working-tree changes.", usage: "Use to set aside in-progress changes when switching tasks; prefer stash push -u if untracked files matter.", risk: "Stashes are local and easy to forget. Verify with git stash list; avoid drop/clear until changes are restored." },
    { name: "git reset", category: "Recovery", synopsis: "Move a branch reference and optionally change the index or working tree.", usage: "Use --soft to keep staged content, --mixed (default) to keep edits unstaged, or --hard only when intentionally discarding tracked changes.", risk: "Potentially destructive: --hard discards tracked working-tree changes. Do not use on shared history; make a backup branch first." },
    { name: "git revert", category: "Recovery", synopsis: "Create a new commit that reverses an earlier commit's change.", usage: "Prefer for undoing changes already shared with others.", risk: "Preserves history by adding a commit; conflicts may need resolution." },
    { name: "git reflog", category: "Recovery", synopsis: "Show recent local movements of HEAD and references.", usage: "Use to find a previous branch tip after a local reset, rebase, or checkout.", risk: "Local and time-limited, not a backup. Create a rescue branch immediately when you find the commit." },
    { name: "git cherry-pick", category: "Integrate", synopsis: "Apply the change from an existing commit onto the current branch.", usage: "Useful for selecting a focused fix from another branch.", risk: "Creates a new commit ID and can conflict. Avoid duplicating changes already present." },
    { name: "git bisect", category: "Inspect", synopsis: "Binary-search history for the commit that introduced a problem.", usage: "Mark known-good and known-bad commits and test each selected midpoint.", risk: "Checks out commits during the process. Finish with git bisect reset to return to your original state." },
    { name: "git worktree", category: "Advanced", synopsis: "Create multiple working directories connected to one repository.", usage: "Use for parallel branches without repeatedly switching one checkout.", risk: "Check each worktree for uncommitted work before removing it." }
  ],
  scenarios: [
    {
      id: "merge-conflicts", title: "Merge conflicts", group: "Merge & rebase",
      situation: "You merge the latest main into a feature branch and both branches changed the same lines in an API handler.",
      symptoms: "Git reports CONFLICT and leaves conflict markers in the affected file; the merge is not committed.",
      diagnosis: "Git cannot choose between overlapping edits. The files listed as unmerged need a human decision.",
      understanding: "During a three-way merge, Git compares the merge base with both branch tips. It can combine non-overlapping edits, but overlapping edits are left for you to resolve.",
      solution: "Pause and preserve any unrelated work. Open each conflicted file, understand both intended changes, edit the final result (remove all conflict markers), then stage the resolved file. To abandon the merge and return to the pre-merge state, use git merge --abort; do not use it if you want to keep the merge attempt.",
      commands: "git status\ngit diff --merge\n# edit and test each conflicted file\ngit add src/handler.py\ngit diff --staged\ngit commit",
      verification: "Run the relevant tests, check git status for remaining unmerged paths, and inspect the merge commit and diff before pushing.",
      prevention: "Integrate small changes regularly, communicate shared-file edits, and make conflict resolutions explicit in review."
    },
    {
      id: "rejected-push", title: "Push rejected", group: "Remote & history",
      situation: "Your push is rejected because another teammate pushed commits to the same remote branch.",
      symptoms: "The server reports a non-fast-forward update or says the remote contains work you do not have.",
      diagnosis: "The remote branch has commits absent from your local branch. Git refuses to move the remote ref in a way that would hide them.",
      understanding: "A normal push is accepted when the remote can advance to your commit without discarding its current ancestry. The rejection is a safety check, not a request to force push.",
      solution: "Keep your working changes. Fetch and inspect the remote-only commits, then integrate them using the team-approved merge or rebase strategy. Resolve conflicts and test before retrying a normal push.",
      commands: "git status\ngit fetch origin\ngit log --oneline --graph --decorate HEAD..origin/feature/name\ngit rebase origin/feature/name  # only if this branch is private and team policy allows it\n# otherwise merge the remote branch, then test\ngit push",
      verification: "Confirm your branch contains the remote commits, the tests pass, and a normal push succeeds. Check the pull request diff.",
      prevention: "Use personal feature branches, fetch before long sessions, and coordinate before multiple people push to the same branch."
    },
    {
      id: "committed-main", title: "Committed to main by accident", group: "Accidental changes",
      situation: "You made a local commit on main instead of on your feature branch; it has not been pushed.",
      symptoms: "git status shows main is ahead of origin/main by one commit.",
      diagnosis: "The commit is local and the shared branch has not moved, so you can preserve it on a feature branch before restoring local main.",
      understanding: "A branch is a reference. Creating a branch at the current commit preserves the commit under a new name. Moving local main back is safe only after confirming it has not been published.",
      solution: "First create a branch at the current commit. Then switch to local main and move it back only if the commit is definitely unpublished and no one else depends on it. If already pushed, do not rewrite shared history; coordinate and use revert or the team's recovery procedure.",
      commands: "git branch feature/my-change\n# verify the new branch points at the commit\ngit show --oneline --decorate feature/my-change\n# unpublished local commit only:\ngit switch main\ngit reset --keep origin/main",
      verification: "Check that the feature branch still contains the commit and that local main matches the intended remote base. Run git status and inspect both branch logs.",
      prevention: "Check the branch in the prompt and run git status --short --branch before committing; use branch protection on shared main."
    },
    {
      id: "lost-commits", title: "Lost commits", group: "Recovery",
      situation: "After an accidental reset or rebase, a commit is no longer visible in git log.",
      symptoms: "The branch tip moved backward or now points to a different commit, but you remember the lost work was committed.",
      diagnosis: "The branch name moved; the commit object may still be reachable through the local reflog.",
      understanding: "The reflog records recent local reference updates. It can reveal a former HEAD even when the current branch no longer points there, but it is local and expires.",
      solution: "Stop cleanup operations and inspect the reflog. Locate the exact commit by message and content, then immediately create a rescue branch at that hash. Inspect and test the rescue branch before deciding how to integrate it.",
      commands: "git reflog --date=local\ngit show <candidate-hash>\ngit branch rescue/recovered-work <candidate-hash>\ngit switch rescue/recovered-work",
      verification: "Confirm expected files and commits are present on the rescue branch; compare with the current branch and run tests before cherry-picking or merging.",
      prevention: "Create backup branches before history edits, push important work, and avoid running garbage collection during recovery."
    },
    {
      id: "rebase-conflicts", title: "Rebase conflicts", group: "Merge & rebase",
      situation: "A rebase pauses because one of your commits conflicts with newer changes from the base branch.",
      symptoms: "Git names the commit being replayed and lists conflicted files; status reports an interactive rebase in progress.",
      diagnosis: "The patch from the current commit cannot apply cleanly to the new parent.",
      understanding: "Rebase replays commits one at a time. A conflict can occur at any replay step; resolving it changes the new commit content but does not alter the original shared commit object.",
      solution: "Resolve the current conflict, stage the files, and continue. If you are unsure or the result is wrong, use git rebase --abort to return to the pre-rebase branch state. Preserve uncommitted work before starting another attempt.",
      commands: "git status\n# resolve the listed files and run tests\ngit add <resolved-files>\ngit rebase --continue\n# to abandon instead: git rebase --abort",
      verification: "Review the rebased log and full diff against the base, run tests, and confirm the pull request contains only intended changes.",
      prevention: "Rebase small private branches regularly and avoid rewriting commits already used by teammates."
    },
    {
      id: "detached-head", title: "Detached HEAD", group: "Branch & checkout",
      situation: "You checked out a historical commit to inspect a regression and then made a useful fix.",
      symptoms: "Git reports that HEAD is detached; new commits do not appear on a named branch.",
      diagnosis: "HEAD points directly at a commit rather than following a branch reference.",
      understanding: "Detached HEAD is useful for inspection. A new commit is valid, but switching away without creating a branch can make it harder to find later.",
      solution: "If you made a commit worth keeping, create a branch immediately at the current commit. If you made only uncommitted edits, check status and create a branch before switching. Do not reset or discard work just to clear the warning.",
      commands: "git status\ngit switch -c rescue/fix-from-old-commit\n# now the commit is reachable from a named branch",
      verification: "Run git branch --show-current and git log --oneline -1 to confirm the new branch contains the commit.",
      prevention: "Use git switch -c for exploratory fixes and create a named branch before making commits from an old checkout."
    },
    {
      id: "deleted-branch", title: "Accidentally deleted a branch", group: "Branch & checkout",
      situation: "A local feature branch was deleted before its work was merged.",
      symptoms: "The branch name is missing from git branch, but the commit was recently checked out or committed.",
      diagnosis: "Deleting a branch removes its reference. Recent HEAD movement may still be recorded in the reflog.",
      understanding: "Commits are separate from branch labels. A deleted name does not immediately delete commit objects, but unreachable objects are not permanent storage.",
      solution: "Inspect the reflog and recent commits, identify the branch tip, and create a new branch at that exact commit. If the branch existed on a remote, fetch and inspect remote-tracking refs too.",
      commands: "git reflog --all --date=relative\ngit branch -a\ngit show <candidate-hash>\ngit branch feature/recovered <candidate-hash>",
      verification: "Check the recovered branch log and working tree for the expected work before continuing.",
      prevention: "Push work-in-progress branches and verify the branch name before deletion; use git branch -d when possible so Git warns about unmerged work."
    },
    {
      id: "wrong-merge", title: "Wrong commit or branch merged", group: "Recovery",
      situation: "An unintended change was merged into a shared branch and is already visible to teammates.",
      symptoms: "The default branch includes a commit or pull request that should not have been integrated.",
      diagnosis: "The change is published, so moving a shared branch backward could disrupt collaborators and make their branches diverge.",
      understanding: "A revert adds a new commit that inverses the change while retaining the published history. Reset rewrites the branch pointer and is generally inappropriate for shared history.",
      solution: "Tell the team and identify exactly what needs to be undone. For a normal commit, revert it. For a merge commit, determine the correct mainline parent with the team before using git revert -m; test the revert and review it before pushing.",
      commands: "git show --no-patch --pretty=raw <merge-hash>\n# ordinary commit:\ngit revert <commit-hash>\n# merge commit only after identifying the mainline:\ngit revert -m 1 <merge-hash>",
      verification: "Run tests, inspect the revert diff and resulting history, then confirm the shared branch contains the corrective commit.",
      prevention: "Require pull request review and checks, confirm the base branch, and use branch protection for important shared branches."
    },
    {
      id: "staged-files", title: "Accidentally staged files", group: "Accidental changes",
      situation: "You staged generated output or a configuration file that should not be part of the next commit.",
      symptoms: "git status shows the file under Changes to be committed.",
      diagnosis: "Staging copies the selected content into the index; it does not yet create a commit.",
      understanding: "The index is editable. You can unstage a path while keeping its working-tree changes.",
      solution: "Review the staged diff. Use git restore --staged with the specific path to unstage it, then decide whether to add the file to .gitignore. If a secret was already committed or pushed, unstaging is not enough: rotate the credential and follow the incident process.",
      commands: "git diff --staged\ngit restore --staged path/to/file\ngit status",
      verification: "Confirm the unwanted file is no longer staged and that intended changes remain staged; inspect git diff --staged again.",
      prevention: "Stage explicit paths or hunks and review the complete staged diff before committing."
    },
    {
      id: "diverged-branches", title: "Diverged branches", group: "Remote & history",
      situation: "Your local branch and its upstream each have new commits.",
      symptoms: "Git reports that branches have diverged and asks you to choose how to reconcile them.",
      diagnosis: "Neither branch tip is an ancestor of the other; both have unique commits.",
      understanding: "Git needs an explicit integration strategy. Merge preserves both lines and may add a merge commit; rebase replays local commits and changes their IDs.",
      solution: "Check status and inspect both sides of the graph. Use the repository's stated policy. Choose merge for shared history or rebase only for private commits when allowed. If uncertain, fetch and ask the team rather than using a force push.",
      commands: "git fetch origin\ngit log --oneline --graph --decorate HEAD...@{upstream}\n# choose one team-approved strategy:\ngit merge @{upstream}\n# or, for private commits only:\ngit rebase @{upstream}",
      verification: "Confirm the graph includes both intended sets of commits, the working tree is clean, and tests pass.",
      prevention: "Fetch regularly, set an upstream deliberately, and document the team's merge/rebase policy."
    },
    {
      id: "amend-commit", title: "Incorrectly modified a commit", group: "Recovery",
      situation: "You amended a commit and now need the original version, or amended a published commit.",
      symptoms: "The commit hash changed after --amend, or teammates report their branches no longer line up.",
      diagnosis: "Amend replaces the current commit with a new commit object. The old commit may remain in the local reflog; if already pushed, the rewrite affects collaborators.",
      understanding: "Commit IDs include the tree and parent, so changing a commit creates a different identity. Rewriting local-only work differs from rewriting a commit others have fetched.",
      solution: "For local-only work, inspect the reflog and create a rescue branch before restoring anything. For published work, do not force push automatically; coordinate with collaborators and usually add a corrective commit instead.",
      commands: "git reflog --oneline\ngit show <old-hash>\ngit branch rescue/pre-amend <old-hash>\n# for shared history, prefer a corrective commit or coordinated revert",
      verification: "Compare old and new commit diffs, ensure the intended files and authorship are retained, and verify teammates' branches can integrate normally.",
      prevention: "Inspect the staged diff before amending and only amend unpublished commits unless the team explicitly coordinates a rewrite."
    },
    {
      id: "discarded-changes", title: "Recovering discarded changes", group: "Accidental changes",
      situation: "Uncommitted edits disappeared after a restore, checkout, or clean operation.",
      symptoms: "The working tree is clean but expected edits are missing; they were never committed.",
      diagnosis: "Uncommitted working-tree content is not necessarily stored as Git objects. Recovery depends on editor local history, backups, or whether the content was staged or stashed.",
      understanding: "Git can recover commits and sometimes staged blobs, but it cannot promise recovery of edits that were never recorded. Avoid further cleanup and check editor backups promptly.",
      solution: "Stop writing to the affected files and check your editor's local history, OS backups, or IDE recovery. If changes were staged, inspect the index and dangling objects cautiously. Do not run git clean, reset --hard, or garbage collection while investigating.",
      commands: "git status\ngit stash list\ngit fsck --no-reflogs  # inspect unreachable objects without writing recovery files\n# inspect your editor's local history and backups",
      verification: "Recover files to a separate copy first, compare them with the current project, then selectively restore and test.",
      prevention: "Commit or stash meaningful work, configure editor local history, and inspect the exact effects of destructive commands before confirming."
    }
  ]
};
