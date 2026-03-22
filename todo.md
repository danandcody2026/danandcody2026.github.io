# Wedding Website — To Do

## Schedule (plan.html)
- [ ] **Sunday plan** — confirm beach location and add it to the Sunday section. Currently reads "Beach BBQ brunch. More information coming soon." Update once details are locked in.

## Content / Copy
- [ ] Review all pages for any remaining placeholder text or TBD details.

## Code / Housekeeping
- [x] **Remove unused files** — audited `assets/` and project root. Deleted `accomodation.png`, `location.png`, `weekend.png`, and `todo.txt`.
- [x] **Remove unused code** — stripped dead JS (old email sign-up handler, camping form handler, unused scroll-to-top handler) and dead CSS classes (schedule, plan, wavy divider, venue directions, scroll-to-top, unused registry/onsite variants, etc.).
- [x] `logistics.html` was deleted — confirmed no remaining links to it across the site.
- [x] **Privacy audit** — removed hardcoded invite code `3606` from `scripts.js`. The complimentary accommodation price-line logic now checks whether the guest's cost is zero (from the API response) rather than matching a specific code in public JS.

## Features (post-launch)
- [ ] Confirm Sunday beach BBQ details and update plan.html Sunday section.
- [ ] Consider adding a map/directions for the Sunday beach location once confirmed.
