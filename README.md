# Akshara Ke Liye Ek Raaz ✨

A personalized, interactive mystery gift and clues experience.

---

## 🚀 How to Deploy on GitHub Pages

You have two easy ways to deploy this website on GitHub:

### Option 1: Automatic Deployment with GitHub Actions (Recommended)

1. **Export or Push to GitHub**:
   - In Google AI Studio, click on **Settings / Export** and choose **Export to GitHub** (or push this repository to a new GitHub repo).
2. **Enable GitHub Pages in Repository Settings**:
   - Go to your repository on GitHub: `https://github.com/<your-username>/<your-repo-name>`
   - Click **Settings** (tab at the top).
   - In the left sidebar, click **Pages** (under the "Code and automation" section).
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. **Trigger Deployment**:
   - The included `.github/workflows/deploy.yml` workflow will automatically run on push to `main` (or you can trigger it manually from the **Actions** tab).
   - Once completed, your live site URL will be displayed in **Settings > Pages**!

---

### Option 2: Deploy Standalone Single File (`akshara-mystery-gift.html`)

If you want a zero-dependency static page:
1. Rename `akshara-mystery-gift.html` to `index.html` (if deploying standalone HTML without Vite).
2. In GitHub repository **Settings > Pages**, set **Source** to `Deploy from a branch` -> `main` / `/ (root)`.
3. Save, and your page is immediately live.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build production bundle
npm run build
```
