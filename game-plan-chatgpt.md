# The Invention Lab — Game Plan

## 1. Game Overview

**The Invention Lab** is a one-on-one browser-based speaking game for fluent English-speaking children aged 8–12.

The student becomes an inventor. They use an invention machine to generate two random words, combine them into a new invention, describe and explain it, and then try to persuade the teacher to buy it.

The teacher controls the game in Chrome while sharing their screen with the student during an online lesson.

The focus is conversation, creativity, explanation, and persuasion rather than reading tasks, grammar exercises, or competitive gameplay.

---

## 2. Core Goal

The goal of each round is:

> Create an invention from two random words and convince the teacher to buy it.

The student earns coins when the teacher buys an invention.

---

## 3. Target Users

- Age: 8–12
- English level: Fluent / native-like speaking ability
- Lesson format: One-to-one online conversation classes
- Browser: Chrome
- Game controller: Teacher
- Student interaction: Verbal; the teacher clicks and controls the game while screen sharing

---

## 4. Core Gameplay Loop

### Step 1 — Start a Round

The invention machine begins with two empty word slots.

Each word slot has its own lever.

The student asks the teacher to pull both levers.

Each lever pull costs **1 coin**.

After both levers are pulled, the machine displays two random words.

Example:

- `backpack`
- `talks`

The student could invent:

> A backpack that talks.

---

### Step 2 — Reroll Words

If the two words do not inspire a usable invention, the student can reroll either word individually.

Each new lever pull costs **1 coin**.

There is no limit to the number of rerolls as long as the student has coins available.

Example:

Initial words:

- `banana`
- `invisible`

The student wants to keep `invisible` but replace `banana`.

They pull only the first lever.

Cost: **1 coin**

New pair:

- `bicycle`
- `invisible`

Possible invention:

> An invisible bicycle.

---

## 5. Coin Economy

Coins act as both:

1. the cost of generating words;
2. the reward for successfully selling inventions.

### Spending Coins

- Pull left lever: **-1 coin**
- Pull right lever: **-1 coin**
- Pulling both levers at the beginning of a new round therefore costs **2 coins**
- Rerolling one word costs **1 coin**

Coins are deducted immediately when a lever is pulled.

### Earning Coins

When the teacher buys an invention, they choose one of three prices:

- **Buy for 5 coins**
- **Buy for 10 coins**
- **Buy for 50 coins**

The selected amount is added to the student's coin balance.

If the teacher chooses **Don't Buy**, the student earns no coins.

### Starting Balance

Recommended initial balance:

**20 coins**

This gives the student enough room to experiment and reroll words without immediately running out.

This value should be stored as a configurable game setting so it can be changed later without rewriting the game logic.

### Zero Coins

If the student's balance reaches zero, the game should not become permanently stuck.

Recommended rule:

- Display a **Free Restart Bonus** button.
- Pressing it gives the student **10 coins**.
- This does not count as an achievement or a sale.

This prevents the game economy from blocking the speaking activity.

---

## 6. Creating the Invention

Once the student is happy with the two words, they invent a product verbally.

The game itself does **not** provide speaking questions or prompts.

The teacher conducts the conversation naturally.

The teacher may ask about:

- what the invention looks like;
- what it does;
- how it works;
- who would use it;
- why it is useful;
- what happens if something goes wrong;
- why the teacher personally needs it.

These questions are controlled entirely by the teacher and are not displayed by the game.

---

## 7. Naming the Invention

Before completing the sale, the invention should have a name.

Include a text field:

**Invention Name**

The teacher can type the name decided by the student.

The invention cannot be saved until it has a name.

The two generated words should also remain visible during the round.

---

## 8. Making the Sale

When the student has finished presenting and persuading, the teacher chooses one of four buttons:

- **Buy — 5 coins**
- **Buy — 10 coins**
- **Buy — 50 coins**
- **Don't Buy**

### If the Teacher Buys

The game should:

1. add the selected number of coins to the student's balance;
2. save the invention;
3. increase the student's total number of inventions sold;
4. increase total lifetime money earned;
5. check whether an achievement has been unlocked;
6. play a success animation and sound;
7. reset the machine for the next round.

### If the Teacher Does Not Buy

The game should:

1. save the invention as not sold;
2. record the price as `0`;
3. play a short unsuccessful-sale animation/sound;
4. reset the machine for the next round.

There is no built-in second persuasion attempt.

The teacher can naturally allow another argument before clicking a result if desired.

---

## 9. Round Reset

After a sale decision:

- both word slots become empty;
- the invention name field clears;
- buy buttons become inactive until a new invention is ready;
- the machine returns to its starting state.

The student must then pull both levers again.

Each new lever pull costs 1 coin.

---

## 10. Student Profiles

Progress must be saved separately for each student.

The game will use Firebase for authentication and stored data.

### Login Experience

The visible login system should use:

- **Username**
- **Password**

Students should not need to enter or manage an email address.

### Important Firebase Implementation Note

Firebase Authentication's standard password login is based on email/password rather than native username/password authentication.

The implementation should therefore preserve a username/password experience for the user while handling Firebase authentication behind the scenes.

Possible implementation approaches include:

1. mapping usernames to internal generated authentication identifiers; or
2. using Firebase custom authentication.

The final implementation should avoid storing plain-text passwords in Firestore.

Security should be handled through Firebase Authentication rather than building a homemade password system.

---

## 11. Saved Student Data

Each student profile should store:

### Account

- username
- profile ID
- date created
- selected theme

### Current Game Data

- current coin balance

### Lifetime Statistics

- total inventions created
- total inventions sold
- total coins earned from sales
- total lever pulls
- total coins spent on lever pulls

### Invention History

Each invention record should contain:

- invention ID
- invention name
- word 1
- word 2
- sold: `true / false`
- sale price: `0 / 5 / 10 / 50`
- date created

---

## 12. Invention Collection

Include a **My Inventions** screen.

It should display the student's previous inventions as cards.

Each card should show:

- invention name;
- the two original words;
- whether it sold;
- sale price if sold.

Example:

### Super Backpack

**Words:** backpack + talks  
**Sold:** Yes  
**Price:** 50 coins

Or:

### Flying Spoon

**Words:** spoon + flies  
**Sold:** No

The collection should persist between lessons.

Future versions may add AI-generated invention pictures, but image storage is **not part of the first version**.

---

## 13. Statistics Screen

Include a simple statistics area showing lifetime totals.

Suggested statistics:

- **Inventions Created**
- **Inventions Sold**
- **Coins Earned**
- **Lever Pulls**

The current coin balance should always be visible during gameplay.

---

## 14. Achievements

Achievements are based on lifetime totals and remain unlocked permanently.

Suggested first set:

### First Sale
Sell your first invention.

### Inventor
Create 5 inventions.

### Super Inventor
Create 20 inventions.

### Salesperson
Sell 5 inventions.

### Master Salesperson
Sell 20 inventions.

### Big Sale
Sell an invention for 50 coins.

### Coin Collector
Earn 100 coins from sales.

### Invention Empire
Earn 500 coins from sales.

### Experimenter
Pull the levers 25 times.

### Wild Inventor
Pull the levers 100 times.

Achievements should appear on an **Achievements** screen.

When an achievement is unlocked during play, show a short popup animation.

---

## 15. Main Screens

### A. Login Screen

Contains:

- game logo/title;
- username field;
- password field;
- login button.

Potential future feature:

- teacher-managed student account creation.

---

### B. Main Menu

Contains:

- **Enter the Lab**
- **My Inventions**
- **Achievements**
- **Statistics**
- **Theme**
- **Log Out**

Also show:

- student username;
- current coin balance.

---

### C. Invention Lab Screen

Main gameplay screen.

Contains:

- invention machine;
- two word display windows;
- left lever;
- right lever;
- current coin balance;
- invention name field;
- Buy 5 button;
- Buy 10 button;
- Buy 50 button;
- Don't Buy button;
- navigation back to main menu.

---

### D. My Inventions

Scrollable collection of saved inventions.

---

### E. Achievements

Displays all achievements.

Locked achievements should remain visible but visually locked.

Unlocked achievements should be clearly highlighted.

---

### F. Statistics

Displays lifetime totals.

---

## 16. Word Generation System

The machine uses two independent word lists.

The lists should be stored separately from the main game logic so they are easy to expand later.

Recommended structure:

```text
wordListA
wordListB
```

The two lists can contain different kinds of words.

### Word List A

Mostly objects, animals, places, or things.

Examples:

- backpack
- bicycle
- toothbrush
- robot
- cat
- fridge
- shoes
- umbrella
- sandwich
- pillow
- school
- spaceship

### Word List B

Abilities, properties, actions, users, or unusual concepts.

Examples:

- talks
- flies
- invisible
- sings
- for cats
- reads minds
- changes colour
- makes food
- follows you
- underwater
- controls time
- never breaks

This approach creates combinations such as:

- shoes + for cats;
- fridge + follows you;
- umbrella + controls time;
- pillow + reads minds.

The word lists should be curated rather than completely random dictionaries.

The goal is to produce strange but usable invention ideas.

---

## 17. Duplicate Handling

Within a single round:

- rerolling a lever should ideally produce a different word from the one currently displayed.

Across different rounds:

- repeated words are allowed.

The same exact two-word combination should be allowed to occur again eventually.

No complicated duplicate-prevention system is required.

---

## 18. Themes

The game should include three complete visual themes.

A **Theme Toggle** control allows the teacher to switch between them.

The selected theme should be saved to the student's profile.

### Theme 1 — Colourful Cartoon Lab

Style:

- bright;
- playful;
- chunky controls;
- cartoon machinery;
- colourful pipes;
- friendly laboratory atmosphere;
- oversized mechanical levers;
- fun animations.

The interface should feel appropriate for children without looking aimed at very young children.

---

### Theme 2 — Futuristic Lab

Style:

- sleek;
- sci-fi;
- glowing screens;
- holographic-style panels;
- futuristic machine;
- digital displays;
- mechanical or electronic lever effects.

The machine should feel like advanced invention technology.

---

### Theme 3 — Magic Machine

Style:

- magical workshop;
- glowing symbols;
- mysterious machine;
- magical energy;
- enchanted levers;
- sparks, stars, smoke, or magical particles;
- fantasy-inspired interface.

The functionality remains exactly the same in every theme.

Only presentation changes.

---

## 19. Animation

Animations should make the machine feel physical and fun.

Recommended animations:

### Lever Pull

When a lever is activated:

1. lever moves down;
2. machine shakes slightly;
3. gears/lights animate;
4. word display cycles rapidly;
5. final word appears.

### Successful Sale

When a teacher buys:

- coins burst or fall across the screen;
- coin balance visibly increases;
- machine lights flash;
- a short celebratory effect appears.

A 50-coin sale can have a larger celebration than a 5-coin sale.

### Don't Buy

Keep this playful rather than negative.

Possible effect:

- machine makes a small "bonk" or puff;
- lights briefly dim;
- invention card slides into the collection.

Avoid failure screens or language that could embarrass the student.

### Achievement

When an achievement unlocks:

- badge appears;
- sparkle animation;
- short achievement sound.

---

## 20. Sound

Sound should enhance the machine without interrupting conversation.

Suggested sounds:

- lever clunk;
- gears/mechanical movement;
- random-word reveal;
- coin sound;
- successful sale;
- 50-coin jackpot-style success;
- achievement unlock;
- gentle unsuccessful-sale sound.

Include a visible **Sound On/Off** control.

Sound preference should persist locally or in the student profile.

Avoid background music by default because the game is used during live conversation lessons.

---

## 21. Responsive Layout

Primary target:

- laptop/desktop Chrome browser during screen sharing.

The design should prioritize approximately:

- 1366×768
- 1440×900
- 1920×1080

The main invention machine should fit on screen without requiring scrolling during gameplay.

Mobile support is not a priority for the first version.

---

## 22. Technology Plan

Recommended stack:

- HTML
- CSS
- JavaScript
- Firebase Authentication
- Cloud Firestore
- GitHub Pages hosting

Avoid frameworks unless they provide a clear benefit.

A simple JavaScript application will be easier to:

- understand;
- debug with AI;
- host on GitHub Pages;
- edit later.

---

## 23. Suggested Code Structure

```text
/invention-lab
│
├── index.html
├── css/
│   ├── base.css
│   ├── lab.css
│   └── themes.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── firebase.js
│   ├── game.js
│   ├── words.js
│   ├── achievements.js
│   ├── storage.js
│   ├── sounds.js
│   └── themes.js
│
├── assets/
│   ├── images/
│   ├── sounds/
│   └── icons/
│
└── game-plan.md
```

Keep major systems separated so AI-generated changes do not require editing one very large JavaScript file.

---

## 24. Firebase Data Structure

Suggested Firestore structure:

```text
users/
  {userId}/
    profile
      username
      coins
      theme
      soundEnabled
      createdAt

    stats
      inventionsCreated
      inventionsSold
      coinsEarned
      leverPulls
      coinsSpent

    inventions/
      {inventionId}
        name
        word1
        word2
        sold
        salePrice
        createdAt

    achievements/
      {achievementId}
        unlocked
        unlockedAt
```

Exact structure may be adjusted during implementation.

---

## 25. Game State

During an active round, JavaScript should track:

```text
word1
word2
inventionName
currentCoins
roundActive
```

Buttons should change availability depending on state.

Example:

Before pulling levers:

- Buy buttons disabled.

After only one lever:

- Buy buttons disabled.

After both words exist:

- invention can be discussed;
- sale buttons remain disabled until an invention name is entered.

After entering invention name:

- sale buttons enabled.

After sale result:

- round state resets.

---

## 26. Preventing Accidental Clicks

Because coins are spent when levers are pulled:

- disable a lever while its animation is running;
- prevent double clicks;
- update the Firestore balance safely;
- do not allow the balance to become negative.

Sale buttons should also disable immediately after being clicked to prevent the same invention being saved twice.

---

## 27. First-Version Scope

### Include

- username/password login experience;
- student profiles;
- Firebase data storage;
- coin balance;
- two independent levers;
- random word generation;
- unlimited rerolls while coins are available;
- 1-coin lever cost;
- invention naming;
- 5 / 10 / 50 coin sale buttons;
- Don't Buy button;
- saved invention history;
- lifetime statistics;
- achievements;
- three visual themes;
- theme switching;
- animations;
- sound effects;
- sound toggle;
- persistent student progress.

### Do Not Include Yet

- AI image generation;
- image uploads;
- AI-generated questions;
- teacher objections;
- difficulty levels;
- multiplayer;
- student-controlled devices;
- classroom/group mode;
- timer;
- reading or grammar tasks;
- built-in speaking prompts;
- public leaderboards.

These can be considered later without making the first version unnecessarily complex.

---

## 28. Development Order

Build the game in stages.

**Important:** Login and authentication should be left until the end. The game should first be built and tested without requiring a login.

### Phase 1 — Basic Machine

Build:

- main layout;
- two word slots;
- two levers;
- random word generation;
- coin display;
- lever cost.

Test the core machine before adding any account system.

### Phase 2 — Round System

Add:

- invention name;
- Buy 5;
- Buy 10;
- Buy 50;
- Don't Buy;
- round reset;
- statistics calculation.

### Phase 3 — Local Game Data

Before connecting Firebase, make sure the game can correctly manage:

- current coin balance;
- invention history;
- lifetime statistics;
- achievements;
- theme choice;
- sound preference.

During development, this data can be stored temporarily in browser storage or mock data.

### Phase 4 — Collection and Achievements

Add:

- My Inventions screen;
- achievement system;
- statistics screen.

### Phase 5 — Themes

Build:

1. colourful cartoon;
2. futuristic;
3. magic machine.

Keep the underlying HTML/game logic shared between themes.

### Phase 6 — Polish

Add:

- animations;
- sound;
- responsive adjustments;
- loading states;
- error messages;
- protection against accidental double clicks.

### Phase 7 — Firebase Data Storage

Once the game itself is stable, connect the existing game data to Firestore.

Add:

- student profile data;
- saved coin balance;
- invention history;
- saved statistics;
- saved achievements;
- saved theme and sound preferences.

The game should already work correctly before this phase. Firebase should replace temporary/local development storage rather than being tightly coupled to the core gameplay.

### Phase 8 — Login and Authentication

**This is the final development phase.**

Only after the rest of the game is complete and working should authentication be added.

Add:

- username/password login experience;
- Firebase Authentication or the chosen secure authentication method;
- linking each student's saved Firestore data to their account;
- login/logout handling;
- account-related error messages.

Do not make earlier development phases depend on the login system.

---

## 29. Design Principle

The interface should support the conversation rather than dominate it.

The game provides:

- the random idea;
- the visual machine;
- the economy;
- the sale decision;
- the student's collection and progress.

The teacher and student provide the actual conversation.

Avoid adding excessive instructions, text, popups, or game mechanics that interrupt speaking.

The machine should create a playful reason to talk, not turn the lesson into a computer game with occasional speaking.

---

## 30. Core Rule Summary

- Two independent random-word levers.
- Each lever pull costs 1 coin.
- Either word can be rerolled independently.
- Rerolls are unlimited while coins remain.
- Student creates and names an invention.
- Student verbally tries to sell it to the teacher.
- Teacher chooses:
  - Buy for 5 coins;
  - Buy for 10 coins;
  - Buy for 50 coins;
  - Don't Buy.
- Result is saved.
- Student totals and achievements update.
- Machine resets.
- The next round begins with two new lever pulls.
- Progress persists through the student's Firebase profile.
