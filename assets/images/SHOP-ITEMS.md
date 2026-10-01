# Shop artwork

The Shop tab has three theme backgrounds with the same 23 display bays: `magic-shop-v3.png`, `cartoon/shop-background.png`, and `future/shop-background.png`. The latter two were generated as reskins of the magic layout to preserve existing slot and item placements. The selected theme changes the shop background automatically. Earlier magic artwork is retained.

The entire artwork fits the full viewport behind bottom navigation without cropping. The background and display layer scale to the same viewport rectangle, so shelf positions stay aligned when the window changes size. Wide or tall windows change the background proportions; individual item images preserve their proportions.

Users can add their own images directly through Shop → Add Item, or by clicking an empty shelf. Images are saved in a separate IndexedDB shop for the current inventor's profile ID. Click an existing item to move, rename, replace, or remove it. Export Shop includes image bytes in a portable JSON backup; Import Shop replaces only that inventor's shop after validation. Uploaded images remain local to this browser. Additional shelf pages can reuse the same slots.

Developer-supplied defaults can still be added to `js/shop-items.js` with `owner`, `slot`, `name`, and `image`; an optional `page` starts at 1. These defaults are used until the inventor saves their own shop snapshot. Ann's source folder remains in the project unchanged.

Slots 1 and 7 are the tall side cabinets. Shelf 8 combines the former shelves 8 and 13 into one tall bay; number 13 is retired. Shelves 4, 10, and 15 are split side by side into A (left) and B (right), labeled 4A/4B, 10A/10B, and 15A/15B. Their item-list IDs are `display-4a`, `display-4b`, `display-10a`, `display-10b`, `display-15a`, and `display-15b`. Other shelf numbers stay the same. Slots 26–29 are the four deeper counter bays, left to right. Numbers 18–25 remain retired. Each placeholder fits inside its own physical opening; no display rectangles overlap. Item image proportions are preserved.

Ann's six images are stored in `assets/images/items/ann/` with their existing one-word filenames. Each item has `owner: 'Ann'`; the shop filters items to the signed-in name, ignoring letter case. Her placements are End of Nightmares in 1, Colour Changing Teddy Bear in 4A, Flying Lunchbox in 10B, Flying Skateboard in 28, Octopus the Cooker in 7, and Unbreakable Bed in 8. Other users see empty slots. This controls game display; static hosted asset files remain publicly accessible.

The shop does not change student coins, invention history, achievements, or settings. Browser uploads are not sent to a server. See README.md for supported images, limits, storage behavior, and backups.
