from pathlib import Path
import qrcode

# IMPORTANT: Replace this with your actual published site URL. Keep the trailing slash.
BASE_URL = "https://ganesh19-datacom.github.io/bdp-tree-qr/"
ROOT = Path(__file__).resolve().parent
OUT = ROOT / "qr-codes-final"
OUT.mkdir(exist_ok=True)

for n in range(1, 6):
    plant_id = f"BDP-{n:03d}"
    url = f"{BASE_URL}plants/{plant_id.lower()}.html"
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color="#123d32", back_color="white")
    image.save(OUT / f"{plant_id}.png")
    print(f"{plant_id}: {url}")
print(f"\nQR codes saved in: {OUT}")
