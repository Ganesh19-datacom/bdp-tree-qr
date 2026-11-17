# BDP Green Explorer – 5-tree demonstration prototype

This is a static HTML/CSS/JavaScript prototype for the Biodiversity Park, Bhuteghar, Mahabaleshwar QR-tree information project.

## Important demo notes
- The five species are illustrative examples only. They are NOT confirmed members of the Forest Department's 60-plant collection.
- The home page contains general placeholder wording. Replace it with approved BDP and Forest Department information, logos and contact details.
- Plant descriptions are concise educational samples and should be reviewed by a botanist/Forest Department before official publication.
- Plant photos are linked from Wikimedia Commons. Review each source page's exact licence and attribution requirements before using the images in printed/commercial materials. For the final project, use photographs taken at BDP with permission wherever possible.

## Files
- `index.html` – BDP home page; the Home tab always returns here.
- `plants/bdp-001.html` through `plants/bdp-005.html` – individual plant pages.
- `data.js` – plant data used to build the sample cards on the home page.
- `styles.css` – responsive visual design.
- `qr-codes-preview/` – preview QR codes containing placeholder GitHub Pages URLs.
- `generate_qr.py` – regenerate QR codes after publishing with your real URL.

## Publish using GitHub Pages
1. Create a GitHub repository named `bdp-tree-qr` (or choose your own name).
2. Upload the contents of this folder to the repository root. Do not upload the outer ZIP folder as a nested folder.
3. Open repository Settings → Pages.
4. Under Build and deployment, select Deploy from a branch, choose `main` and `/ (root)`, then Save.
5. Wait for GitHub Pages to publish. Your URL will look like `https://YOUR-USERNAME.github.io/bdp-tree-qr/`.
6. Edit `generate_qr.py` and replace `BASE_URL` with your exact published URL (keep the trailing slash).
7. Run `python generate_qr.py`. It will create the five final QR PNGs in `qr-codes-final/`.
8. Scan every final QR code using a phone before printing.

## Publish using Netlify
1. Sign in to Netlify and choose Add new site → Deploy manually (or connect the GitHub repository).
2. Drag and drop this project folder, or connect the repository.
3. Netlify will assign a site URL such as `https://your-site-name.netlify.app/`.
4. Put that exact URL into `BASE_URL` in `generate_qr.py`, run the script and use the regenerated QR files.

## Generate final QR codes locally
Install Python and run:
```
pip install qrcode[pil]
python generate_qr.py
```

## How the URL logic works
Each QR points to its own file, for example `/plants/bdp-001.html`. Each plant page's Home navigation points to `/index.html`, so scanning a plant QR opens only that plant profile, while Home opens the BDP home page.

## Updating the five samples
Edit `data.js` and the corresponding HTML files in `plants/`. For production, replace the sample content and image URLs with Forest Department-approved information and photographs. Keep the plant IDs and URLs stable after QR labels are installed.
