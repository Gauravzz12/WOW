const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = [
  "c:/WOW/web/src/components/SponsoredGrid.tsx",
  "c:/WOW/web/src/components/QueueTabs.tsx",
  "c:/WOW/web/src/app/waiting-room/page.tsx",
  "c:/WOW/web/src/app/w/[id]/actions.ts",
  "c:/WOW/web/src/app/w/[id]/opengraph-image.tsx",
  "c:/WOW/web/src/app/w/[id]/page.tsx",
  "c:/WOW/web/src/app/leaderboard/LeaderboardView.tsx",
  "c:/WOW/web/src/app/create/page.tsx",
  "c:/WOW/web/src/app/create/actions.ts",
  "c:/WOW/web/src/app/checkout/[id]/CheckoutForm.tsx",
  "c:/WOW/web/src/app/checkout/[id]/page.tsx",
  "c:/WOW/web/src/app/api/webhooks/stripe/route.ts",
  "c:/WOW/web/src/app/admin/(dashboard)/MessageModerationTable.tsx"
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace exactly "$1" with "$3"
    // We should be careful about replaceAll replacing "$1" which is regex group. 
    // Wait, in string.replaceAll('$1', '$3') it should just literally replace.
    // Or content.split('$1').join('$3')
    const original = content;
    content = content.split('$1').join('$3');
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  }
}
