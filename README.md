## troott ( Server-side: monolithic application )

### Stream unlimited sermons and christian content on the go

> **Troott** provides audio streaming services worldwide, with a premium subscription offering and free ad-supported plan. The Premium segment offers unlimited online and offline streaming access to its catalogue of sermon, and sermon reels without commercial break.

With troott, users can listen to old and new sermons from their favorite preachers, gain control over how they listen to sermons and messages, and share sermons with the people they love!


## Introduction

Christian content consumers face annoyances and difficulties in accessing messages of their favourite preachers and discovering their old sermons. Many struggle to find specific messages without knowing exact titles, and downloading features directly to phone internal storage are inadequate for organising content. The current value propositions offer poor experience (no mobile first experience) for our target users. 

Solving these issues is important to provide a seamless and enjoyable experience, allowing users to efficiently access, manage, and discover religious content, thereby enhancing their spiritual growth and connection.

To build this enhanced product experience, we asking the following questions:
- How can we eliminate the frustration of people in searching, listening and sharing sermons on the go? 
- How can we help people feel organised and free from the clutter of downloaded sermon collections to make more space for other items? ~ Allow me the freedom to carry my entire sermon collection in my pocket.
- How can we help people gain control of their spiritual life by listening to sermons seamlessly so that they can improve their lifestyle?
- How can we help people to share a common spiritual experience by sharing messages to their loved ones on their mobile device?


## Techonologies

- **Typescript**
- **Express**
- **MongoDB**
- **AWS S3**
- **SendGrid**
- **fluent-ffmpeg**

## Getting Started

To get the backend up and running on your local machine, follow these steps:

### 1. **Clone the repo**

```bash
git clone https://github.com/thebuildershq/troott-server.git
cd troott-server
```

### 2. **Install dependencies**

```bash
npm install
# or
yarn install
```

### 3. **Set up environment variables**

Create a `.env` file in the root directory and populate it with the required environment variables.

Example `.env` file:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongo_or_sql_url
JWT_SECRET=your_jwt_secret
TROOTT_API_URL_LOCAL=http://localhost:5000/api
```

> Check `.env.example` if available.

### 4. **Start the server**

Run the development server:

```bash
npm run dev
```

> You should see a message like: `Server running on http://localhost:5000`

---

## Branch Structure

| Branch               | Purpose                                                                 |
|----------------------|-------------------------------------------------------------------------|
| `master`             | Production-ready code. Always stable. Protected.                        |
| `staging`            | QA/testing branch for integrating all features before a release.        |
| `release/vX.Y.Z`     | Pre-production branch used for final testing before going live.         |
| `@username/feature-*`| Feature branches under a personal namespace.                            |
| `@username/fix-*`    | Bugfix branches under a personal namespace.                             |

### Example Branch Naming

| Type     | Pattern                        | Example                                   |
|----------|--------------------------------|-------------------------------------------|
| Feature  | `@username/feature-<desc>`     | `@damolaoladipo/feature-invite-endpoint`  |
| Bug Fix  | `@username/fix-<desc>`         | `@topeokuselu/fix-auth-token-expiry`      |
| Release  | `release/v<semver>`            | `release/v1.0.2`                           |

> Use lowercase with hyphens in branch names. Keep it descriptive and concise.

---

## Development Workflow

### 1. Clone the Repository (if you haven't)

```bash
git clone https://github.com/thebuildershq/troott-server.git
cd troott-server
```

### 2. Create a Feature Branch

```bash
git checkout staging
git pull origin staging
git checkout -b @username/feature-your-task
```

Tip: Use a descriptive and concise name for your branch. Follow this format:

`@username/feature-short-description`

Example: `@damolaoladipo/feature-user-invitation-endpoint`

### 3. Develop Your Feature

Make your changes, test locally, and commit using meaningful messages.

### 4. Sync with Latest Staging

```bash
git fetch origin
git rebase origin/staging
```

### 5. Push to Remote

```bash
git push origin @username/feature-your-task
```

### 6. Create a PR into Staging 
```bash
git checkout staging
git merge @username/feature-your-task-name
git push origin staging
```

📌 Your pull request (PR) should target `staging` — not master.  
Reference the issue number in the PR description (e.g., Closes #502).

### 7. Create a Release Branch

When ready for deployment, create a release branch from staging.

```bash
git checkout -b release/v1.0.2
git push origin release/v1.0.2
```
Final QA and bug-fixing happen on this release/* branch before production deployment.

### 8. Merge Release into master and staging

After final QA on the release branch, merge it into both master and staging to complete the release.

```bash
# Merge into master
git checkout master
git merge release/v1.0.2
git push origin master

# Merge back into staging
git checkout staging
git merge release/v1.0.2
git push origin staging
```


### Creating an Issue

If you discover a bug or have a suggestion, raise an issue via the GitHub Issues tab (if you have permission), or notify your team lead for triage and assignment.

## Useful Commands

| Command         | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Starts the server with nodemon       |
| `npm start`     | Starts the server in production mode |
| `npm run test`  | run unit tests                `````  |


## Pull Request Notes

- PRs should target the `staging` branch.
- Reference issues using `Closes #issue-number`.
- Add context and screenshots/logs when helpful.
- Request reviewers before merging.