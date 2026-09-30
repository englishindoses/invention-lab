# The Invention Lab — Game Artwork Asset List

## Art direction

Audience: children aged 8–12. Make the game feel like a colourful, hands-on invention workshop: bold silhouettes, chunky machinery, expressive shapes, bright accents, and satisfying moving parts. Aim for illustrated adventure-game artwork, with enough detail to explore without overwhelming the two words.

The current muted green, navy, and purple palettes need stronger colour contrasts and more character. Artwork should be accompanied by brighter interface colours, larger playful controls, and less tiny decorative text.

Keep generated artwork free of text, numbers, and fake buttons. Render all words, labels, balances, and interactive controls in HTML. No invention pictures are included in this list.

## Theme directions

| Theme | Palette | World and machine design |
| --- | --- | --- |
| Cartoon Lab | Turquoise, sunshine yellow, coral, cobalt; warm white highlights | A wonderfully eccentric inventor’s workshop. Curved pipes, oversized bolts, bubbling tubes, striped cables, chunky gears, and a cheerful yellow-and-turquoise machine. |
| Future Lab | Electric cyan, hot pink, vivid violet, lime; deep blue for contrast | An energetic space laboratory. Floating energy rings, glowing power cells, translucent tubes, sleek white armour, and a bright reactor. Dark areas should make the colours shine, rather than dominate the screen. |
| Magic Machine | Amethyst, emerald, brilliant gold, bright pink; warm lantern light | An enchanted inventor’s workshop. Crystal power sources, curling brass pipes, floating sparks, carved wood, and whimsical astronomical instruments. Magical and inviting rather than gloomy or frightening. |

## Images for each theme

Use folders `assets/images/cartoon/`, `assets/images/future/`, and `assets/images/magic/`.

| Filename in each folder | Purpose | Artwork requirements | Suggested master |
| --- | --- | --- | --- |
| `workshop-background.webp` | Establish the world behind the interface | Illustrated room with interesting edges and a quieter centre. Cartoon shelves and pipes; futuristic observatory and reactor; magical shelves and crystal lights. No essential objects near crop edges. | 1920×1080 landscape |
| `machine-body.png` | The main gameplay centrepiece | Front-facing machine with two large empty display recesses. Transparent exterior. Clearly defined housing, power source, feet, and decorative machinery. Leave levers and words out so they can move independently. | 1536×1024, transparent |
| `lever-base.png` | Fixed mounting for both levers | Chunky mechanical socket, glowing electronic mount, or ornate brass mount. Reuse the same asset on both sides. | 512×512, transparent |
| `lever-arm.png` | Animated handle for both levers | Big coral ball handle; luminous cyan handle; faceted crystal handle. Include the shaft, with a clear bottom pivot and space for movement. Reuse on both sides. | 512×768, transparent |
| `menu-hero.png` | Welcome-screen illustration | A lively three-quarter view of the same machine, with a few themed props. Keep the silhouette readable beside the welcome text. This is decorative, so the levers can be included. | 1024×1024, transparent |

Subtotal: **5 images per theme, 15 images total**. Final dimensions can adapt to generation output; the proportions and clear areas matter more than exact pixel counts.

Before generating the machine bodies, mark the two display recesses and lever pivots on a shared layout template. All three machines must fit that template so theme switching preserves usable controls.

## Shared images

Use `assets/images/shared/` and `assets/images/badges/`. Keep the same badge identities across themes.

| Filename | Design |
| --- | --- |
| `shared/coin.png` | A shiny gold invention coin with an embossed spark symbol. Use for the balance, rewards, and coin bursts. Transparent, 256×256. |
| `badges/first-sale.png` | A gold coin with a celebratory ribbon. |
| `badges/inventor.png` | A colourful light bulb and small gear. |
| `badges/super-inventor.png` | An elaborate glowing bulb with wing-like sparks. |
| `badges/salesperson.png` | A small coin stack and a bright rosette. |
| `badges/master-salesperson.png` | A coin trophy with a jewel-like star. |
| `badges/big-sale.png` | A large radiant coin with a dramatic starburst. |
| `badges/coin-collector.png` | An overflowing coin pouch. |
| `badges/invention-empire.png` | A miniature fantastical workshop crowned with coins. |
| `badges/experimenter.png` | A lever surrounded by little sparks. |
| `badges/wild-inventor.png` | A swirling gear, lightning bolt, and colourful energy. |

Badges: transparent 512×512 masters, common border style, bold silhouettes, no lettering. Locked states can use the same images with CSS desaturation and a lock overlay; separate locked images are unnecessary.

Shared subtotal: **11 images**. Complete proposed set: **26 images**.

## Keep these as interface graphics

Navigation icons, sound controls, button backgrounds, focus outlines, progress bars, word windows, and the title should remain HTML/CSS/SVG for sharpness and accessibility. Animate sparks, bubbles, glows, gear rotation, coin bursts, and lever pulls in code. These do not need separate generated frames or baked-in text.

Invention cards can use a small version of the theme’s machine or a shared SVG symbol as decoration; they do not need pictures of individual inventions.

## Production order

1. **Cartoon machine and background:** establish a much brighter visual style and test it in the actual lab at 1366×768.
2. **Future and magic machines/backgrounds:** give each theme a distinct world, using the same control layout. These first six images will make the biggest difference.
3. **Lever components:** replace the small existing lever drawings with substantial animated controls.
4. **Menu illustrations:** match the welcome screen to each completed lab.
5. **Coin and ten badges:** finish rewards and achievements with a cohesive set.

Keep editable/source masters and optimise copies for the game. Use WebP for opaque backgrounds and PNG or lossless WebP where transparency is needed. Check readability during screen sharing, image loading, transparent edges, and all three desktop target sizes after integration.

Current status: all three theme machine bodies and matching workshop backgrounds have been generated and integrated into the playable game. Backgrounds are stored as PNG. Future Lab has neon borders and live glowing text. Magic Machine has exactly two cauldrons with independent animated HTML/CSS stirring spoons. Other listed artwork remains planned; controls still use animated HTML/CSS. Prompts are recorded in `assets/images/THEME-GENERATION-NOTES.md`.
