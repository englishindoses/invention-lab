# Shop artwork

The Shop tab has three theme backgrounds with the same 23 display bays: `magic-shop-v3.png`, `cartoon/shop-background.png`, and `future/shop-background.png`. The latter two were generated as reskins of the magic layout to preserve existing slot and item placements. The selected theme changes the shop background automatically. Earlier magic artwork is retained.

The entire artwork fits the full viewport behind bottom navigation without cropping. The background and display layer scale to the same viewport rectangle, so shelf positions stay aligned when the window changes size. Wide or tall windows change the background proportions; individual item images preserve their proportions.

Users can add their own images directly through Shop → Add Item, or by clicking an empty shelf. Images are saved in a separate IndexedDB shop for the current inventor's profile ID. Click an existing item to move, rename, replace, or remove it. Export Shop includes image bytes in a portable JSON backup; Import Shop replaces only that inventor's shop after validation. Uploaded images remain local to this browser. Additional shelf pages can reuse the same slots.

Developer-supplied defaults can still be added to `js/shop-items.js` with `owner`, `slot`, `name`, and `image`; an optional `page` starts at 1. The default list is currently empty; personal images are added through the browser shop controls.

Slots 1 and 7 are the tall side cabinets. Shelf 8 combines the former shelves 8 and 13 into one tall bay; number 13 is retired. Shelves 4, 10, and 15 are split side by side into A (left) and B (right), labeled 4A/4B, 10A/10B, and 15A/15B. Their item-list IDs are `display-4a`, `display-4b`, `display-10a`, `display-10b`, `display-15a`, and `display-15b`. Other shelf numbers stay the same. Slots 26–29 are the four deeper counter bays, left to right. Numbers 18–25 remain retired. Each placeholder fits inside its own physical opening; no display rectangles overlap. Item image proportions are preserved.

Ann's six former published image files and their built-in catalog entries have been removed. Browser-uploaded image blobs and all student progress are left intact. Legacy shop snapshots containing only references to the removed files need replacement uploads or an image-inclusive backup import.

The shop does not change student coins, invention history, achievements, or settings. Browser uploads are not sent to a server. See README.md for supported images, limits, storage behavior, and backups.
